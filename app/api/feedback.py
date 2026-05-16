from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.models import FeedbackRequest
from app.database import get_db
from app.models.db_models import FeedbackEvent

router = APIRouter()

@router.post("/feedback", tags=["Memory"])
def process_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    """
    Ingests human-in-the-loop feedback to train the Idiosyncratic and Hive memory.
    """
    event = FeedbackEvent(
        hotel_id=request.hotel_id,
        source_type=request.source_type,
        action=request.action
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return {
        "status": "success", 
        "message": "Feedback recorded into Idiosyncratic Memory", 
        "event_id": event.id
    }
