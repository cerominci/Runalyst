from fastapi import Depends, status, APIRouter, HTTPException
from sqlalchemy.orm import Session

from app.analysis.schemas import AnalysisCreateIn, AnalysisOut
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
    # Unpack the Pydantic model into the SQLAlchemy model
    new_result = AnalysisResult(
        run_id=payload.run_id,
        avg_stride_length=payload.avg_stride_length,
        avg_gct=payload.avg_gct,
        avg_speed=payload.avg_speed,
        avg_cadence=payload.avg_cadence,
        details=payload.details
    )

    db.add(new_result)

    # Update the Run status to 'completed' since we have results now!
    run = db.query(Run).filter(Run.id == payload.run_id).first()
    if run:
        run.status = "completed"

    db.commit()
    return {"message": "Analysis saved successfully"}

@router.post("/get", response_model=AnalysisOut, status_code=status.HTTP_200_OK)
def get_analysis(
        run_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    analysis = db.query(AnalysisResult).filter(AnalysisResult.run_id == run_id).first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis results not found for this run."
        )

    run = db.query(Run).filter(Run.id == run_id, Run.user_id == current_user.id).first()

    if not run:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this analysis."
        )

    return analysis
