from pydantic import BaseModel, Field
from typing import List, Optional

class Coordinates(BaseModel):
    lat: float = Field(..., description="Latitude of the hotel")
    lon: float = Field(..., description="Longitude of the hotel")

class ForecastRequest(BaseModel):
    hotel_id: str = Field(..., description="Unique identifier for the hotel property")
    coordinates: Coordinates
    start_date: str = Field(..., description="Forecast start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="Forecast end date in YYYY-MM-DD format")

class AcousticAlert(BaseModel):
    source_type: str = Field(..., description="Type of disruption (e.g., CONSTRUCTION, TRAFFIC)")
    severity: str = Field(..., description="Severity level: LOW, MEDIUM, HIGH, CRITICAL")
    predicted_db_increase: float = Field(..., description="Expected increase in decibels")
    distance_meters: int = Field(..., description="Distance from hotel to the disruption source")
    recommendation: str = Field(..., description="Actionable recommendation for RMS/PMS")

class ForecastResponse(BaseModel):
    hotel_id: str
    status: str = Field(default="success")
    weather_condition: Optional[str] = Field(default=None, description="The prevailing weather condition (e.g., Rain, Clear) that influenced the calculation.")
    metadata: dict = Field(default_factory=dict, description="Processing metadata for explainability (e.g., processing time, buildings analyzed).")
    alerts: List[AcousticAlert]

class DestinationConfig(BaseModel):
    hotel_id: str
    coordinates: Coordinates
    webhook_url: Optional[str] = None
    pms_type: Optional[str] = Field(default=None, description="'mews' or 'apaleo'")
    pms_property_id: Optional[str] = Field(default=None, description="Apaleo property ID or Mews enterprise ID")

class DispatchRequest(BaseModel):
    destinations: List[DestinationConfig]
