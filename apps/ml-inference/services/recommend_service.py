import os
import joblib
import pandas as pd
import numpy as np

OUTPUT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(OUTPUT_DIR, "models", "crop_rec_model.pkl")
ENCODER_PATH = os.path.join(OUTPUT_DIR, "models", "crop_label_encoder.pkl")

_model = None
_encoder = None

def get_model():
    global _model, _encoder
    if _model is None or _encoder is None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
            raise FileNotFoundError("Model or Encoder not found. Run train_crop_rec.py first.")
        _model = joblib.load(MODEL_PATH)
        _encoder = joblib.load(ENCODER_PATH)
    return _model, _encoder

def predict_crop(n: float, p: float, k: float, temp: float, humidity: float, ph: float, rainfall: float):
    model, encoder = get_model()
    
    # Feature order must match Kaggle dataset: N, P, K, temperature, humidity, ph, rainfall
    input_df = pd.DataFrame([{
        'N': n,
        'P': p,
        'K': k,
        'temperature': temp,
        'humidity': humidity,
        'ph': ph,
        'rainfall': rainfall
    }])
    
    # Predict probabilities for top crops
    probs = model.predict_proba(input_df)[0]
    
    # Get top 3 indices
    top_3_idx = np.argsort(probs)[::-1][:3]
    
    # Decode labels
    top_3_crops = encoder.inverse_transform(top_3_idx)
    top_3_probs = probs[top_3_idx]
    
    recommended_crop = top_3_crops[0].upper()
    confidence = float(top_3_probs[0])
    
    alternatives = [
        {"crop": top_3_crops[1].upper(), "confidence": float(top_3_probs[1])},
        {"crop": top_3_crops[2].upper(), "confidence": float(top_3_probs[2])}
    ]
    
    return recommended_crop, alternatives, confidence
