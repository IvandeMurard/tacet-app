from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime, timezone
from app.database import Base

class FeedbackEvent(Base):
    __tablename__ = "feedback_events"

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(String, index=True)
    source_type = Column(String, index=True)
    action = Column(String) # "APPROVED", "REJECTED", "IGNORED"
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class EnvironmentalState(Base):
    __tablename__ = "environmental_state"

    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float, index=True)
    lon = Column(Float, index=True)
    weather_condition = Column(String, nullable=True)
    congestion_ratio = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class GeoEvent(Base):
    __tablename__ = "geo_events"

    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float, index=True, nullable=True)
    lon = Column(Float, index=True, nullable=True)
    event_type = Column(String, index=True) # e.g. "permit", "crowd_event", "strike", "extreme_weather"
    description = Column(String, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
