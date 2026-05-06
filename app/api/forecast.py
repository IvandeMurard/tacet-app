from fastapi import APIRouter
from app.api.models import ForecastRequest, ForecastResponse, AcousticAlert
from app.services.acoustic_engine import generate_forecast

router = APIRouter()

@router.post("/forecast", response_model=ForecastResponse)
async def get_acoustic_forecast(request: ForecastRequest):
    """
    Generate an acoustic forecast for a given hotel location.
    Calculates geographic distance to construction sites and applies acoustic attenuation.
    """
    
    hotel_lat = request.coordinates.lat
    hotel_lon = request.coordinates.lon
    target_start = request.start_date
    target_end = request.end_date
    
    # Run the brain
    live_alerts, weather_condition, metadata = generate_forecast(
        hotel_lat, 
        hotel_lon, 
        target_start=target_start, 
        target_end=target_end
    )
    
    return ForecastResponse(
        hotel_id=request.hotel_id,
        weather_condition=weather_condition,
        metadata=metadata,
        alerts=live_alerts
    )
