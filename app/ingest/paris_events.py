import requests
from typing import List, Dict
from datetime import datetime

PARIS_EVENTS_API = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records"

def fetch_active_events(limit: int = 50, target_start: str = None, target_end: str = None) -> List[Dict]:
    """
    Fetches official cultural events from Paris OpenData.
    Filters them to ensure they overlap with the predictive target dates.
    """
    params = {
        "limit": limit
    }
    
    try:
        response = requests.get(PARIS_EVENTS_API, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        results = data.get("results", [])
        active_events = []
        
        for record in results:
            # The API provides 'date_start' and 'date_end' usually in ISO format
            event_start_str = record.get("date_start")
            event_end_str = record.get("date_end")
            
            if not event_start_str or not event_end_str:
                continue
                
            # Date Filtering Logic
            if target_start and target_end:
                try:
                    # Parse dates
                    req_start = datetime.fromisoformat(target_start)
                    req_end = datetime.fromisoformat(target_end)
                    ev_start = datetime.fromisoformat(event_start_str.replace('Z', '+00:00'))
                    ev_end = datetime.fromisoformat(event_end_str.replace('Z', '+00:00'))
                    
                    # Ensure timezone unaware for simple comparison if needed, or just compare aware.
                    # Since target dates are usually 'YYYY-MM-DD', we just convert everything to naive date
                    req_start_date = req_start.date()
                    req_end_date = req_end.date()
                    ev_start_date = ev_start.date()
                    ev_end_date = ev_end.date()
                    
                    # Overlap math: Max(start1, start2) <= Min(end1, end2)
                    overlap_start = max(req_start_date, ev_start_date)
                    overlap_end = min(req_end_date, ev_end_date)
                    
                    if overlap_start > overlap_end:
                        continue # No overlap, skip this event
                        
                except ValueError:
                    # If date parsing fails, skip strictly
                    continue
                    
            # Extract coordinates (OpenData Paris usually has 'lat_lon' or 'geometry')
            lat_lon = record.get("lat_lon")
            if not lat_lon:
                continue
                
            active_events.append({
                "description": record.get("title", "CULTURAL EVENT"),
                "start_date": event_start_str,
                "end_date": event_end_str,
                "coordinates": {
                    "lat": lat_lon.get("lat") if isinstance(lat_lon, dict) else lat_lon[0],
                    "lon": lat_lon.get("lon") if isinstance(lat_lon, dict) else lat_lon[1]
                }
            })
            
        return active_events
    except Exception as e:
        print(f"Error fetching Paris events: {e}")
        return []
