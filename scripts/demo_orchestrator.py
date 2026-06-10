import sys
import os
import json
import time
from unittest.mock import patch
from fastapi.testclient import TestClient

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.mcp_server import get_environmental_risk_profile
from app.database import SessionLocal, engine, Base
from app.models.db_models import FeedbackEvent

# Recreate DB to start clean for the demo
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

HOTEL_ID = "HOTEL_PARIS_TEST"
LAT = 48.8683
LON = 2.3283
TARGET_START = "2026-06-05"
TARGET_END = "2026-06-10"

# Mock the Paris Permits API so we guarantee a loud construction site right next to the hotel
def mock_fetch_permits(*args, **kwargs):
    return [{
        "id": "MOCK_CONSTRUCTION_1",
        "description": "Heavy jackhammering and road excavation",
        "start_date": "2026-06-01",
        "end_date": "2026-06-30",
        "impact_level": "SEVERE",
        "address": "10 Rue de la Paix, 75002 Paris",
        "coordinates": {"lat": 48.8685, "lon": 2.3284} # Very close (approx 20 meters)
    }]

def format_slack_alert(tacet_json: str):
    """Translates the raw JSON from Tacet into a digestible Aetherix alert."""
    data = json.loads(tacet_json)
    alerts = data.get("alerts", [])
    
    if not alerts:
        print("\n[AETHERIX MESSAGE] ALL CLEAR. No severe environmental risks detected.")
        return
        
    print("\n[AETHERIX MESSAGE] WARNING: Environmental Risk Detected")
    for alert in alerts:
        print(f"-> Source: {alert['source_type']}")
        print(f"-> Severity: {alert['severity']}")
        if alert['predicted_db_increase'] > 0:
            print(f"-> Predicted Noise: {alert['predicted_db_increase']} dB (Distance: {alert['distance_meters']}m)")
        print(f"-> Aetherix Operational Recommendation: {alert['recommendation']}")
        print(f"-> Tacet Physics Chain: {' | '.join(alert['explainability_chain'])}")
        print("--------------------------------------------------")

@patch('app.services.acoustic_engine.fetch_active_permits', side_effect=mock_fetch_permits)
def run_demo(mock_permits):
    print("==================================================")
    print("DEMO: THE AUTONOMOUS FEEDBACK LOOP (AGENTIC MEMORY)")
    print("==================================================")
    
    time.sleep(1)
    print("\n--- PHASE 1: TACET DETECTS A RISK ---")
    print(f"Tacet analyzes {HOTEL_ID} surroundings...")
    
    # 1. Tacet MCP outputs JSON
    tacet_json = get_environmental_risk_profile(HOTEL_ID, LAT, LON, TARGET_START, TARGET_END)
    
    # 2. Aetherix digests it
    format_slack_alert(tacet_json)
    time.sleep(2)
    
    print("\n--- PHASE 2: THE AUTONOMOUS FEEDBACK (AETHERIX OBSERVES THE PMS) ---")
    print("Aetherix checks the hotel's PMS (Mews/Apaleo) 4 hours later to see if the Revenue Manager lowered the price.")
    print("PMS State: No yield changes were made. The RM ignored the recommendation.")
    time.sleep(2)
    
    print("Aetherix Deduction: The RM knows this specific room has triple-glazed windows. The alert was a false positive for this specific physical property.")
    print("Aetherix Action: Autonomously logging a 'REJECTED' feedback into Tacet's Idiosyncratic Memory.")
    
    # 3. Autonomous Feedback Loop
    payload = {
        "hotel_id": HOTEL_ID,
        "source_type": "PLANNED_CONSTRUCTION",
        "action": "REJECTED"
    }
    
    # We simulate Aetherix doing this multiple times over a few months to build statistical weight
    for _ in range(8): 
        client.post("/api/v1/feedback", json=payload)
        
    print("MEMORY UPDATED: Tacet has learned the physical idiosyncrasies of this hotel.")
    time.sleep(2)
    
    print("\n--- PHASE 3: TACET'S NEXT SCAN (LEARNING IN ACTION) ---")
    print(f"Tacet re-analyzes {HOTEL_ID} the next day...")
    
    # 4. Tacet MCP outputs JSON again
    tacet_json_2 = get_environmental_risk_profile(HOTEL_ID, LAT, LON, TARGET_START, TARGET_END)
    
    # 5. Aetherix digests it again
    format_slack_alert(tacet_json_2)
    
    print("\n==================================================")
    print("DEMO COMPLETE")
    print("==================================================")

if __name__ == "__main__":
    run_demo()
