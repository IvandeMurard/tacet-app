import math
import time
from shapely.geometry import LineString, Point
from shapely.ops import nearest_points
from sqlalchemy import func
from app.api.models import AcousticAlert
from app.services.spatial import get_surrounding_buildings
from app.database import SessionLocal
from app.models.db_models import FeedbackEvent, GeoEvent, EnvironmentalState

# Base assumptions for the V1 Synthetic Model
BASE_CONSTRUCTION_DB_AT_1M = 90.0
BASE_CROWD_EVENT_DB_AT_1M = 100.0

# --- POLAR HEATMAP CACHE ---
# Cache in-memory for the MVP: Dict[hotel_id, Dict[int, float]]
# Keys are angles 0-359, values are distance to nearest building.
# In a future iteration, this could be migrated to Redis or Supabase.
ACOUSTIC_HEATMAP_CACHE = {}

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

def get_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    """Calculates the compass bearing from point 1 to point 2."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)
    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    theta = math.atan2(y, x)
    return int(round(math.degrees(theta) + 360)) % 360

def build_acoustic_heatmap(hotel_lat: float, hotel_lon: float, buildings: list) -> dict:
    """
    Casts 360 rays from the hotel to pre-calculate the distance to the nearest
    obstacle in every direction. O(B) initialization, allows O(1) lookup.
    """
    heatmap = {}
    max_distance = 1500.0  # Cast rays up to 1.5km
    R = 6371000
    hotel_point = Point(hotel_lon, hotel_lat)

    for angle in range(360):
        bearing = math.radians(angle)
        lat1 = math.radians(hotel_lat)
        lon1 = math.radians(hotel_lon)
        
        # Calculate destination point of the ray
        lat2 = math.asin(math.sin(lat1)*math.cos(max_distance/R) + 
                         math.cos(lat1)*math.sin(max_distance/R)*math.cos(bearing))
        lon2 = lon1 + math.atan2(math.sin(bearing)*math.sin(max_distance/R)*math.cos(lat1),
                                 math.cos(max_distance/R)-math.sin(lat1)*math.sin(lat2))
        
        ray = LineString([(hotel_lon, hotel_lat), (math.degrees(lon2), math.degrees(lat2))])
        
        min_obstacle_dist = max_distance
        
        for building in buildings:
            intersection = ray.intersection(building["polygon"])
            if not intersection.is_empty:
                # Exact distance to the intersection point
                closest_pt, _ = nearest_points(intersection, hotel_point)
                dist = haversine_distance(hotel_lat, hotel_lon, closest_pt.y, closest_pt.x)
                # Ignore buildings that the hotel is inside or too close to (< 20m)
                if 20 < dist < min_obstacle_dist:
                    min_obstacle_dist = dist
                    
        heatmap[angle] = min_obstacle_dist
        
    return heatmap

def get_shielding_penalty(hotel_id: str, hotel_lat: float, hotel_lon: float, event_lat: float, event_lon: float, distance_meters: float) -> float:
    """
    O(1) lookup for ray-tracing penalty using the Polar Heatmap Cache.
    """
    if hotel_id not in ACOUSTIC_HEATMAP_CACHE:
        buildings = get_surrounding_buildings(hotel_lat, hotel_lon)
        ACOUSTIC_HEATMAP_CACHE[hotel_id] = build_acoustic_heatmap(hotel_lat, hotel_lon, buildings)
        
    heatmap = ACOUSTIC_HEATMAP_CACHE[hotel_id]
    angle = get_bearing(hotel_lat, hotel_lon, event_lat, event_lon)
    
    # If the event is further than the nearest obstacle in that direction, it is shielded
    if distance_meters > heatmap[angle]:
        return 15.0
    return 0.0

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
    The yield recommendation is dynamically calculated based on the exact DB overflow,
    ensuring rigorous financial reliability rather than static placeholders.
    """
    # Dynamic Yield Pressure Calculation (max 25% discount)
    # Legal disruption threshold is generally considered 55 dB for luxury hospitality
    if hotel_db > 55.0:
        db_overflow = hotel_db - 55.0
        # 1 dB overflow = 0.8% yield drop
        yield_drop_percent = min(25.0, round(db_overflow * 0.8, 1))
    else:
        yield_drop_percent = 0.0

    if hotel_db > 65.0:
        return "CRITICAL", f"Severe acoustic disruption ({round(hotel_db, 1)} dB). Recommend RMS Yield Modifier: -{yield_drop_percent}% on exposed room categories. Pre-emptively reassign VIP guests."
    elif hotel_db >= 55.0:
        return "HIGH", f"Significant acoustic disruption. Recommend RMS Yield Modifier: -{yield_drop_percent}%. Ensure soundproof windows are sealed."
    elif hotel_db >= 45.0:
        return "MEDIUM", "Monitor guest sentiment. Yield impact negligible. Consider offering complimentary amenities upon request."
    else:
        return "LOW", "No immediate action required. Yield impact: 0%."

