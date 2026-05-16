import os
import requests
from typing import List
from app.api.models import AcousticAlert

MEWS_API_URL = "https://api.mews-demo.com/api/connector/v1"

def push_mews_tasks(alerts: List[AcousticAlert], property_id: str = None) -> bool:
    """
    Pushes Critical/High Acoustic Alerts directly to the Mews PMS as native Tasks.
    Uses the Mews Demo API for development.
    """
    client_token = os.getenv("MEWS_CLIENT_TOKEN")
    access_token = os.getenv("MEWS_ACCESS_TOKEN")
    
    if not client_token or not access_token:
        print("Mews tokens missing.")
        return False
        
    for alert in alerts:
        if alert.severity in ["HIGH", "CRITICAL"]:
            payload = {
                "ClientToken": client_token,
                "AccessToken": access_token,
                "Client": "TacetAcousticEngine",
                "Tasks": [
                    {
                        "Name": f"TACET ALERT ({alert.severity})",
                        "Notes": f"Source: {alert.source_type}\nRecommendation: {alert.recommendation}"
                    }
                ]
            }
            try:
                # Note: This is a placeholder payload for tasks/add. 
                # Mews might require specific DepartmentId or EmployeeId.
                resp = requests.post(f"{MEWS_API_URL}/tasks/add", json=payload, timeout=10)
                # In development with demo tokens, we log but don't hard crash the dispatcher if it fails due to exact schema matching
                if resp.status_code != 200:
                    print(f"Mews API Warning: {resp.text}")
            except Exception as e:
                print(f"Mews API error: {e}")
                
    return True
