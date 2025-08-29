from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator
import os
from pathlib import Path

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Healer Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False)
    ENVIRONMENT: str = Field(default="development")
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Mental Health Support Platform"
    
    # Server
    FASTAPI_HOST: str = Field(default="0.0.0.0")
    FASTAPI_PORT: int = Field(default=8000)
    
    # CORS
    CORS_ORIGINS: List[str] = Field(default=["http://localhost:3000"])
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ENCRYPTION_KEY: str
    
    # Database
    MONGODB_URL: str
    DATABASE_NAME: str = "healer_platform"
    
    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379")
    REDIS_DB: int = Field(default=0)
    
    # AI Configuration
    GEMINI_API_KEY: str
    MODEL: str = Field(default="gemini-2.0-flash-exp")
    
    # Pinecone
    PINECONE_API_KEY: str
    PINECONE_INDEX: str = Field(default="mental-health-rag")
    PINECONE_DIMENSION: int = Field(default=768)
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=30)
    RATE_LIMIT_PER_HOUR: int = Field(default=500)
    
    # Crisis Intervention
    CRISIS_HOTLINE_NUMBER: str = Field(default="988")
    EMERGENCY_CONTACT_EMAIL: str = Field(default="emergency@healer-platform.com")
    
    # Crisis Keywords
    CRISIS_KEYWORDS: List[str] = Field(default=[
        "suicide", "kill myself", "end my life", "not worth living",
        "self harm", "cutting", "overdose", "want to die",
        "hurt myself", "no point in living", "better off dead"
    ])
    
    # Therapeutic Resources
    RESOURCE_CATEGORIES: List[str] = Field(default=[
        "anxiety", "depression", "stress", "trauma", "grief",
        "relationships", "self-esteem", "addiction", "eating_disorders"
    ])
    
    # Session Configuration
    SESSION_TIMEOUT_MINUTES: int = Field(default=60)
    MAX_CONVERSATION_LENGTH: int = Field(default=100)
    
    # File Storage
    UPLOAD_DIR: Path = Field(default=Path("uploads"))
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024)  # 10MB
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO")
    LOG_FILE: str = Field(default="app.log")
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    PROMETHEUS_ENABLED: bool = Field(default=True)
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()