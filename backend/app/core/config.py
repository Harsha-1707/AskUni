import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AskUni Backend"
    API_V1_STR: str = "/api/v1"
    
    # DATABASE
    # Defaulting to sqlite for safety if postgres isn't set, but requirements said Postgres.
    # Provided example assumes postgres.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/askuni")

    # SECURITY
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_THIS_TO_A_SUPER_SECRET_KEY_IN_PRODUCTION")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # RAG & AI
    # Paths are relative to backend/ root or absolute. 
    # Assuming standard structure: C:\Projects\AskUni\vector_store
    VECTOR_STORE_PATH: str = os.getenv("VECTOR_STORE_PATH", "../vector_store")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "../models/tinyllama.gguf")
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # LLM Provider
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mistral") # mistral or local
    MISTRAL_API_KEY: Optional[str] = os.getenv("MISTRAL_API_KEY")
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "*"]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
