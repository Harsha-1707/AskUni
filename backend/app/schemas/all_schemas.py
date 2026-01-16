from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Token ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

# --- User ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str = "student"

class UserResponse(UserBase):
    id: str
    is_active: bool
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Chat ---
class ChatRequest(BaseModel):
    query: str
    history: List[str] = []

class ChatResponse(BaseModel):
    answer: str
    conversation_id: str
    processing_time: float
    sources: List[dict] = [] # List of {source: str, score: float, content: str}
    confidence_score: float = 0.0
    metadata: dict = {}

# --- Feedback ---
class FeedbackCreate(BaseModel):
    chat_id: str
    rating: int
    comment: Optional[str] = None
