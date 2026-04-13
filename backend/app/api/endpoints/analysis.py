from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.deps.db import get_db
from app.deps.auth import get_current_user_id
from app.schemas.analysis import AnalysisCreateIn, AnalysisOut
from app.services.analysis import service as analysis_service

router = APIRouter()

@router.post("/save-result", response_model=AnalysisOut, status_code=status.HTTP_201_CREATED)
def save_result(
    payload: AnalysisCreateIn,
    db: Session = Depends(get_db)
):
    return analysis_service.create_analysis_result(db, payload=payload)

@router.get("/get", response_model=AnalysisOut)
def get_analysis(
    run_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return analysis_service.get_run_analysis(db, run_id=run_id, user_id=user_id)

@router.get("/history", response_model=List[AnalysisOut])
def get_history(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return analysis_service.get_user_history(db, user_id=user_id)