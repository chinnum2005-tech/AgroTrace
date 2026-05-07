import os
import sys

# === Block TensorFlow BEFORE any other imports (prevents DLL crash on Windows) ===
os.environ["TRANSFORMERS_NO_TF"] = "1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"

class _BlockTF:
    """Prevents tensorflow from being imported at all."""
    def __getattr__(self, name):
        raise ImportError("TensorFlow blocked (PyTorch-only mode)")

if 'tensorflow' not in sys.modules:
    sys.modules['tensorflow'] = _BlockTF()  # type: ignore
# =================================================================================

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
from datetime import datetime

from models.yield_predictor import YieldPredictor
from models.disease_predictor import DiseasePredictor

app = FastAPI(
    title="AgriTrace AI Service",
    description="AI-powered crop yield and disease prediction service",
    version="1.0.0"
)

# Add CORS Middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://192.168.1.9:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the ML models
predictor = YieldPredictor()
disease_predictor = DiseasePredictor()


class PredictionRequest(BaseModel):
    cropType: str
    area: float
    rainfall: float
    soilQuality: dict


class PredictionResponse(BaseModel):
    predictedYield: float


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "AgriTrace AI Service"
    }


@app.post("/predict/yield", response_model=PredictionResponse)
async def predict_yield(request: PredictionRequest):
    """
    Predict crop yield based on various factors
    
    Args:
        cropType: Type of crop (WHEAT, RICE, CORN, etc.)
        area: Area in hectares
        rainfall: Annual rainfall in mm
        soilQuality: Soil quality data (pH, nitrogen, phosphorus, potassium)
    
    Returns:
        Predicted yield in kg/hectare
    """
    try:
        # Default weather data
        weather_data = {
            "temperature": 25.0,  # Average temperature in Celsius
            "rainfall": request.rainfall,
            "humidity": 65.0,      # Average humidity percentage
        }
        
        # Extract soil data from request
        soil_data = {
            "ph_level": request.soilQuality.get("ph", 6.5),
            "nitrogen": request.soilQuality.get("nitrogen", 50.0),
            "phosphorus": request.soilQuality.get("phosphorus", 30.0),
            "potassium": request.soilQuality.get("potassium", 40.0),
        }
        
        # Make prediction
        prediction = predictor.predict(
            crop_type=request.cropType,
            area=request.area,
            planting_date=datetime.now(),
            weather=weather_data,
            soil=soil_data
        )
        
        return PredictionResponse(
            predictedYield=prediction["yield"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...)):
    """
    Predict plant disease from an uploaded image
    """
    try:
        contents = await file.read()
        prediction = disease_predictor.predict(contents)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease prediction failed: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to AgriTrace AI Service",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
