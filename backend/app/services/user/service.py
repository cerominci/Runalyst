from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.crud import user as crud_user
from app.schemas.user import  UserUpdateIn
from app.core.security import hash_password, verify_password
from app.models.user import User

def get_user(db: Session, *, user_id: int) -> User:
    user = crud_user.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account is disabled"
        )
    return user

def get_user_with_profile(db: Session, *, user_id: int) -> User:
    user = crud_user.get_user_with_profile(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

def remove_account(db: Session, *, user_id: int) -> None:
    user = crud_user.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    try:
        crud_user.delete_user(db, db_obj=user)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete account"
        )

def update_user_account(db: Session, *, user_id: int, payload: UserUpdateIn) -> User:
    db_obj = crud_user.get_user_by_id(db, user_id=user_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    update_data = payload.model_dump(exclude_unset=True)
    current_password = update_data.pop("current_password", None)

    if "password" in update_data:
        if not db_obj.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account has no password to change (signed in via Google/Apple)"
            )
        if not current_password or not verify_password(current_password, db_obj.hashed_password):
            # 400, not 401: this isn't a session/token problem, and the client
            # treats 401 as "access token expired" and auto-retries via refresh.
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        if len(update_data["password"]) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters"
            )
        if len(update_data["password"].encode('utf-8')) > 72:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password cannot exceed 72 bytes"
            )

        update_data["hashed_password"] = hash_password(update_data["password"])
        del update_data["password"]

    if "email" in update_data and update_data["email"] != db_obj.email:
        if crud_user.get_user_by_email(db, email=update_data["email"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )

    try:
        updated_user = crud_user.update_user(db, db_obj=db_obj, obj_in=update_data)
        db.commit()
        db.refresh(updated_user)
        return updated_user
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user account"
        )