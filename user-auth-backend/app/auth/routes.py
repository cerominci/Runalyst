import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.deps.auth import get_current_user
from app.deps.db import get_db
from app.models.user import User
from app.auth.schemas import SignUpIn, TokenOut, UserOut
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.auth.schemas import PasswordResetRequestIn, PasswordResetIn
from app.core.security import create_password_reset_token, decode_password_reset_token
from app.services.storage import supabase_client
import os
import time
import requests
from jose import jwt

APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys"
APPLE_ISSUER = "https://appleid.apple.com"

_JWKS_CACHE = None
_JWKS_CACHE_TS = 0
_JWKS_TTL_SECONDS = 60 * 60  # 1 hour


def _get_apple_jwks():
    global _JWKS_CACHE, _JWKS_CACHE_TS
    now = time.time()
    if _JWKS_CACHE and (now - _JWKS_CACHE_TS) < _JWKS_TTL_SECONDS:
        return _JWKS_CACHE

    resp = requests.get(APPLE_JWKS_URL, timeout=10)
    resp.raise_for_status()
    _JWKS_CACHE = resp.json()
    _JWKS_CACHE_TS = now
    return _JWKS_CACHE


def verify_apple_identity_token(identity_token: str, audience: str) -> dict:
    jwks = _get_apple_jwks()
    headers = jwt.get_unverified_header(identity_token)

    kid = headers.get("kid")
    alg = headers.get("alg")
    if not kid or not alg:
        raise ValueError("Invalid Apple token header (missing kid/alg).")

    key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
    if not key:
        raise ValueError("Apple public key not found (kid mismatch).")

    claims = jwt.decode(
        identity_token,
        key,
        algorithms=[alg],
        audience=audience,
        issuer=APPLE_ISSUER,
        options={"verify_aud": True, "verify_iss": True, "verify_exp": True},
    )

    if "sub" not in claims:
        raise ValueError("Apple token missing 'sub' claim.")
    return claims

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer(auto_error=False)


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(payload: SignUpIn, db: Session = Depends(get_db)):
    # Validate password length (bcrypt limit)
    if len(payload.password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot exceed 72 bytes"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    try:
        user = User(email=payload.email, hashed_password=hash_password(payload.password))
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # FIX: Return the ORM object directly. Pydantic's 'from_attributes = True' 
        # (formerly from_orm) will automatically map all fields (id, email, is_active, created_at)
        return user
        
    except Exception as e:
        db.rollback()
        # Log the exception for debugging on your side
        print(f"Error during user creation: {e}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


@router.post("/login", response_model=TokenOut)
def login(payload: SignUpIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    token = create_access_token(sub=str(user.id))
    return TokenOut(access_token=token)

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/test")
def test_endpoint():
    return {"msg": "Test endpoint is working!"}

from app.auth.schemas import AppleAuthIn  # add this with your other schema imports

@router.post("/apple", response_model=TokenOut)
def apple_auth(payload: AppleAuthIn, db: Session = Depends(get_db)):
    """
    Sign-in + Sign-up with Apple:
    - Verify identity_token with Apple
    - Find user by apple_sub
    - If not found, create user (signup)
    - Return your app JWT
    """

    # IMPORTANT: This must be your iOS Bundle ID (aud claim), e.g. "tr.edu.metu.runalyst"
    apple_audience = os.getenv("APPLE_BUNDLE_ID")
    if not apple_audience:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="APPLE_BUNDLE_ID is not set on the server",
        )

    try:
        claims = verify_apple_identity_token(payload.identity_token, audience=apple_audience)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Apple identity token: {str(e)}",
        )

    apple_sub = claims["sub"]

    # Apple sometimes includes email only at first authorization
    email = payload.email or claims.get("email")
    full_name = payload.full_name

    # 1) Existing Apple-linked account?
    user = db.query(User).filter(User.apple_sub == apple_sub).first()

    # 2) If not, create/link
    if not user:
        # Optional: link to an existing email account (only if you want this behavior)
        if email:
            existing_email_user = db.query(User).filter(User.email == email).first()
            if existing_email_user and existing_email_user.apple_sub is None:
                existing_email_user.apple_sub = apple_sub
                if full_name and getattr(existing_email_user, "full_name", None) in (None, ""):
                    existing_email_user.full_name = full_name
                db.add(existing_email_user)
                db.commit()
                db.refresh(existing_email_user)
                user = existing_email_user
            elif existing_email_user and existing_email_user.apple_sub != apple_sub:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already in use by another account.",
                )

        # Still no user -> create new Apple user
        if not user:
            try:
                user = User(
                    email=email,
                    hashed_password=None,  # Apple-only account
                    apple_sub=apple_sub,
                )
                # If your User model has full_name, you can set it:
                if hasattr(user, "full_name"):
                    user.full_name = full_name

                db.add(user)
                db.commit()
                db.refresh(user)
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create Apple user: {str(e)}",
                )

    # 3) Issue your normal token (same style as /login)
    token = create_access_token(sub=str(user.id))
    return TokenOut(access_token=token)

@router.post("/request-password-reset")
def request_password_reset(
        payload: PasswordResetRequestIn,
        db: Session = Depends(get_db)
):
    try:
        user = db.query(User).filter(User.email == payload.email).first()
    except Exception as e:
        print(f"Database error during password reset request: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User email cannot found"
        )
    if not user:
        # Note: We don't want to reveal if an email exists or not
        # for security reasons. So we return a generic success message.
        return {"msg": "If a user with that email exists, a password reset link has been sent."}

    try:
        password_reset_token = create_password_reset_token(email=user.email)
    except Exception as e:
        print(f"Error creating password reset token: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create password reset token"
        )

    # In a real application, you would send the token via email here.
    # For this example, we'll just print it.
    print(f"Password reset token for {user.email}: {password_reset_token}")

    return {"msg": "If a user with that email exists, a password reset link has been sent."}


@router.post("/reset-password")
def reset_password(
        payload: PasswordResetIn,
        db: Session = Depends(get_db)
):
    email = decode_password_reset_token(payload.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Validate new password length
    if len(payload.new_password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot exceed 72 bytes"
        )

    user.hashed_password = hash_password(payload.new_password)
    db.add(user)
    db.commit()

    return {"msg": "Password updated successfully"}


#placeholder account deletion, no email confirmation needed like signup
#will be updated in future together along with signup to include email confirmation flows
@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db.delete(current_user)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during user deletion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )
    return {"detail": "Account deleted successfully"}


@router.post("/generate-upload-url", status_code=status.HTTP_200_OK)
def create_upload_url(current_user: User = Depends(get_current_user)):
    bucket_name = "user_videos_test"
    unique_filename = f"{current_user.id}/{uuid.uuid4()}.mp4"

    try:
        signed_url_response = supabase_client.storage.from_(bucket_name).create_signed_upload_url(
            path=unique_filename
        )
        #print("DEBUG: Supabase response:", signed_url_response)
        return {
            "upload_url": signed_url_response['signed_url'],
            "path": signed_url_response['path']
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create upload URL: {str(e)}"
        )