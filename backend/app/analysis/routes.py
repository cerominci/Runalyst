from typing import List

from fastapi import Depends, status, APIRouter, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.analysis.schemas import AnalysisCreateIn, AnalysisOut, AnalysisGetIn
from app.deps.auth import get_current_user
from app.deps.db import get_db
from app.models.analysis_result import AnalysisResult
from app.models.run import Run
from app.models.user import User

router = APIRouter(prefix="/analysis", tags=["analyses"])

@router.post("/save",status_code=status.HTTP_201_CREATED)

def save_analysis_results(
        payload: AnalysisCreateIn,
        db: Session = Depends(get_db)
):
    new_result = AnalysisResult(
        run_id=payload.run_id,
        avg_stride_length=payload.avg_stride_length,
        avg_gct=payload.avg_gct,
        avg_speed=payload.avg_speed,
        avg_cadence=payload.avg_cadence,
        details=payload.details
    )

    db.add(new_result)

    run = db.query(Run).filter(Run.id == payload.run_id).first()
    if run:
        run.status = "completed"

    db.commit()
    return {"message": "Analysis saved successfully"}

@router.post("/get", response_model=AnalysisOut, status_code=status.HTTP_200_OK)
def get_analysis(
        payload: AnalysisGetIn,
        db: Session = Depends(get_db),
        user: User = Depends(get_current_user)
):
    analysis = db.query(AnalysisResult).filter(AnalysisResult.run_id == payload.run_id).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    run = db.query(Run).filter(Run.id == payload.run_id, Run.user_id == user.id).first()
    if not run:
        raise HTTPException(status_code=403, detail="Access denied")

    return analysis


@router.get("/all", response_model=List[AnalysisOut])
def get_all_user_analyses(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    results = (
        db.query(AnalysisResult)
        .join(Run, AnalysisResult.run_id == Run.id)
        .filter(Run.user_id == current_user.id)
        .order_by(desc(AnalysisResult.created_at))
        .all()
    )

    if not results:
        return []

    return results
