import uuid
from fastapi import HTTPException, status
from app.core.supabase_client import supabase_client
from sqlalchemy.orm import Session
from app.schemas.run import RunCreateIn
from app.crud import run as crud_run
from app.services.queue.service import send_message_to_queue


def get_upload_url(*, user_id: int):
    bucket_name = "user_videos_test"
    unique_filename = f"{user_id}/{uuid.uuid4()}.mp4"

    try:
        response = supabase_client.storage.from_(bucket_name).create_signed_upload_url(
            path=unique_filename
        )

        return {
            "upload_url": response['signed_url'],
            "path": response['path']
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to interface with storage provider"
        )


def create_run_record(db: Session, *, user_id: int, payload: RunCreateIn):
    try:
        new_run = crud_run.create_run(
            db,
            user_id=user_id,
            video_path=payload.video_path,
            status="queued",
            title=payload.title
        )

        db.commit()
        db.refresh(new_run)

        message_to_send = {
            "run_id": new_run.id,
            "video_path": new_run.video_path
        }
        send_message_to_queue(message_body=message_to_send)

        return new_run

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save the run record to the database."
        )

def get_run_details(db: Session, *, run_id: int, user_id: int):
    run = crud_run.get_run(db, run_id=run_id)
    if not run or run.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found or access denied"
        )
    return run


def update_run_status(db: Session, *, run_id: int, user_id: int, new_status: str):
    run = crud_run.get_run(db, run_id=run_id)

    if not run or run.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found or access denied"
        )

    try:
        updated_run = crud_run.update_run_status(db, db_obj=run, status=new_status)
        db.commit()
        db.refresh(updated_run)
        return updated_run
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update run status"
        )