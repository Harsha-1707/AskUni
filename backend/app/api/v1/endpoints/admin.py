from typing import Any, List
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.models.all_models import User, ChatLog, EvaluationMetrics
from app.evaluation.runner import runner

router = APIRouter()

@router.post("/ingest")
def trigger_ingestion(
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    """
    Triggers data ingestion pipeline.
    """
    # TODO: Import and run ingestor here
    # from rag.ingest import Ingestor
    # Ingestor().process_and_index()
    return {"status": "Ingestion triggered (Mock)"}

@router.get("/metrics")
def get_metrics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    total_users = db.query(func.count(User.id)).scalar()
    total_chats = db.query(func.count(ChatLog.id)).scalar()
    
    return {
        "total_users": total_users,
        "total_chats": total_chats,
        "system_status": "healthy"
    }

@router.get("/queries")
def get_recent_queries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_admin),
) -> Any:
    logs = db.query(ChatLog).order_by(ChatLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs

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
            "created_at": str(m.created_at)
        }
        for m in metrics
    ]
