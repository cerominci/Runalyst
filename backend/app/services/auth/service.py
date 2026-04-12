from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.crud import user as crud_user
from app.schemas.auth import SignUpIn, Token
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User


def register_user(db: Session, *, payload: SignUpIn) -> User:
    if crud_user.get_user_by_email(db, email=payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    if len(payload.password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot exceed 72 bytes"
        )

    try:
        hashed_pwd = hash_password(payload.password)
        user = crud_user.create_user(
            db,
            email=payload.email,
            hashed_password=hashed_pwd
        )
        db.commit()
        db.refresh(user)
        return user

    except Exception as e:
        db.rollback()
        # Log the actual error 'e' here for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )


def authenticate_user(db: Session, *, payload: SignUpIn) -> Token:
    user = crud_user.get_user_by_email(db, email=payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )

    access_token = create_access_token(sub=str(user.id))

    return Token(access_token=access_token)