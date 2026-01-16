from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.api.deps import get_db, get_current_active_admin
from app.models.all_models import ChatLog, Feedback
from app.models.analytics_models import SourceUsageStats, QueryAnalytics
from app.core.analytics import get_analytics_overview
from datetime import date, timedelta

router = APIRouter()

@router.get("/analytics/overview")
def get_overview(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    """Get analytics overview for dashboard"""
    return get_analytics_overview(db)

@router.get("/analytics/sources")
def get_source_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    """Get source usage statistics"""
    sources = db.query(SourceUsageStats).order_by(desc(SourceUsageStats.usage_count)).limit(10).all()
    return {
        "top_sources": [
            {
                "name": s.source_name,
                "usage_count": s.usage_count,
                "avg_relevance": round(s.avg_relevance_score, 3),
                "last_used": s.last_used.isoformat() if s.last_used else None
            }
            for s in sources
        ]
    }

@router.get("/analytics/trends")
def get_query_trends(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    """Get query trends over time"""
    start_date = date.today() - timedelta(days=days)
    trends = db.query(QueryAnalytics).filter(
        QueryAnalytics.date >= start_date
    ).order_by(QueryAnalytics.date).all()
    
    return {
        "trends": [
            {
                "date": t.date.isoformat(),
                "total_queries": t.total_queries,
                "successful": t.successful_queries,
                "failed": t.failed_queries,
                "success_rate": round((t.successful_queries / t.total_queries * 100), 1) if t.total_queries > 0 else 0,
                "avg_confidence": round(t.avg_confidence, 2),
                "avg_latency_ms": round(t.avg_latency_ms, 1)
            }
            for t in trends
        ]
    }

@router.get("/analytics/errors")
def get_error_stats(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    """Get recent errors"""
    errors = db.query(ChatLog).filter(
        ChatLog.has_error == True
    ).order_by(desc(ChatLog.created_at)).limit(limit).all()
    
    return {
        "errors": [
            {
                "id": e.id,
                "query": e.query,
                "error_message": e.error_message,
                "timestamp": e.created_at.isoformat()
            }
            for e in errors
        ],
        "total_errors": db.query(ChatLog).filter(ChatLog.has_error == True).count()
    }

@router.get("/analytics/feedback-summary")
def get_feedback_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_admin)
):
    """Get feedback statistics"""
    total_feedback = db.query(Feedback).count()
    
    # Rating distribution
    ratings = db.query(
        Feedback.rating,
        func.count(Feedback.id).label('count')
    ).group_by(Feedback.rating).all()
    
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0
    
    return {
        "total_feedback": total_feedback,
        "average_rating": round(avg_rating, 2),
        "rating_distribution": {
            str(r.rating): r.count for r in ratings
        }
    }
