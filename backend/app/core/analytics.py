from sqlalchemy.orm import Session
from datetime import date, datetime
from app.models.all_models import SourceUsageStats, QueryAnalytics, ChatLog
import logging

logger = logging.getLogger(__name__)

def track_source_usage(db: Session, source_name: str, relevance_score: float):
    """Track usage of a specific source document"""
    try:
        stat = db.query(SourceUsageStats).filter(SourceUsageStats.source_name == source_name).first()
        if stat:
            # Update existing
            stat.usage_count += 1
            stat.last_used = datetime.utcnow()
            # Running average
            stat.avg_relevance_score = (stat.avg_relevance_score * (stat.usage_count - 1) + relevance_score) / stat.usage_count
        else:
            # Create new
            stat = SourceUsageStats(
                source_name=source_name,
                usage_count=1,
                last_used=datetime.utcnow(),
                avg_relevance_score=relevance_score
            )
            db.add(stat)
        db.commit()
    except Exception as e:
        logger.error(f"Error tracking source usage: {e}")
        db.rollback()

def update_daily_analytics(db: Session, confidence: float, latency_ms: float, success: bool):
    """Update daily query analytics"""
    try:
        today = date.today()
        analytics = db.query(QueryAnalytics).filter(QueryAnalytics.date == today).first()
        
        if analytics:
            # Update existing
            analytics.total_queries += 1
            if success:
                analytics.successful_queries += 1
            else:
                analytics.failed_queries += 1
            
            # Running averages
            total = analytics.total_queries
            analytics.avg_confidence = (analytics.avg_confidence * (total - 1) + confidence) / total
            analytics.avg_latency_ms = (analytics.avg_latency_ms * (total - 1) + latency_ms) / total
        else:
            # Create new
            analytics = QueryAnalytics(
                date=today,
                total_queries=1,
                successful_queries=1 if success else 0,
                failed_queries=0 if success else 1,
                avg_confidence=confidence,
                avg_latency_ms=latency_ms
            )
            db.add(analytics)
        
        db.commit()
    except Exception as e:
        logger.error(f"Error updating analytics: {e}")
        db.rollback()

def get_analytics_overview(db: Session):
    """Get analytics overview for dashboard"""
    today = date.today()
    analytics = db.query(QueryAnalytics).filter(QueryAnalytics.date == today).first()
    
    total_chats = db.query(ChatLog).count()
    total_errors = db.query(ChatLog).filter(ChatLog.has_error == True).count()
    
    return {
        "today": {
            "total_queries": analytics.total_queries if analytics else 0,
            "successful_queries": analytics.successful_queries if analytics else 0,
            "failed_queries": analytics.failed_queries if analytics else 0,
            "avg_confidence": round(analytics.avg_confidence, 2) if analytics else 0,
            "avg_latency_ms": round(analytics.avg_latency_ms, 2) if analytics else 0,
        },
        "all_time": {
            "total_queries": total_chats,
            "total_errors": total_errors,
            "error_rate": round((total_errors / total_chats * 100), 2) if total_chats > 0 else 0
        }
    }
