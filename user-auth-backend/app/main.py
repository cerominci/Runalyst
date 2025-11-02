# app/main.py
from fastapi import FastAPI
from app.db.session import db_ping

app = FastAPI(title="User Auth API")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/health/db")
def health_db():
    return {"database": "ok" if db_ping() else "down"}
