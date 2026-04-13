from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.deps.db import get_db
from app.schemas.auth import SignUpIn, Token
from app.schemas.user import UserOut
from app.services.auth import service as auth_service

router = APIRouter()

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(payload: SignUpIn, db: Session = Depends(get_db)):
    return auth_service.register_user(db, payload=payload)


@router.post("/login", response_model=Token)
def login(payload: SignUpIn, db: Session = Depends(get_db)):
    return auth_service.authenticate_user(db, payload=payload)