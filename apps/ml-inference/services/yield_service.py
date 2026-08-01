import os
import joblib
import pandas as pd
from typing import Dict, Any

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "yield_model.pkl")

# Load model lazily
_model = None

def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Please run generate_synthetic_data.py first.")
        _model = joblib.load(MODEL_PATH)
    return _model

def predict_yield(
    crop_type: str,
    area_hectares: float,
    days_since_sowing: int,
    ndvi_trend: float,
    avg_temp: float,
    cum_rainfall: float
) -> float:
    """
    Predicts yield in kg using the loaded LightGBM model.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # -----------------------------------------
    # FEATURE VALIDATION
    # -----------------------------------------
    if area_hectares <= 0:
        logger.warning(f"Validation Warning: Area {area_hectares} <= 0 is invalid.")
    if cum_rainfall < 0:
        logger.warning(f"Validation Warning: Rainfall {cum_rainfall} cannot be negative.")
    if avg_temp < -10 or avg_temp > 55:
        logger.warning(f"Validation Warning: Temperature {avg_temp}°C is outside expected realistic bounds.")
        
    # Biological validation for NDVI
    if days_since_sowing <= 5 and ndvi_trend > 0.25:
        logger.warning(f"Validation Warning: NDVI {ndvi_trend:.3f} invalid for {days_since_sowing} days old crop. Using baseline 0.15.")
        ndvi_trend = 0.15
    elif days_since_sowing <= 20 and ndvi_trend > 0.50:
        logger.warning(f"Validation Warning: NDVI {ndvi_trend:.3f} invalid for {days_since_sowing} days old crop. Clamping to 0.30.")
        ndvi_trend = 0.30
        
    model = get_model()
    
    # Create a DataFrame for a single prediction row
    input_df = pd.DataFrame([{
        'crop_type': crop_type,
        'area_hectares': area_hectares,
        'days_since_sowing': days_since_sowing,
        'ndvi_trend': ndvi_trend,
        'avg_temp': avg_temp,
        'cum_rainfall': cum_rainfall
    }])
    
    # Cast categorical columns correctly
    input_df['crop_type'] = input_df['crop_type'].astype('category')
    
    # Print statements replaced below
    
    # -----------------------------------------
    # INFERENCE & CLAMPING
    # -----------------------------------------
    prediction = float(model.predict(input_df)[0])
    
    if prediction < 0:
        logger.warning(f"Validation Warning: Model predicted negative yield ({prediction:.2f}). Clamping to 0 kg.")
        prediction = 0.0
        
    final_yield = round(prediction, 2)
    
    # -----------------------------------------
    # CONFIDENCE & OPERATING RANGE
    # -----------------------------------------
    # The LightGBM model was trained on days_since_sowing >= 10.
    if days_since_sowing < 10:
        confidence = "Low"
        message = "Out of Distribution: Crop is too young (<10 days). Predictions are unreliable at this stage."
    else:
        confidence = "High"
        message = "In Distribution: Data falls within expected operating range."
    
    print("\nAI YIELD PREDICTION TRACE LOG", flush=True)
    print("=============================\n", flush=True)
    
    print(f"Crop Type: {crop_type}", flush=True)
    print(f"Area: {area_hectares:.2f} ha\n", flush=True)
    
    print("Weather:", flush=True)
    print(f"Temp {avg_temp:.1f}°C", flush=True)
    print(f"Rain {cum_rainfall:.1f}mm\n", flush=True)
    
    print("Crop Health:", flush=True)
    print(f"NDVI Trend: {ndvi_trend:.3f}", flush=True)
    print(f"Days Sown: {days_since_sowing}\n", flush=True)
    
    print("Confidence:", flush=True)
    print(f"{confidence.upper()}", flush=True)
    print("Reason:", flush=True)
    print(f"{message}\n", flush=True)
    
    print("FINAL YIELD:", flush=True)
    print(f"{final_yield:.2f} kg\n", flush=True)
    
    return {
        "predicted_yield_kg": final_yield,
        "confidence": confidence,
        "message": message
    }
