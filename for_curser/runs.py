from app.services.run import service as run_service
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.deps.db import get_db
from app.deps.auth import get_current_user_id
from app.schemas.run import RunCreateIn, RunOut

router = APIRouter()

@router.post("/upload-url", status_code=status.HTTP_200_OK)
def generate_run_upload_url(user_id: int = Depends(get_current_user_id)):
    return run_service.get_upload_url(user_id=user_id)

@router.post("/create-record", response_model=RunOut, status_code=status.HTTP_201_CREATED)
def create_run(
    payload: RunCreateIn,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return run_service.create_run_record(db, user_id=user_id, payload=payload)

@router.get("/get", response_model=RunOut)
def get_run(
    run_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return run_service.get_run_details(db, run_id=run_id, user_id=user_id)

@router.patch("/update-status", response_model=RunOut)
def update_status(
    run_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return run_service.update_run_status(db, run_id=run_id, user_id=user_id, new_status=new_status)