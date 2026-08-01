from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from services.rag_service import rag_service

router = APIRouter(prefix="/api/v1/ml/rag", tags=["RAG"])

class RagQuery(BaseModel):
    query: str
    threshold: Optional[float] = 0.15

class SourceDoc(BaseModel):
    id: str
    title: str
    content: str
    sourceUrl: str
    sourceDate: str
    score: float

class RagResponse(BaseModel):
    query: str
    matches: List[SourceDoc]
    is_confident: bool

@router.post("/search", response_model=RagResponse)
async def search_knowledge_base(request: RagQuery):
    matches = rag_service.search(request.query, request.threshold)
    return RagResponse(
        query=request.query,
        matches=matches,
        is_confident=len(matches) > 0
    )
