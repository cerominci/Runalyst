from typing import Any, Dict, List, Optional
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


# --- Chat / historical feedback schemas ---

class ChatRequest(BaseModel):
    user_id: str
    question: str


class ChatResponse(BaseModel):
    question: str
    n_runs_considered: int
    answer: str


# --- Session-based chat schemas ---

class SessionCreateResponse(BaseModel):
    session_id: str
    message: str


class SessionAskRequest(BaseModel):
    question: str


class SessionAskResponse(BaseModel):
    session_id: str
    question: str
    answer: str


# --- Exercise recommendation schemas ---

class ExerciseRecommendationResponse(BaseModel):
    flagged_issues: List[Dict[str, Any]]
    exercise_plan: Dict[str, Any]