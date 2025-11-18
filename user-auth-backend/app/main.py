import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import db_ping
from app.auth.routes import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    from app.db.base import Base
    from app.db.session import engine
    from app.models.user import User  # Import models to register them

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created/verified")
    print("✓ Application started")
    
    yield
    
    # Shutdown
    print("✓ Application shutting down")


app = FastAPI(
    title="User Auth API",
    description="User authentication and authorization API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - configure based on your needs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health():
    """Basic health check endpoint."""
    return {"status": "ok"}


@app.get("/health/db", tags=["health"])
def health_db():
    """Database health check endpoint."""
    db_status = "ok" if db_ping() else "down"
    return {"database": db_status}


# Include routers
app.include_router(auth_router)