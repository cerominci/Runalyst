# app/db/session.py
from sqlalchemy import create_engine, text
from app.core.config import settings

# One global engine for the process
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

def db_ping() -> bool:
    """Return True if a simple SELECT works, else False."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
