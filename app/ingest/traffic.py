import os
import requests
from typing import Optional

def fetch_traffic_congestion(lat: float, lon: float) -> Optional[dict]:
    """
    Fetches real-time traffic flow data from TomTom for the nearest road segment.
    Returns a dictionary containing the congestion_ratio (current_speed / free_flow_speed).
    """
    api_key = os.getenv("TOMTOM_API_KEY")
    if not api_key:
        print("Warning: TOMTOM_API_KEY not found in environment.")
        return None

    # TomTom Flow Segment Data API endpoint
    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point={lat},{lon}&key={api_key}"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        flow_data = data.get("flowSegmentData", {})
        current_speed = flow_data.get("currentSpeed")
        free_flow_speed = flow_data.get("freeFlowSpeed")
        
        if current_speed is None or free_flow_speed is None or free_flow_speed == 0:
            return None
            
        congestion_ratio = current_speed / free_flow_speed
        
        return {
            "current_speed": current_speed,
            "free_flow_speed": free_flow_speed,
            "congestion_ratio": congestion_ratio
        }
    except Exception as e:
        print(f"Failed to fetch traffic data: {e}")
        return None
