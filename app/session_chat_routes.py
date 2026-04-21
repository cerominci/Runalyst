from typing import Any, Dict

from fastapi import APIRouter, HTTPException, UploadFile, File
import json

from app.schemas import SessionCreateResponse, SessionAskRequest, SessionAskResponse
from app.session_chat_service import create_session, ask, delete_session

router = APIRouter(prefix="/session", tags=["session-chat"])


@router.post("/create", response_model=SessionCreateResponse)
async def create_chat_session(file: UploadFile = File(...)) -> SessionCreateResponse:
    """Upload a runner results JSON file and get back a session_id."""
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Only .json files are accepted.")

    raw_bytes = await file.read()
    try:
        data: Dict[str, Any] = json.loads(raw_bytes)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {exc}")

    try:
        session_id = create_session(data)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return SessionCreateResponse(
        session_id=session_id,
        message="Session created. Send questions to /session/{session_id}/ask",
    )


@router.post("/{session_id}/ask", response_model=SessionAskResponse)
def ask_question(session_id: str, request: SessionAskRequest) -> SessionAskResponse:
    """Ask a question within an existing session."""
    try:
        answer = ask(session_id, request.question)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return SessionAskResponse(
        session_id=session_id,
        question=request.question,
        answer=answer,
    )


@router.delete("/{session_id}")
def close_session(session_id: str) -> Dict[str, str]:
    """Delete a session and free its memory."""
    delete_session(session_id)
    return {"message": f"Session '{session_id}' closed."}
