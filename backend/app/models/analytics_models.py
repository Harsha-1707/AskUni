from sqlalchemy import Column, String, Integer, Float, Date, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base
import uuid

class SourceUsageStats(Base):
    __tablename__ = "source_usage_stats"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_name = Column(String, unique=True, index=True, nullable=False)
    usage_count = Column(Integer, default=0)
    last_used = Column(DateTime(timezone=True), server_default=func.now())
    avg_relevance_score = Column(Float, default=0.0)

class QueryAnalytics(Base):
    __tablename__ = "query_analytics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    date = Column(Date, unique=True, index=True, nullable=False)
    total_queries = Column(Integer, default=0)
    successful_queries = Column(Integer, default=0)
    failed_queries = Column(Integer, default=0)
    avg_confidence = Column(Float, default=0.0)
    avg_latency_ms = Column(Float, default=0.0)
