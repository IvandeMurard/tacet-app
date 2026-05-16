from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from app.database import Base

class FeedbackEvent(Base):
    __tablename__ = "feedback_events"

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(String, index=True)
    source_type = Column(String, index=True)
    action = Column(String) # "APPROVED", "REJECTED", "IGNORED"
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))
