import os
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from app.api.models import DispatchRequest, ForecastResponse
from app.services.acoustic_engine import generate_forecast
from app.integrations.mews_client import push_mews_tasks
from app.integrations.apaleo_client import push_apaleo_maintenance
from app.integrations.rms_client import push_to_rms

router = APIRouter()

API_KEY_NAME = "X-Tacet-Token"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=True)

def get_api_key(api_key: str = Depends(api_key_header)):
    expected_token = os.getenv("TACET_API_TOKEN")
    if not expected_token:
        # If no token is configured in .env, default to insecure mode or hard fail
        # For security, we will hard fail if a token isn't configured for this route.
        raise HTTPException(status_code=500, detail="Server misconfiguration: TACET_API_TOKEN not set.")
        
    if api_key != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Token",
        )
    return api_key

@router.post("/dispatch/daily-report", tags=["Ecosystem"])
def dispatch_daily_report(request: DispatchRequest, api_key: str = Depends(get_api_key)):
    """
    Stateless Webhook Dispatcher.
    Takes a list of hotels, runs the Smart Brain physics engine for each, 
    and POSTs the resulting Acoustic Risk Report to their respective Aetherix webhook URLs.
    """
    results = {
        "successful": 0,
        "failed": 0,
        "errors": []
    }
    
    for dest in request.destinations:
        try:
            # 1. Run the physics engine
            live_alerts, weather_condition, metadata = generate_forecast(
                dest.hotel_id,
                dest.coordinates.lat, 
                dest.coordinates.lon
            )
            
            # 2. Package the payload
            payload = ForecastResponse(
                hotel_id=dest.hotel_id,
                weather_condition=weather_condition,
                metadata=metadata,
                alerts=live_alerts
            )
            
            # 3. Broadcast to Aetherix Webhook OR Native PMS
            if dest.pms_type == "mews":
                push_mews_tasks(live_alerts, dest.pms_property_id)
                results["successful"] += 1
            elif dest.pms_type == "apaleo":
                push_apaleo_maintenance(live_alerts, dest.pms_property_id)
                results["successful"] += 1
            elif dest.pms_type == "rms":
                push_to_rms(live_alerts, dest.pms_property_id)
                results["successful"] += 1
            elif dest.webhook_url:
                resp = requests.post(dest.webhook_url, json=payload.model_dump(), timeout=10)
                resp.raise_for_status()
                results["successful"] += 1
            else:
                # No destination provided
                pass
            
        except requests.exceptions.RequestException as re:
            results["failed"] += 1
            results["errors"].append({"hotel_id": dest.hotel_id, "error": f"Webhook failure: {str(re)}"})
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"hotel_id": dest.hotel_id, "error": f"Engine failure: {str(e)}"})
            
    return {"status": "completed", "dispatch_summary": results}
