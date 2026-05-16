from typing import List, Dict

def fetch_extreme_weather_alerts(hotel_lat: float, hotel_lon: float, target_start: str = None, target_end: str = None) -> List[Dict]:
    """
    Connects to Meteo France / European Severe Weather Database APIs.
    Detects severe heatwaves, flooding, or storms that impact operational logistics.
    """
    # Mocked data demonstrating the API contract for extreme weather events
    return [
        {
            "source_type": "EXTREME_WEATHER (HEATWAVE)",
            "description": "Extreme Heatwave predicted. Red Alert.",
            "start_date": "2026-07-15",
            "end_date": "2026-07-20",
            "severity": "CRITICAL",
            "recommendation": "Activate heatwave protocol. Recommend increasing prices for AC-equipped rooms, order extra water inventory, and monitor AC maintenance."
        }
    ]
