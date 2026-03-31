from typing import Any, Dict, Optional
from pydantic import BaseModel


class AnalysisFeedbackRequest(BaseModel):
    knee_result: Optional[Dict[str, Any]] = None
    trunk_result: Optional[Dict[str, Any]] = None
    pelvis_result: Optional[Any] = None
    runner_context: Optional[Dict[str, Any]] = None
    video_metadata: Optional[Dict[str, Any]] = None


class AnalysisFeedbackResponse(BaseModel):
    payload: Dict[str, Any]
    prompt: str
    llm_feedback: Dict[str, Any]