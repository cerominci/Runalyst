from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.crud import analysis_result as crud_analysis
from app.crud import run as crud_run
from app.schemas.analysis import AnalysisCreateIn, AnalysisOut
from typing import List


def create_analysis_result(db: Session, *, payload: AnalysisCreateIn) -> AnalysisOut:
    run_obj = crud_run.get_run(db, run_id=payload.run_id)
    if not run_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated run not found"
        )

    try:
        analysis_data = payload.model_dump()

        existing_result = crud_analysis.get_by_run_id(db, run_id=payload.run_id)

        if existing_result:
            new_result = crud_analysis.update(db, db_obj=existing_result, obj_in=analysis_data)
        else:
            new_result = crud_analysis.create(db, obj_in=analysis_data)

        crud_run.update_run_status(db, db_obj=run_obj, status="completed")

        db.commit()
        db.refresh(new_result)
        return new_result

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist analysis results"
        )


def get_run_analysis(db: Session, *, run_id: int, user_id: int) -> AnalysisOut:
    result = crud_analysis.get_by_run_id(db, run_id=run_id)

    if not result or result.owner.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis result not found"
        )
    return result


def get_user_history(db: Session, *, user_id: int) -> List[AnalysisOut]:
    return crud_analysis.get_multi_by_user(db, user_id=user_id)