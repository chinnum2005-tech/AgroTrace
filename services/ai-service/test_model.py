import os
import torch
from models.disease_predictor import DiseasePredictor

def test():
    print("Initializing Predictor...")
    predictor = DiseasePredictor()
    print(f"Model Loaded: {predictor.model_loaded}")
    
    # Create a dummy white image
    from PIL import Image
    import io
    img = Image.new('RGB', (224, 224), color='white')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()
    
    print("Running Prediction...")
    result = predictor.predict(img_bytes)
    print(f"Result: {result}")

if __name__ == "__main__":
    test()
