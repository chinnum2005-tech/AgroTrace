from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from services.disease_service import disease_predictor, PLANT_VILLAGE_CLASSES

router = APIRouter(tags=["Crop Disease Detection"])

class PredictionItem(BaseModel):
    disease_id: str
    confidence: float

class DiseasePredictionResponse(BaseModel):
    disease_id: str
    confidence: float
    top_3: List[PredictionItem]

@router.post("/predict/disease", response_model=DiseasePredictionResponse)
async def predict_disease_root(file: UploadFile = File(...)):
    """
    Direct endpoint for frontend: POST /predict/disease
    Receives leaf image and returns top 3 disease predictions + confidence.
    """
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
        result = disease_predictor.predict(contents)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease prediction failed: {str(e)}")

@router.post("/disease/predict", response_model=DiseasePredictionResponse)
async def predict_disease_namespaced(file: UploadFile = File(...)):
    """Namespaced endpoint for API versioning."""
    return await predict_disease_root(file=file)

@router.get("/disease/classes")
async def get_supported_disease_classes():
    """Returns all 38 PlantVillage recognized crop disease classes."""
    return {
        "count": len(PLANT_VILLAGE_CLASSES),
        "classes": PLANT_VILLAGE_CLASSES
    }
