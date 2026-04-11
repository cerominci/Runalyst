from fastapi import FastAPI
from app.routes import router as analysis_router
from app.chat_routes import router as chat_router

app = FastAPI(
    title="LLM Test Backend",
    version="1.0.0"
)

app.include_router(analysis_router)
app.include_router(chat_router)


@app.get("/health")
def health():
    return {"status": "ok"}