from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
from datetime import datetime
import os

from models.yield_predictor import YieldPredictor

app = FastAPI(
    title="AgriTrace AI Service",
    description="AI-powered crop yield prediction service",
    version="1.0.0"
)

# Initialize the ML model
predictor = YieldPredictor()


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
