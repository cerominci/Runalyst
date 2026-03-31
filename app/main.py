from fastapi import FastAPI
from app.routes import router as analysis_router

app = FastAPI(
    title="LLM Test Backend",
    version="1.0.0"
)

app.include_router(analysis_router)


@app.get("/health")
def health():
    return {"status": "ok"}