def preload_idiosyncratic_adjustments(hotel_id: str) -> dict:
    """
    Pre-loads the idiosyncratic adjustments for a hotel using a single SQL query.
    Returns a dict mapping base_source to adjustment float.
    """
    db = SessionLocal()
    try:
        results = db.query(
            FeedbackEvent.source_type,
            func.count(FeedbackEvent.id)
        ).filter(
            FeedbackEvent.hotel_id == hotel_id,
            FeedbackEvent.action == "REJECTED"
        ).group_by(FeedbackEvent.source_type).all()
        
        counts = {}
        for source_type, count in results:
            if "CONSTRUCTION" in source_type:
                key = "CONSTRUCTION"
            elif "CROWD_EVENT" in source_type:
                key = "CROWD_EVENT"
            else:
                key = source_type
                
            counts[key] = counts.get(key, 0) + count
            
        return {k: min(15.0, float(v) * 2.0) for k, v in counts.items()}
    finally:
        db.close()

def generate_forecast(hotel_id: str, hotel_lat: float, hotel_lon: float, target_start: str = None, target_end: str = None, limit_sites: int = 20) -> tuple[list[AcousticAlert], str | None, dict]:
    """
    Core business logic: Fetches permits, weather, traffic, and 3D geometry.
    Performs acoustic ray-tracing to calculate precise noise attenuation using an O(1) cache.
    Filters by predictive dates if provided.
    Queries the Idiosyncratic Memory database to adjust calculations.
    """
    start_time = time.time()
    
    db = SessionLocal()
    try:
        # Fetch Environmental Context from DB
        env_state = db.query(EnvironmentalState).order_by(EnvironmentalState.timestamp.desc()).first()
        weather_condition = env_state.weather_condition if env_state else None
        is_raining = (weather_condition == "Rain")
        congestion_ratio = env_state.congestion_ratio if env_state else 1.0

        # Pre-warm Cache (or ensure it's built)
        cache_status = "HIT"
        buildings_analyzed = 0
        if hotel_id not in ACOUSTIC_HEATMAP_CACHE:
            buildings = get_surrounding_buildings(hotel_lat, hotel_lon)
            ACOUSTIC_HEATMAP_CACHE[hotel_id] = build_acoustic_heatmap(hotel_lat, hotel_lon, buildings)
            buildings_analyzed = len(buildings)
            cache_status = "MISS"
            
        idiosyncratic_adjustments = preload_idiosyncratic_adjustments(hotel_id)
        
        alerts = []
        
        # Check Traffic Congestion
        if congestion_ratio < 0.4:
            alerts.append(
                AcousticAlert(
                    source_type="TRAFFIC_CONGESTION",
                    severity="HIGH",
                    predicted_db_increase=8.0,
                    distance_meters=0, # Immediately outside
                    recommendation="Severe traffic congestion detected. Recommend pausing premium pricing on street-facing suites or offering affected guests complimentary spa access."
                )
            )
                
        # Fetch GeoEvents from DB
        query = db.query(GeoEvent)
        # Apply date filters if provided
        if target_start:
            query = query.filter(GeoEvent.start_date >= target_start)
        if target_end:
            query = query.filter(GeoEvent.start_date <= target_end)
            
        geo_events = query.limit(limit_sites * 4).all()  # multiply limit since we fetch all types at once
        
        cache_lookups = 0
        for event in geo_events:
            # Transit Strikes and Extreme Weather
            if event.event_type in ("transit_strike", "extreme_weather"):
                alerts.append(
                    AcousticAlert(
                        source_type=event.event_type.upper(),
                        severity="HIGH", # Using default severity for these
                        predicted_db_increase=0.0,
                        distance_meters=0,
                        recommendation="Review staffing and alternative transit options." if event.event_type == "transit_strike" else "Ensure outdoor areas are secured.",
                        explainability_chain=[f"{event.event_type.capitalize()} Data: {event.description}"]
                    )
                )
                continue

            # Skip if no coords
            if event.lat is None or event.lon is None:
                continue

            # Permits and Crowd Events
            distance = haversine_distance(hotel_lat, hotel_lon, event.lat, event.lon)
            
            if event.event_type == "permit":
                if distance > 500:
                    continue
                base_db = BASE_CONSTRUCTION_DB_AT_1M
                idiosyncratic_bonus = idiosyncratic_adjustments.get("CONSTRUCTION", 0.0)
            elif event.event_type == "crowd_event":
                if distance > 1000:
                    continue
                base_db = BASE_CROWD_EVENT_DB_AT_1M
                idiosyncratic_bonus = idiosyncratic_adjustments.get("CROWD_EVENT", 0.0)
            else:
                continue

            # Acoustic Ray-Tracing Cache Lookup (O(1))
            ray_tracing_penalty = get_shielding_penalty(hotel_id, hotel_lat, hotel_lon, event.lat, event.lon, distance)
            cache_lookups += 1
            shielding_penalty = idiosyncratic_bonus + ray_tracing_penalty
            
            hotel_db = calculate_db_attenuation(distance, shielding_penalty_db=shielding_penalty, base_db=base_db, is_raining=is_raining)
            
            if hotel_db < 45.0:
                continue
                
            event_type_str = "Construction" if event.event_type == "permit" else "Crowd Event"
            chain_of_thought = [
                f"Base Noise: {base_db} dB ({event_type_str} at 1m)",
                f"Distance Attenuation: {int(distance)}m removed {round(base_db - (hotel_db + shielding_penalty), 1)} dB"
            ]
            if ray_tracing_penalty > 0:
                chain_of_thought.append(f"Ray-Tracing Penalty: -15.0 dB (Blocked by 3D geometry from Cache)")
            if idiosyncratic_bonus > 0:
                chain_of_thought.append(f"Idiosyncratic Memory Bonus: +{idiosyncratic_bonus} dB")
            if is_raining:
                chain_of_thought.append("Weather Penalty: +3.0 dB")
            chain_of_thought.append(f"Final Predicted Impact: {round(hotel_db, 1)} dB")
            
            severity, recommendation = determine_severity_and_action(hotel_db)
            
            ev_start = event.start_date.strftime('%Y-%m-%d') if event.start_date else 'Unknown'
            ev_end = event.end_date.strftime('%Y-%m-%d') if event.end_date else 'Unknown'
            
            source_desc = f"PLANNED_CONSTRUCTION (From {ev_start} to {ev_end})" if event.event_type == "permit" else f"CROWD_EVENT ({event.description} on {ev_start})"
            
            alerts.append(
                AcousticAlert(
                    source_type=source_desc,
                    severity=severity,
                    predicted_db_increase=round(hotel_db, 1),
                    distance_meters=int(distance),
                    recommendation=recommendation,
                    explainability_chain=chain_of_thought
                )
            )

        # Sort alerts by severity/noise level (highest noise first)
        alerts.sort(key=lambda x: (x.severity == "CRITICAL", x.severity == "HIGH", x.predicted_db_increase), reverse=True)
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        metadata = {
            "processing_time_ms": processing_time_ms,
            "buildings_analyzed": buildings_analyzed,
            "cache_lookups": cache_lookups,
            "cache_status": cache_status
        }
        
        return alerts, weather_condition, metadata
    finally:
        db.close()
