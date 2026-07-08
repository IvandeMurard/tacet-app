import sys
import os

# Add the project root to the path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.mcp_server import get_environmental_risk_profile

def run_test():
    print("--- Simulating Aetherix Orchestrator querying Tacet MCP Node ---")
    
    # Coordinates for a luxury hotel in Paris (e.g. near Place Vendôme)
    hotel_id = "HOTEL_VENDOME_01"
    lat = 48.8683
    lon = 2.3283
    start_date = "2026-06-05"
    end_date = "2026-06-10"
    
    print(f"Requesting Environmental Risk Profile for {hotel_id} (Lat: {lat}, Lon: {lon})")
    print(f"Target Dates: {start_date} to {end_date}")
    print("Executing Ray-Tracing & Data Ingestion (This may take a few seconds)...\n")
    
    # Directly invoke the tool function that the FastMCP server exposes
    json_result = get_environmental_risk_profile(
        hotel_id=hotel_id,
        lat=lat,
        lon=lon,
        start_date=start_date,
        end_date=end_date
    )
    
    print("--- RESULT FROM TACET MCP SERVER ---")
    print(json_result)
    print("\n--- TEST COMPLETE ---")

if __name__ == "__main__":
    run_test()
