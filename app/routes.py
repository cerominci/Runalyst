from fastapi import APIRouter
from app.schemas import (
    AnalysisFeedbackRequest,
    AnalysisFeedbackResponse,
    ExerciseRecommendationResponse,
)
from app.service import generate_analysis_feedback
from app.exercise_service import generate_exercise_recommendations

router = APIRouter(prefix="/analysis", tags=["analysis-llm"])


@router.post("/feedback", response_model=AnalysisFeedbackResponse)
def analysis_feedback(request: AnalysisFeedbackRequest):
    return generate_analysis_feedback(request)


@router.post("/exercises", response_model=ExerciseRecommendationResponse)
def exercise_recommendations(request: AnalysisFeedbackRequest):
    return generate_exercise_recommendations(request)