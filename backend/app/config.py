import os
import secrets
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "DecisionOS"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(64))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    COOKIE_SECURE: bool = False

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./decisionos.db")
    SYNC_DATABASE_URL: str = os.getenv("SYNC_DATABASE_URL", "sqlite:///./decisionos.db")

    # Vector DB / Chroma
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

    # LLM Settings
    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "simulated")  # "ollama", "openai", "simulated"
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str) and not value.lstrip().startswith("["):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def use_async_postgres_driver(cls, value: str) -> str:
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+asyncpg://", 1)
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+asyncpg://", 1)
        return value

    @field_validator("SECRET_KEY", mode="after")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        if os.getenv("ENVIRONMENT", "development").lower() == "production" and len(value) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters in production")
        return value

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def validate_production_database(cls, value: str) -> str:
        if os.getenv("ENVIRONMENT", "development").lower() == "production" and not value.startswith("postgresql+asyncpg://"):
            raise ValueError("Production deployments require PostgreSQL with the asyncpg driver")
        return value

settings = Settings()
