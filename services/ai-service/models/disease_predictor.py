import os
# Block TensorFlow BEFORE anything else — prevents DLL crash on Windows
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

import sys

# Pre-block tensorflow import to avoid DLL initialization crash
class _BlockTF:
    """Dummy module that prevents tensorflow from being imported."""
    def __getattr__(self, name):
        raise ImportError("TensorFlow blocked (PyTorch-only mode)")

if 'tensorflow' not in sys.modules:
    sys.modules['tensorflow'] = _BlockTF()  # type: ignore

from PIL import Image
import io
import hashlib


class DiseasePredictor:
    def __init__(self):
        self.device = "cpu"
        # Full 38 classes from PlantVillage dataset
        self.classes = [
            "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
            "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
            "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
            "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy", "Grape___Black_rot",
            "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
            "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
            "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy", "Potato___Early_blight",
            "Potato___Late_blight", "Potato___healthy", "Raspberry___healthy", "Soybean___healthy",
            "Squash___Powdery_mildew", "Strawberry___Leaf_scorch", "Strawberry___healthy",
            "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold",
            "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
            "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus",
            "Tomato___healthy"
        ]

        self.model = None
        self.model_loaded = False
        self.transform = None
        self._torch_model = None
        self._extractor = None

    def _load_model(self):
        """
        Try to load the PlantVillage MobileNetV2 model using pure PyTorch.
        """
        try:
            from transformers import AutoFeatureExtractor, AutoModelForImageClassification

            print("Loading PlantVillage MobileNetV2 model (PyTorch only)...")
            model_id = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"

            self._extractor = AutoFeatureExtractor.from_pretrained(model_id)
            self._torch_model = AutoModelForImageClassification.from_pretrained(model_id)
            self._torch_model.eval()
            self._torch_model.to(self.device)
            self.model_loaded = True
            print("PlantVillage MobileNetV2 loaded successfully.")
        except Exception as e:
            print(f"Warning: Could not load HuggingFace PlantVillage model: {e}")
            self.model_loaded = False

    def predict(self, image_bytes: bytes) -> dict:
        if not self.model_loaded:
            self._load_model()
        """
        Predict the disease from an image. Returns top 3 predictions.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        except Exception as e:
            raise ValueError(f"Invalid image format: {e}")

        if not self.model_loaded:
            raise RuntimeError("Plant disease classification model is currently unavailable or transformers not installed.")

        try:
            import torch
            import torch.nn.functional as F

            inputs = self._extractor(images=image, return_tensors="pt")
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self._torch_model(**inputs)
                logits = outputs.logits
                probs = F.softmax(logits, dim=-1)[0]

            # Get top 3
            top3_probs, top3_idxs = torch.topk(probs, 3)

            predictions = []
            for prob, idx in zip(top3_probs.tolist(), top3_idxs.tolist()):
                label = self._id2label.get(idx, f"Class_{idx}")
                predictions.append({
                    "disease_id": label,
                    "confidence": round(prob * 100, 1)
                })

            top_result = predictions[0] if predictions else {"disease_id": "Unknown", "confidence": 0}

            return {
                "disease_id": top_result["disease_id"],
                "confidence": top_result["confidence"],
                "top_3": predictions
            }

        except Exception as e:
            raise RuntimeError(f"Image classifier inference failed: {str(e)}")
