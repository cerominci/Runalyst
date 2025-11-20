from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.deps.db import get_db
from app.models.user import User
from app.auth.schemas import SignUpIn, TokenOut, UserOut
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.auth.schemas import PasswordResetRequestIn, PasswordResetIn
from app.core.security import create_password_reset_token, decode_password_reset_token

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
def me(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db)
):
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User inactive or not found"
        )
    
    # FIX: Return the ORM object directly here too
    return user

@router.post("/test")
def test_endpoint():
    return {"msg": "Test endpoint is working!"}

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
        credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
        db: Session = Depends(get_db)
):
    """
    Delete the currently authenticated user's account.
    """
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    user_id = decode_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User inactive or not found"
        )

    try:
        db.delete(user)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during user deletion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )

    return {"detail": "Account deleted successfully"}