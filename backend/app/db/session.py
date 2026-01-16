from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Railway uses postgres:// but SQLAlchemy requires postgresql://
raw_url = settings.DATABASE_URL
logger.info(f"Raw DATABASE_URL: {raw_url[:50]}...")  # Log first 50 chars

if not raw_url:
    raise ValueError("DATABASE_URL is not set! Check Railway Variables tab.")

DATABASE_URL = raw_url.replace("postgres://", "postgresql://", 1)
logger.info(f"Converted DATABASE_URL: {DATABASE_URL[:50]}...")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
