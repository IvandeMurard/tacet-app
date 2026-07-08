import math
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import SessionLocal
from app.models.db_models import GeoEvent

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance in km between two lat/lon points."""
    R = 6371.0 # Earth radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def query_paris_events(
    lat: float, 
    lon: float, 
    radius_km: float, 
    start_date: str, 
    end_date: str, 
    categories: list[str]
) -> dict:
    """
    Queries the SQLite GeoEvents table and filters by geographical distance 
    and date overlap to build the Sensory Node response.
    """
    db: Session = SessionLocal()
    try:
        req_start = datetime.fromisoformat(start_date)
        req_end = datetime.fromisoformat(end_date)
        
        # 1. Base query: fetch categories (or all if not specified)
        query = db.query(GeoEvent)
        if categories:
            query = query.filter(GeoEvent.event_type.in_(categories))
            
        all_events = query.all()
        
        filtered_events = []
        risk_score = 0.0
        
        for ev in all_events:
            # 2. Date overlap check
            if ev.start_date:
                # If no end_date provided, assume 1-day event
                ev_end = ev.end_date if ev.end_date else ev.start_date
                
                # Check overlap (naive dates)
                overlap_start = max(req_start.date(), ev.start_date.date())
                overlap_end = min(req_end.date(), ev_end.date())
                
                if overlap_start > overlap_end:
                    continue # No overlap
            
            # 3. Spatial filtering (Haversine math instead of pgvector)
            if ev.lat is not None and ev.lon is not None:
                dist = haversine_distance(lat, lon, ev.lat, ev.lon)
                if dist <= radius_km:
                    filtered_events.append({
                        "type": ev.event_type,
                        "description": ev.description,
                        "distance_km": round(dist, 2),
                        "start_date": ev.start_date.isoformat() if ev.start_date else None,
                        "end_date": ev.end_date.isoformat() if ev.end_date else None
                    })
                    
                    # 4. Risk scoring logic
                    if ev.event_type == "crowd_event":
                        risk_score += 0.2
                    elif ev.event_type == "permit":
                        risk_score += 0.1
                    elif ev.event_type in ["extreme_weather", "transit_strike"]:
                        risk_score += 0.4
                        
        # Cap risk score at 1.0
        risk_score = min(1.0, round(risk_score, 2))
        
        return {
            "events": filtered_events,
            "total_events_in_radius": len(filtered_events),
            "risk_score": risk_score,
            "zone": {
                "lat": lat,
                "lon": lon,
                "radius_km": radius_km
            }
        }
        
    except Exception as e:
        return {"error": str(e), "events": [], "risk_score": 0.0}
    finally:
        db.close()
