import math
import time
from shapely.geometry import LineString
from app.api.models import AcousticAlert
from app.ingest.paris_permits import fetch_active_permits
from app.ingest.paris_events import fetch_active_events
from app.ingest.weather import fetch_current_weather
from app.ingest.traffic import fetch_traffic_congestion
from app.services.spatial import get_surrounding_buildings
from app.database import SessionLocal
from app.models.db_models import FeedbackEvent
from app.services.hive_mind import get_hive_modifier

# Base assumptions for the V1 Synthetic Model
BASE_CONSTRUCTION_DB_AT_1M = 90.0
BASE_CROWD_EVENT_DB_AT_1M = 100.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the straight-line distance in meters between two GPS coordinates 
    using the Haversine formula (accounting for Earth's curvature).
    """
    R = 6371000  # Radius of Earth in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance_meters = R * c
    return distance_meters

def calculate_db_attenuation(distance_meters: float, shielding_penalty_db: float, base_db: float, is_raining: bool = False) -> float:
    """
    Calculates the resulting decibel level at a given distance using the Inverse Square Law.
    dB = dB_source - 20 * log10(Distance).
    Applies the Ray-Traced Shielding Penalty and Weather penalties.
    """
    if distance_meters <= 1.0:
        hotel_db = base_db - shielding_penalty_db
    else:
        attenuation = 20 * math.log10(distance_meters)
        hotel_db = base_db - attenuation - shielding_penalty_db
    
    # Rain increases tire friction and surface noise propagation
    if is_raining:
        hotel_db += 3.0
    
    # Floor it at 35 dB (ambient city noise)
    return max(35.0, hotel_db)

def determine_severity_and_action(hotel_db: float) -> tuple[str, str]:
    """
    Returns (severity, recommendation) based on the Severity Matrix thresholds.
    """
    if hotel_db > 65.0:
        return "CRITICAL", "Reduce booking price by 15% for affected street-facing rooms. Reassign VIP guests."
    elif hotel_db >= 55.0:
        return "HIGH", "Warn guests of potential disruption. Ensure soundproof windows are sealed and consider proactive room upgrades."
    elif hotel_db >= 45.0:
        return "MEDIUM", "Monitor guest sentiment. Consider offering complimentary breakfast or proactive room reassignments upon request."
    else:
        return "LOW", "No immediate action required."

def get_idiosyncratic_shielding_adjustment(hotel_id: str, source_type: str) -> float:
    """
    Queries the Idiosyncratic Memory to see if this specific hotel consistently 
    rejects this type of noise alert.
    If so, returns an artificial padding to the shielding penalty.
    """
    db = SessionLocal()
    try:
        base_source = "CONSTRUCTION" if "CONSTRUCTION" in source_type else source_type
        
        rejections = db.query(FeedbackEvent).filter(
            FeedbackEvent.hotel_id == hotel_id,
            FeedbackEvent.source_type.like(f"%{base_source}%"),
            FeedbackEvent.action == "REJECTED"
        ).count()
        
        # Every rejection adds +2 dB of artificial shielding
        # Cap it at +15 dB
        return min(15.0, float(rejections) * 2.0)
    finally:
        db.close()

def generate_forecast(hotel_id: str, hotel_lat: float, hotel_lon: float, target_start: str = None, target_end: str = None, limit_sites: int = 20) -> tuple[list[AcousticAlert], str | None, dict]:
    """
    Core business logic: Fetches permits, weather, traffic, and 3D geometry.
    Performs acoustic ray-tracing to calculate precise noise attenuation.
    Filters by predictive dates if provided.
    Queries the Idiosyncratic Memory database to adjust calculations.
    """
    start_time = time.time()
    
    # Fetch Environmental Context
    weather_data = fetch_current_weather(hotel_lat, hotel_lon)
    weather_condition = weather_data["main"] if weather_data else None
    is_raining = (weather_condition == "Rain")
    
    # Fetch 3D Geometry
    buildings = get_surrounding_buildings(hotel_lat, hotel_lon)
    
    alerts = []
    
    # Check Traffic Congestion (TomTom)
    traffic_data = fetch_traffic_congestion(hotel_lat, hotel_lon)
    if traffic_data:
        congestion_ratio = traffic_data.get("congestion_ratio", 1.0)
        # If speed is less than 40% of free flow, we have severe congestion
        if congestion_ratio < 0.4:
            # Idling diesels and honking generate intense local noise
            alerts.append(
                AcousticAlert(
                    source_type="TRAFFIC_CONGESTION",
                    severity="HIGH",
                    predicted_db_increase=8.0,
                    distance_meters=0, # Immediately outside
                    recommendation="Severe traffic congestion detected. Recommend pausing premium pricing on street-facing suites or offering affected guests complimentary spa access."
                )
            )
            
    # Fetch Disruptions (Construction)
    permits = fetch_active_permits(limit=limit_sites, target_start=target_start, target_end=target_end)
    if not permits:
        alerts.sort(key=lambda x: x.predicted_db_increase, reverse=True)
        return alerts, weather_condition
    
    for permit in permits:
        coords = permit.get("coordinates")
        if not coords:
            continue
            
        permit_lat = coords.get("lat")
        permit_lon = coords.get("lon")
        
        # 1. Distance Calculation
        distance = haversine_distance(hotel_lat, hotel_lon, permit_lat, permit_lon)
        
        # We only care about construction within ~500 meters for now to save processing
        if distance > 500:
            continue
            
        # 1.5 Query Idiosyncratic Memory
        idiosyncratic_bonus = get_idiosyncratic_shielding_adjustment(hotel_id, "CONSTRUCTION")
        
        # 1.6 Query Hive Memory
        hive_bonus = get_hive_modifier("CONSTRUCTION")
        
        # 2. Acoustic Ray-Tracing
        shielding_penalty = 0.0 + idiosyncratic_bonus + hive_bonus
        # Draw a line from source to receiver (shapely expects lon, lat)
        line_of_sight = LineString([(hotel_lon, hotel_lat), (permit_lon, permit_lat)])
        
        # Check intersections against 3D city layout
        for building in buildings:
            if line_of_sight.intersects(building["polygon"]):
                # Sound is physically blocked by a building
                shielding_penalty = 15.0
                break # We found a blocker, no need to check others
                
        # 3. Acoustic Math
        hotel_db = calculate_db_attenuation(distance, shielding_penalty_db=shielding_penalty, base_db=BASE_CONSTRUCTION_DB_AT_1M, is_raining=is_raining)
        
        # If noise is < 45 dB, it's considered ambient and we don't alert
        if hotel_db < 45.0:
            continue
            
        chain_of_thought = [
            f"Base Noise: {BASE_CONSTRUCTION_DB_AT_1M} dB (Construction at 1m)",
            f"Distance Attenuation: {int(distance)}m removed {round(BASE_CONSTRUCTION_DB_AT_1M - (hotel_db + shielding_penalty), 1)} dB"
        ]
        if shielding_penalty > 0:
            chain_of_thought.append(f"Ray-Tracing Penalty: -15.0 dB (Blocked by 3D geometry)")
        if idiosyncratic_bonus > 0:
            chain_of_thought.append(f"Idiosyncratic Memory Bonus: +{idiosyncratic_bonus} dB (Hotel historically rejects alerts)")
        if hive_bonus > 0:
            chain_of_thought.append(f"Hive Memory Bonus: +{hive_bonus} dB (Global ecosystem suppression)")
        if is_raining:
            chain_of_thought.append("Weather Penalty: +3.0 dB (Rain increases wet surface friction)")
        chain_of_thought.append(f"Final Predicted Impact: {round(hotel_db, 1)} dB")
        
        # 4. Severity Matrix
        severity, recommendation = determine_severity_and_action(hotel_db)
        
        permit_start = permit.get('start_date', 'Unknown')[:10] if permit.get('start_date') else 'Unknown'
        permit_end = permit.get('end_date', 'Unknown')[:10] if permit.get('end_date') else 'Unknown'
        
        alert = AcousticAlert(
            source_type=f"PLANNED_CONSTRUCTION (From {permit_start} to {permit_end})",
            severity=severity,
            predicted_db_increase=round(hotel_db, 1),
            distance_meters=int(distance),
            recommendation=recommendation,
            explainability_chain=chain_of_thought
        )
        alerts.append(alert)
        
    # Fetch Events (Crowds)
    events = fetch_active_events(limit=limit_sites, target_start=target_start, target_end=target_end)
    for event in events:
        coords = event.get("coordinates")
        if not coords:
            continue
            
        event_lat = coords.get("lat")
        event_lon = coords.get("lon")
        
        distance = haversine_distance(hotel_lat, hotel_lon, event_lat, event_lon)
        
        # Events are louder, we check up to 1000m
        if distance > 1000:
            continue
            
        idiosyncratic_bonus = get_idiosyncratic_shielding_adjustment(hotel_id, "CROWD_EVENT")
        hive_bonus = get_hive_modifier("CROWD_EVENT")
        
        shielding_penalty = 0.0 + idiosyncratic_bonus + hive_bonus
        line_of_sight = LineString([(hotel_lon, hotel_lat), (event_lon, event_lat)])
        
        for building in buildings:
            if line_of_sight.intersects(building["polygon"]):
                shielding_penalty = 15.0
                break
                
        hotel_db = calculate_db_attenuation(distance, shielding_penalty_db=shielding_penalty, base_db=BASE_CROWD_EVENT_DB_AT_1M, is_raining=is_raining)
        
        if hotel_db < 45.0:
            continue
            
        chain_of_thought = [
            f"Base Noise: {BASE_CROWD_EVENT_DB_AT_1M} dB (Crowd Event at 1m)",
            f"Distance Attenuation: {int(distance)}m removed {round(BASE_CROWD_EVENT_DB_AT_1M - (hotel_db + shielding_penalty), 1)} dB"
        ]
        if shielding_penalty > 0:
            chain_of_thought.append(f"Ray-Tracing Penalty: -15.0 dB (Blocked by 3D geometry)")
        if idiosyncratic_bonus > 0:
            chain_of_thought.append(f"Idiosyncratic Memory Bonus: +{idiosyncratic_bonus} dB")
        if hive_bonus > 0:
            chain_of_thought.append(f"Hive Memory Bonus: +{hive_bonus} dB")
        if is_raining:
            chain_of_thought.append("Weather Penalty: +3.0 dB")
        chain_of_thought.append(f"Final Predicted Impact: {round(hotel_db, 1)} dB")
        
        severity, recommendation = determine_severity_and_action(hotel_db)
        
        ev_start = event.get('start_date', 'Unknown')[:10] if event.get('start_date') else 'Unknown'
        
        alert = AcousticAlert(
            source_type=f"CROWD_EVENT ({event.get('description')} on {ev_start})",
            severity=severity,
            predicted_db_increase=round(hotel_db, 1),
            distance_meters=int(distance),
            recommendation="Impending crowd noise detected. Recommend pausing premium pricing on street-facing suites or preparing complimentary earplugs.",
            explainability_chain=chain_of_thought
        )
        alerts.append(alert)
        
    # Sort alerts by severity/noise level (highest noise first)
    alerts.sort(key=lambda x: x.predicted_db_increase, reverse=True)
    
    processing_time_ms = int((time.time() - start_time) * 1000)
    metadata = {
        "processing_time_ms": processing_time_ms,
        "buildings_analyzed": len(buildings),
        "ray_traces_performed": len(permits) if permits else 0
    }
    
    return alerts, weather_condition, metadata
