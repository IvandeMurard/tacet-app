import math
from app.api.models import AcousticAlert
from app.ingest.paris_permits import fetch_active_permits

# Base assumptions for the V1 Synthetic Model
BASE_CONSTRUCTION_DB_AT_1M = 90.0
URBAN_SHIELDING_PENALTY_DB = 10.0

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

def calculate_db_attenuation(distance_meters: float) -> float:
    """
    Calculates the resulting decibel level at a given distance using the Inverse Square Law.
    dB = dB_source - 20 * log10(Distance).
    Applies the Urban Shielding Penalty.
    """
    if distance_meters <= 1.0:
        return BASE_CONSTRUCTION_DB_AT_1M - URBAN_SHIELDING_PENALTY_DB
        
    attenuation = 20 * math.log10(distance_meters)
    hotel_db = BASE_CONSTRUCTION_DB_AT_1M - attenuation - URBAN_SHIELDING_PENALTY_DB
    
    # Floor it at 35 dB (ambient city noise)
    return max(35.0, hotel_db)

def determine_severity_and_action(hotel_db: float) -> tuple[str, str]:
    """
    Returns (severity, recommendation) based on the Severity Matrix thresholds.
    """
    if hotel_db > 65.0:
        return "CRITICAL", "Reduce booking price by 15% for affected street-facing rooms. Reassign VIP guests."
    elif hotel_db >= 55.0:
        return "HIGH", "Warn guests of potential disruption. Ensure soundproof windows are sealed."
    elif hotel_db >= 45.0:
        return "MEDIUM", "Monitor reviews. Consider offering earplugs or complimentary breakfast."
    else:
        return "LOW", "No immediate action required."

def generate_forecast(hotel_lat: float, hotel_lon: float, limit_sites: int = 20) -> list[AcousticAlert]:
    """
    Core business logic: Fetches permits, calculates distance to hotel, 
    calculates noise attenuation, and generates alerts if impact is significant.
    """
    permits = fetch_active_permits(limit=limit_sites)
    if not permits:
        return []
        
    alerts = []
    
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
            
        # 2. Acoustic Math
        hotel_db = calculate_db_attenuation(distance)
        
        # If noise is < 45 dB, it's considered ambient and we don't alert
        if hotel_db < 45.0:
            continue
            
        # 3. Severity Matrix
        severity, recommendation = determine_severity_and_action(hotel_db)
        
        alert = AcousticAlert(
            source_type=permit.get("description", "CONSTRUCTION"),
            severity=severity,
            predicted_db_increase=round(hotel_db, 1),
            distance_meters=int(distance),
            recommendation=recommendation
        )
        alerts.append(alert)
        
    # Sort alerts by severity/noise level (highest noise first)
    alerts.sort(key=lambda x: x.predicted_db_increase, reverse=True)
    return alerts
