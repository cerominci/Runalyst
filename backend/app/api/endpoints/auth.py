from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.deps.db import get_db
from app.schemas.auth import SignUpIn, Token
from app.schemas.user import UserOut
from app.services.auth import service as auth_service
from app.schemas.auth import GoogleAuthIn, AppleAuthIn

router = APIRouter()

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(payload: SignUpIn, db: Session = Depends(get_db)):
    return auth_service.register_user(db, payload=payload)


@router.post("/login", response_model=Token)
def login(payload: SignUpIn, db: Session = Depends(get_db)):
    return auth_service.authenticate_user(db, payload=payload)

@router.post("/google", response_model=Token)
def google_login(payload: GoogleAuthIn, db: Session = Depends(get_db)):
    token = auth_service.process_google_auth(db, token=payload.token)
    return Token(access_token=token)

@router.post("/apple", response_model=Token)
def apple_login(payload: AppleAuthIn, db: Session = Depends(get_db)):
    token = auth_service.process_apple_auth(
        db,
        identity_token=payload.identity_token,
        email_hint=payload.email
    )
    return Token(access_token=token)