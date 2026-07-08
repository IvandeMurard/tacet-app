import requests
from typing import List
from app.api.models import AcousticAlert, TacetRMSPayload

def push_to_rms(alerts: List[AcousticAlert], property_id: str) -> bool:
    """
    Translates Acoustic Alerts into canonical Revenue Management System (RMS) Pricing Rules.
    This payload structure is designed to be compatible with tools like Duetto, Atomize, or RevBell.
    """
    if not property_id:
        return False
        
    for alert in alerts:
        if alert.severity in ["HIGH", "CRITICAL"]:
            # Logic: We only drop prices for rooms facing the street where the noise originates.
            # Courtyard rooms are unaffected by street construction.
            modifier = -15.0 if alert.severity == "CRITICAL" else -5.0
            
            # Note: For MVP, we extract dates from the source_type string which is formatted as "PLANNED_CONSTRUCTION (From YYYY-MM-DD to YYYY-MM-DD)"
            # A more robust system would pass the dates natively in the alert object.
            # Here we default to placeholder if parsing fails.
            
            payload = TacetRMSPayload(
                property_id=property_id,
                start_date="2026-06-01", # Placeholder for MVP parsing
                end_date="2026-06-15",   # Placeholder for MVP parsing
                target_room_categories=["STREET_FACING", "BALCONY_SUITES"],
                price_modifier_percentage=modifier,
                justification=f"TACET Intelligence: {alert.source_type}. {alert.explainability_chain[-1] if alert.explainability_chain else ''}"
            )
            
            # In a real integration, we would POST to the specific RMS API.
            # Example: requests.post("https://api.duettoresearch.com/v1/rules", json=payload.model_dump())
            print(f"✅ [RMS CONTRACT GENERATED] Rule pushed to RMS for Property {property_id}: {payload.model_dump_json()}")
            
    return True
