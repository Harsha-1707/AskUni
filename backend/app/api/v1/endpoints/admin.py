from typing import Any, List, Optional
from fastapi import APIRouter, Depends, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta, timezone
from app.api import deps
from app.models.all_models import User, ChatLog, EvaluationMetrics, Feedback
from app.evaluation.runner import runner
import asyncio
import json
import time

router = APIRouter()


@router.post("/ingest")
def trigger_ingestion(
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Triggers data ingestion pipeline.
    """
    return {"status": "Ingestion triggered (Mock)"}


@router.get("/metrics")
def get_metrics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """Enhanced metrics for the admin dashboard."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_chats = db.query(func.count(ChatLog.id)).scalar() or 0

    # Queries in last 24 hours
    cutoff_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    queries_24h = db.query(func.count(ChatLog.id)).filter(
        ChatLog.created_at >= cutoff_24h
    ).scalar() or 0

    # Average confidence score
    avg_confidence = db.query(func.avg(ChatLog.confidence_score)).filter(
        ChatLog.confidence_score.isnot(None)
    ).scalar() or 0

    # Average processing time in ms
    avg_latency = db.query(func.avg(ChatLog.processing_time_ms)).scalar() or 0

    # Error count
    total_errors = db.query(func.count(ChatLog.id)).filter(
        ChatLog.has_error == True
    ).scalar() or 0

    # Feedback stats
    total_feedback = db.query(func.count(Feedback.id)).scalar() or 0
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0

    # Active users (users who have queried in the last 7 days)
    cutoff_7d = datetime.now(timezone.utc) - timedelta(days=7)
    active_users = db.query(func.count(func.distinct(ChatLog.user_id))).filter(
        ChatLog.created_at >= cutoff_7d
    ).scalar() or 0

    # Success rate
    success_rate = 0.0
    if total_chats > 0:
        success_rate = round(((total_chats - total_errors) / total_chats) * 100, 1)

    return {
        "total_users": total_users,
        "total_chats": total_chats,
        "queries_24h": queries_24h,
        "avg_confidence": round(float(avg_confidence), 3),
        "avg_latency_ms": round(float(avg_latency), 1),
        "total_errors": total_errors,
        "total_feedback": total_feedback,
        "avg_rating": round(float(avg_rating), 2),
        "active_users_7d": active_users,
        "success_rate": success_rate,
        "system_status": "healthy",
    }


@router.get("/queries")
def get_recent_queries(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = Query(None),
    has_error: Optional[bool] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """Get recent queries with optional filtering."""
    q = db.query(ChatLog).order_by(desc(ChatLog.created_at))

    if search:
        q = q.filter(ChatLog.query.ilike(f"%{search}%"))
    if has_error is not None:
        q = q.filter(ChatLog.has_error == has_error)

    logs = q.offset(skip).limit(limit).all()
    total = q.count()

    return {
        "total": total,
        "items": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "query": log.query,
                "response": log.response,
                "processing_time_ms": log.processing_time_ms,
                "confidence_score": log.confidence_score,
                "sources_count": log.sources_count,
                "has_error": log.has_error,
                "error_message": log.error_message,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ],
    }


@router.get("/queries/live")
async def live_query_stream(
    token: str = Query(...),
):
    """
    Server-Sent Events endpoint for live query monitoring.
    Token is passed as query param (EventSource doesn't support headers).
    """
    from app.core import security
    from app.core.config import settings
    from app.db.session import SessionLocal
    from jose import jwt, JWTError
    from app.schemas.all_schemas import TokenPayload

    # Validate token
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        token_data = TokenPayload(**payload)
    except (JWTError, Exception):
        async def err_gen():
            yield f"event: error\ndata: {json.dumps({'error': 'Invalid token'})}\n\n"
        return StreamingResponse(err_gen(), media_type="text/event-stream")

    async def event_generator():
        db = SessionLocal()
        try:
            last_ts = datetime.now(timezone.utc)

            # Send a heartbeat/connected event first
            yield f"event: connected\ndata: {json.dumps({'status': 'connected'})}\n\n"

            while True:
                await asyncio.sleep(3)
                try:
                    # Fetch logs newer than last_ts
                    logs = db.query(ChatLog).filter(
                        ChatLog.created_at > last_ts
                    ).order_by(ChatLog.created_at.asc()).limit(10).all()

                    if logs:
                        last_ts = logs[-1].created_at
                        for log in logs:
                            resp_preview = log.response or ''
                            if len(resp_preview) > 250:
                                resp_preview = resp_preview[:250] + '...'
                            data = {
                                "id": log.id,
                                "query": log.query,
                                "response": resp_preview,
                                "processing_time_ms": log.processing_time_ms,
                                "confidence_score": log.confidence_score,
                                "has_error": log.has_error,
                                "created_at": log.created_at.isoformat() if log.created_at else None,
                            }
                            yield f"event: query\ndata: {json.dumps(data)}\n\n"

                    # Heartbeat
                    yield f"event: heartbeat\ndata: {json.dumps({'ts': time.time()})}\n\n"
                except Exception as e:
                    yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
                    break
        finally:
            db.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )



@router.get("/users")
def get_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """Get all users with their query stats."""
    users = db.query(User).offset(skip).limit(limit).all()
    total = db.query(func.count(User.id)).scalar() or 0

    result = []
    for u in users:
        query_count = db.query(func.count(ChatLog.id)).filter(
            ChatLog.user_id == u.id
        ).scalar() or 0
        last_query = db.query(ChatLog).filter(
            ChatLog.user_id == u.id
        ).order_by(desc(ChatLog.created_at)).first()

        result.append({
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "query_count": query_count,
            "last_active": last_query.created_at.isoformat() if last_query and last_query.created_at else None,
        })

    return {"total": total, "items": result}


@router.post("/evaluate")
def trigger_evaluation(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Triggers an evaluation run in the background.
    """
    background_tasks.add_task(runner.run_evaluation)
    return {"status": "Evaluation passed to background worker"}


@router.get("/evaluation-history")
def get_evaluation_history(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    metrics = db.query(EvaluationMetrics).order_by(EvaluationMetrics.created_at.desc()).all()
    return [
        {
            "id": m.id,
            "run_id": m.run_id,
            "precision_at_k": m.precision_at_k,
            "recall_at_k": m.recall_at_k,
            "mrr": m.mrr,
            "faithfulness_score": m.faithfulness_score,
            "hallucination_detected": m.hallucination_detected,
            "avg_latency_ms": m.avg_latency_ms,
            "total_samples": m.total_samples,
            "created_at": str(m.created_at),
        }
        for m in metrics
    ]
