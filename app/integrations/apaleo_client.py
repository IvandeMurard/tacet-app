import os
import requests
from typing import List
from app.api.models import AcousticAlert

APALEO_AUTH_URL = "https://identity.apaleo.com/connect/token"
APALEO_API_URL = "https://api.apaleo.com"

def get_apaleo_token() -> str:
    """Authenticates via OAuth2 Client Credentials Flow"""
    client_id = os.getenv("APALEO_CLIENT_ID")
    client_secret = os.getenv("APALEO_CLIENT_SECRET")
    
    if not client_id or not client_secret:
        return None
        
    auth_data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    try:
        resp = requests.post(APALEO_AUTH_URL, data=auth_data, timeout=10)
        if resp.status_code == 200:
            return resp.json().get("access_token")
    except Exception as e:
        print(f"Apaleo Auth Error: {e}")
        
    return None

def push_apaleo_maintenance(alerts: List[AcousticAlert], property_id: str) -> bool:
    """
    Pushes Critical/High Acoustic Alerts directly to Apaleo as Maintenance Issues.
    """
    token = get_apaleo_token()
    if not token or not property_id:
        print("Apaleo token or property_id missing.")
        return False
        
    headers = {
        "Authorization": f"Bearer {token}", 
        "Content-Type": "application/json"
    }
    
    for alert in alerts:
        if alert.severity in ["HIGH", "CRITICAL"]:
            payload = {
                "propertyId": property_id,
                "subject": f"TACET ALERT ({alert.severity})",
                "description": f"Source: {alert.source_type}\nRecommendation: {alert.recommendation}",
                "type": "Noise",
            }
            try:
                resp = requests.post(f"{APALEO_API_URL}/maintenance/v1/maintenance-issues", json=payload, headers=headers, timeout=10)
                if resp.status_code not in [200, 201]:
                    print(f"Apaleo API Warning: {resp.text}")
            except Exception as e:
                print(f"Apaleo API error: {e}")
                
    return True
