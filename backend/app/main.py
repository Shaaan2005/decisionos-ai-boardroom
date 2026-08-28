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
    logger.info("Initializing DecisionOS Database Tables...")
    try:
        from app.database.base import Base
        from app.models.user import User, UserProfile
        from app.models.decision import Decision
        from app.models.report import DecisionReport
        from app.core.security import get_password_hash
        from sqlalchemy.future import select

        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("DecisionOS Database Tables ready.")

        # Seed default demo account if it doesn't exist
        from app.database.session import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            res = await session.execute(select(User).filter(User.email == "demo@decisionos.ai"))
            if not res.scalars().first():
                demo_user = User(
                    email="demo@decisionos.ai",
                    hashed_password=get_password_hash("demouser123"),
                    full_name="Utkarsh Rai"
                )
                session.add(demo_user)
                await session.flush()
                demo_profile = UserProfile(
                    user_id=demo_user.id,
                    current_role="Founder & Full-Stack Engineer",
                    career_goals="Scale scalable AI systems and achieve career independence.",
                    default_risk_tolerance="moderate",
                    core_values=["Learning Velocity", "High Agency", "Autonomy", "Long-term Upside"],
                    personal_context="Building DecisionOS AI Personal Board of Directors."
                )
                session.add(demo_profile)
                await session.commit()
                logger.info("Seeded default demo user account (demo@decisionos.ai).")
    except Exception as e:
        logger.warning(f"Database initialization note: {e}")

    yield
    logger.info("Shutting down DecisionOS Application...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Agent Strategic Intelligence Platform - Personal Board of Directors",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
