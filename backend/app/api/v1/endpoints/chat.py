from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.all_models import User, ChatLog
from app.schemas.all_schemas import ChatRequest, ChatResponse
from app.services.chat_orchestrator import orchestrator

router = APIRouter()

@router.post("/", response_model=ChatResponse)
def chat_interaction(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    chat_in: ChatRequest,
) -> Any:
    """
    RAG-enabled chat endpoint.
    """
    # 1. Process via Orchestrator
    result = orchestrator.process_query(chat_in.query, chat_in.history)
    
    # 2. Log to DB
    chat_log = ChatLog(
        user_id=current_user.id,
        query=chat_in.query,
        response=result["answer"],
        processing_time_ms=result["processing_time"] * 1000
    )
    db.add(chat_log)
    db.commit()
    db.refresh(chat_log)
    
    # 3. Return response
    return {
        "answer": result["answer"],
        "conversation_id": chat_log.id,
        "processing_time": result["processing_time"],
        "sources": result["sources"],
        "confidence_score": result["confidence_score"],
        "metadata": result["metadata"]
    }
