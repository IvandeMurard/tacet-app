import os
import requests
from typing import Optional

def fetch_current_weather(lat: float, lon: float) -> Optional[dict]:
    """
    Fetches the current weather for a given lat/lon using OpenWeatherMap.
    Returns a dictionary with 'main' (e.g., Rain, Clear) and 'description'.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        print("Warning: OPENWEATHER_API_KEY not found in environment.")
        return None

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        # We extract the primary weather condition (e.g. 'Rain', 'Clouds', 'Clear', 'Snow')
        weather_main = data.get("weather", [{}])[0].get("main", "Unknown")
        weather_desc = data.get("weather", [{}])[0].get("description", "unknown")
        
        return {
            "main": weather_main,
            "description": weather_desc,
            "temp": data.get("main", {}).get("temp")
        }
    except Exception as e:
        print(f"Failed to fetch weather data: {e}")
        return None
