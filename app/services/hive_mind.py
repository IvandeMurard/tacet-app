from sqlalchemy import func
from app.database import SessionLocal
from app.models.db_models import FeedbackEvent

def calculate_global_modifiers() -> dict:
    """
    Analyzes the entire FeedbackEvent database across all hotels.
    Identifies statistical anomalies where a specific noise source is consistently rejected globally.
    Returns a dictionary of global dB modifiers.
    """
    db = SessionLocal()
    modifiers = {}
    
    try:
        # Group by source_type (simplified)
        # We need total count and rejected count per source
        stats = db.query(
            FeedbackEvent.source_type,
            func.count(FeedbackEvent.id).label('total_events'),
            func.sum(
                func.case((FeedbackEvent.action == "REJECTED", 1), else_=0)
            ).label('rejected_events')
        ).group_by(FeedbackEvent.source_type).all()
        
        for source_type, total, rejected in stats:
            # We want a base statistical significance. For MVP, we use 3 events.
            # In production, this would be 50+ events.
            if total >= 3:
                rejection_rate = rejected / total
                if rejection_rate > 0.75:
                    # If 75% of the global network rejects this alert, it's too sensitive.
                    # We add a global +5 dB artificial shielding to suppress these alerts ecosystem-wide.
                    # We use a base string matching for future-proofing since dates change
                    base_source = "CONSTRUCTION" if "CONSTRUCTION" in source_type else source_type
                    modifiers[base_source] = 5.0
                    
        return modifiers
    finally:
        db.close()

def get_hive_modifier(source_type: str) -> float:
    """
    Fetches the global dB modifier for a specific noise source.
    """
    modifiers = calculate_global_modifiers()
    base_source = "CONSTRUCTION" if "CONSTRUCTION" in source_type else source_type
    return modifiers.get(base_source, 0.0)

def get_hive_analytics() -> dict:
    """
    Returns the full statistical payload for the RMS analytics dashboard.
    """
    db = SessionLocal()
    try:
        total_feedback = db.query(FeedbackEvent).count()
        total_rejected = db.query(FeedbackEvent).filter(FeedbackEvent.action == "REJECTED").count()
        
        return {
            "total_network_feedback_events": total_feedback,
            "global_rejection_rate": round(total_rejected / total_feedback, 2) if total_feedback > 0 else 0.0,
            "active_global_modifiers_db": calculate_global_modifiers()
        }
    finally:
        db.close()
