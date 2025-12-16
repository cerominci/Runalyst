import os
from fastapi import HTTPException, status
from google.oauth2 import id_token
from google.auth.transport import requests

GOOGLE_WEB_CLIENT_ID = os.getenv("GOOGLE_WEB_CLIENT_ID")  # put this in backend .env

def verify_google_id_token(token: str) -> dict:
    if not GOOGLE_WEB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GOOGLE_WEB_CLIENT_ID is not configured"
        )

    try:
        info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_WEB_CLIENT_ID
        )
        # info contains: sub, email, email_verified, name, picture, etc.
        return info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )
