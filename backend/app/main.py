import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database.session import async_engine
from app.routers import auth, users, decisions, boardroom, memory

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("decisionos")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    logger.info("DecisionOS application ready; database schema is managed by Alembic.")
    yield
    logger.info("Shutting down DecisionOS Application...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Agent Strategic Intelligence Platform - Personal Board of Directors",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(decisions.router, prefix=settings.API_V1_STR)
app.include_router(boardroom.router, prefix=settings.API_V1_STR)
app.include_router(memory.router, prefix=settings.API_V1_STR)

@app.get("/")
@app.get("/api")
@app.get("/api/")
async def root():
    return {
        "app": "DecisionOS API",
        "version": "1.0.0",
        "description": "Multi-Agent Strategic Intelligence Platform - Personal Board of Directors",
        "status": "online & healthy",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

@app.get("/api/health")
async def health_check():
    try:
        async with async_engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    except Exception as exc:
        logger.exception("Health check database probe failed")
        raise HTTPException(status_code=503, detail="Database health check failed") from exc

    return {
        "status": "healthy",
        "llm_provider": settings.DEFAULT_LLM_PROVIDER,
        "database": "reachable",
        "vector_store": "chromadb"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
