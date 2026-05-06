from fastapi import APIRouter
from app.api.models import ForecastRequest, ForecastResponse, AcousticAlert

router = APIRouter()

@router.post("/forecast", response_model=ForecastResponse)
async def get_acoustic_forecast(request: ForecastRequest):
    """
    Generate an acoustic forecast for a given hotel location.
    Currently returning mock data to establish the API contract.
    """
    
    # Mock Response Logic (To be replaced by the Acoustic Engine)
    mock_alert = AcousticAlert(
        source_type="CONSTRUCTION",
        severity="HIGH",
        predicted_db_increase=12.5,
        distance_meters=150,
        recommendation="Reduce booking price by 10% for street-facing rooms. Reassign VIPs."
    )
    
    return ForecastResponse(
        hotel_id=request.hotel_id,
        alerts=[mock_alert]
    )
