from fastapi import APIRouter
from app.schemas import AnalysisFeedbackRequest, AnalysisFeedbackResponse
from app.service import generate_analysis_feedback

router = APIRouter(prefix="/analysis", tags=["analysis-llm"])


@router.post("/feedback", response_model=AnalysisFeedbackResponse)
def analysis_feedback(request: AnalysisFeedbackRequest):
    return generate_analysis_feedback(request)