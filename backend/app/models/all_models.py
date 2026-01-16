import uuid
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, Enum, Integer
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.STUDENT.value)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    processing_time_ms = Column(Float, default=0.0)
    confidence_score = Column(Float, nullable=True)  # Analytics
    sources_count = Column(Integer, default=0)  # Analytics
    has_error = Column(Boolean, default=False)  # Error tracking
    error_message = Column(Text, nullable=True)  # Error details
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chat_id = Column(String, ForeignKey("chat_logs.id"))
    rating = Column(Integer, nullable=False) # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class EvaluationMetrics(Base):
    __tablename__ = "evaluation_metrics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String, index=True, nullable=False) # To group metrics from a single run
    precision_at_k = Column(Float)
    recall_at_k = Column(Float)
    mrr = Column(Float)
    faithfulness_score = Column(Float)
    hallucination_detected = Column(Float) # % of answers flagged
    avg_latency_ms = Column(Float)
    total_samples = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
