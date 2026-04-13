from fastapi import APIRouter
from app.api.endpoints import auth, users, profiles, runs, analysis

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(runs.router, prefix="/runs", tags=["runs"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])