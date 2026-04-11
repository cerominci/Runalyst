from fastapi import APIRouter, HTTPException
from app.schemas import ChatRequest, ChatResponse
from app.chat_service import chat

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/ask", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest) -> ChatResponse:
    try:
        return chat(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
