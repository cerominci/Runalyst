# app/core/config.py
import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()  # read .env in dev

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:postgres@localhost:5432/postgres",
    )

settings = Settings()
