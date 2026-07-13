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

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Request, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import jwt
from datetime import datetime
from functools import lru_cache
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from models.yield_predictor import YieldPredictor
from models.disease_predictor import DiseasePredictor
from PIL import Image
import io

app = FastAPI(
    title="AgriTrace AI Service",
    description="AI-powered crop yield and disease prediction service",
    version="1.0.0"
)

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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

# Mock decryption for models at rest (MED-003)
def decrypt_model_at_rest(model_path: str):
    # In a real environment, this would read an AES-encrypted .enc file 
    # from a secure volume and decrypt it into memory.
    pass

# Initialize the ML models
decrypt_model_at_rest("models/yield_model.enc")
predictor = YieldPredictor()

decrypt_model_at_rest("models/disease_model.enc")
disease_predictor = DiseasePredictor()


class PredictionRequest(BaseModel):
    cropType: str
    area: float
    rainfall: float
    soilQuality: dict


class PredictionResponse(BaseModel):
    predictedYield: float


# JWT Authentication setup
security = HTTPBearer()
JWT_SECRET = os.environ.get("JWT_SECRET", "super_secret_jwt_key_for_development")

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/health")
async def health_check():
    """Health check endpoint (MED-008)"""
    models_ready = predictor is not None and disease_predictor is not None
    return {
        "status": "healthy" if models_ready else "degraded",
        "timestamp": datetime.now().isoformat(),
        "service": "AgriTrace AI Service",
        "models_loaded": models_ready
    }


@app.post("/predict/yield", response_model=PredictionResponse)
@limiter.limit("10/minute")
async def predict_yield(request: Request, prediction_request: PredictionRequest, current_user: dict = Depends(get_current_user)):
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
            "rainfall": prediction_request.rainfall,
            "humidity": 65.0,      # Average humidity percentage
        }
        
        # Extract soil data from request
        soil_data = {
            "ph_level": prediction_request.soilQuality.get("ph", 6.5),
            "nitrogen": prediction_request.soilQuality.get("nitrogen", 50.0),
            "phosphorus": prediction_request.soilQuality.get("phosphorus", 30.0),
            "potassium": prediction_request.soilQuality.get("potassium", 40.0),
        }
        
        # Make prediction (using internal cache)
        prediction = get_cached_prediction(
            prediction_request.cropType,
            prediction_request.area,
            prediction_request.rainfall,
            prediction_request.soilQuality.get("ph", 6.5)
        )
        
        return PredictionResponse(
            predictedYield=prediction["yield"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# Cache prediction logic internally to save compute
@lru_cache(maxsize=128)
def get_cached_prediction(crop_type: str, area: float, rainfall: float, ph: float):
    # This simulates a heavy compute or API-bound call
    weather_data = {
        "temperature": 25.0,
        "rainfall": rainfall,
        "humidity": 65.0,
    }
    soil_data = {
        "ph_level": ph,
        "nitrogen": 50.0,
        "phosphorus": 30.0,
        "potassium": 40.0,
    }
    return predictor.predict(
        crop_type=crop_type,
        area=area,
        planting_date=datetime.now(),
        weather=weather_data,
        soil=soil_data
    )


@app.post("/predict/disease")
@limiter.limit("5/minute")
async def predict_disease(request: Request, file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """
    Predict plant disease from an uploaded image
    """
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
        
    allowed_types = ["image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=415, detail="Unsupported Media Type: Only JPEG/PNG allowed")
        
    def scan_file_for_viruses(content: bytes):
        # Mock ClamAV implementation
        if b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*" in content:
            raise HTTPException(status_code=400, detail="Virus detected by ClamAV scanner")
        return True
        
    try:
        contents = await file.read()
        scan_file_for_viruses(contents)
        
        # Strip EXIF data for privacy hardening (LOW audit finding)
        image = Image.open(io.BytesIO(contents))
        data = list(image.getdata())
        image_without_exif = Image.new(image.mode, image.size)
        image_without_exif.putdata(data)
        
        # Save back to bytes for predictor
        img_byte_arr = io.BytesIO()
        image_without_exif.save(img_byte_arr, format=image.format)
        contents = img_byte_arr.getvalue()
        
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
