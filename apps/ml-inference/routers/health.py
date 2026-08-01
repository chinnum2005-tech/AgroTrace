from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ndvi_service import get_ndvi_for_area

router = APIRouter(prefix="/health", tags=["Crop Health"])

class NdviHealthRequest(BaseModel):
    farmId: str
    lat: float
    lng: float
    areaHectares: float
    historicalNdvi: list[float] = []

class NdviHealthResponse(BaseModel):
    ndviScore: float
    cloudCoverPct: float
    status: str
    cause: str
    confidence: float
    source: str
    satelliteId: str

@router.post("/ndvi-health", response_model=NdviHealthResponse)
async def assess_crop_health(req: NdviHealthRequest):
    try:
        # 1. Fetch NDVI for the specified area
        ndvi_data = get_ndvi_for_area(req.lat, req.lng, req.areaHectares)
        score = ndvi_data["ndviScore"]
        
        # 2. Rule-based Crop Health Detection (Trend-aware)
        is_sustained_low = False
        is_drastic_drop = False

        if req.historicalNdvi and len(req.historicalNdvi) > 0:
            avg_60_day = sum(req.historicalNdvi) / len(req.historicalNdvi)
            # Check >20% drop vs trailing average
            if score < (avg_60_day * 0.8):
                is_drastic_drop = True
            
            # Check sustained low (< 0.3 for this reading AND the immediate prior one)
            if score < 0.3 and req.historicalNdvi[-1] < 0.3:
                is_sustained_low = True

        if is_sustained_low or score < 0.3:
            status = "CRITICAL"
            cause = "Sustained critical stress or severe damage"
        elif is_drastic_drop or 0.3 <= score < 0.65:
            status = "STRESSED"
            cause = "Sudden drop (>20%) vs average, possible water/nutrient stress"
        else:
            status = "HEALTHY"
            cause = "None"
            
        return NdviHealthResponse(
            ndviScore=score,
            cloudCoverPct=ndvi_data["cloudCoverPct"],
            status=status,
            cause=cause,
            confidence=0.85, # Base confidence for rule-based
            source=ndvi_data["source"],
            satelliteId=ndvi_data["satelliteId"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
