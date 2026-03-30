from fastapi import Depends, status, APIRouter
from sqlalchemy.orm import Session

from app.analysis.schemas import AnalysisCreateIn
from app.deps.db import get_db
from app.models.analysis_result import AnalysisResult
from app.models.run import Run

router = APIRouter(prefix="/analysis", tags=["analyses"])

@router.post("/analysis", status_code=status.HTTP_201_CREATED)

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