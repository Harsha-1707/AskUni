from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.all_models import User, Feedback, ChatLog
from app.schemas.all_schemas import FeedbackCreate

router = APIRouter()

@router.post("/", status_code=201)
def submit_feedback(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    feedback_in: FeedbackCreate,
) -> Any:
    # Verify chat exists and belongs to user (optional check)
    chat = db.query(ChatLog).filter(ChatLog.id == feedback_in.chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    feedback = Feedback(
        chat_id=feedback_in.chat_id,
        rating=feedback_in.rating,
        comment=feedback_in.comment
    )
    db.add(feedback)
    db.commit()
    return {"msg": "Feedback received"}
