from app.core.google_oauth import verify_google_token
from app.auth.schemas import TokenOut
from app.models.user import User
from app.core.security import create_access_token
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from app.deps.db import get_db
from pydantic import BaseModel

class GoogleAuthIn(BaseModel):
    token: str

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/google", response_model=TokenOut)
def google_auth(payload: GoogleAuthIn, db: Session = Depends(get_db)):
    info = verify_google_token(payload.token)

    user = db.query(User).filter(User.email == info["email"]).first()
    if not user:
        user = User(
            email=info["email"],
            google_id=info["google_id"],
            is_active=True,
            auth_provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt = create_access_token(sub=str(user.id))
    return TokenOut(access_token=jwt)
