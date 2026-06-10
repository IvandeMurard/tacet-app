from mcp.server.fastmcp import FastMCP
from app.services.acoustic_engine import generate_forecast
from app.services.paris_signals import query_paris_events
from app.ingest.worker import sync_external_data
from app.database import SessionLocal
from app.models.db_models import GeoEvent

# Initialize the MCP Server
# This transforms Tacet into an Agentic Node that can be queried by LLMs (like Aetherix or Claude)
mcp = FastMCP("Tacet Environmental Twin")

@mcp.tool()
def get_environmental_risk_profile(hotel_id: str, lat: float, lon: float, start_date: str, end_date: str) -> str:
    """
    Retrieves the complete environmental risk profile (Acoustics, Crowds, Weather, Transit) 
    for a specific hotel. Use this tool when another agent (like Aetherix) needs to know 
    if external factors will disrupt operations, impact ESG KPIs, or require yield adjustments.
    
    Args:
        hotel_id: The unique identifier of the hotel (e.g. "HOTEL_PARIS_1")
        lat: Latitude of the hotel
        lon: Longitude of the hotel
        start_date: Target forecast start date (YYYY-MM-DD)
        end_date: Target forecast end date (YYYY-MM-DD)
    """
    try:
        # Generate the predictive forecast via the 3D Ray-Tracing and Dual Memory engine
        alerts, weather_condition, metadata = generate_forecast(
            hotel_id=hotel_id,
            hotel_lat=lat,
            hotel_lon=lon,
            target_start=start_date,
            target_end=end_date,
            limit_sites=5
        )
        
        # Return the JSON payload containing the mathematical 'explainability_chain'
        # The calling LLM will parse this to formulate natural language recommendations
        response_data = {
            "alerts": [alert.model_dump() for alert in alerts],
            "weather_condition": weather_condition,
            "metadata": metadata
        }
        import json
        return json.dumps(response_data, indent=2)
        
    except Exception as e:
        return f"Error computing environmental profile: {str(e)}"

@mcp.tool()
def get_paris_events(lat: float, lon: float, radius_km: float, start_date: str, end_date: str, categories: list[str] = None) -> str:
    """
    Retrieves events from Paris Open Data (cultural events, street permits, weather, transit strikes) 
    within a specific radius and date range, computing a global risk score.
    Use this to give an agent context on what is happening around a property.
    
    Args:
        lat: Latitude of the center point (e.g. 48.8566 for Paris center)
        lon: Longitude of the center point (e.g. 2.3522)
        radius_km: Radius in kilometers to search within
        start_date: Target start date (YYYY-MM-DD)
        end_date: Target end date (YYYY-MM-DD)
        categories: Optional list of categories to filter (e.g. ["crowd_event", "permit", "extreme_weather", "transit_strike"]). 
                    If empty or None, all events are returned.
    """
    try:
        # On-Demand Ingestion check: If DB is empty, trigger sync
        db = SessionLocal()
        try:
            count = db.query(GeoEvent).count()
            if count == 0:
                print("Database is empty, triggering on-demand ingestion...", flush=True)
                sync_external_data()
        finally:
            db.close()

        result = query_paris_events(
            lat=lat,
            lon=lon,
            radius_km=radius_km,
            start_date=start_date,
            end_date=end_date,
            categories=categories
        )
        import json
        return json.dumps(result, indent=2)
    except Exception as e:
        return f"Error fetching Paris events: {str(e)}"

if __name__ == "__main__":
    # Start the MCP server using standard IO (for integration with Claude Desktop or orchestration scripts)
    print("Starting Tacet MCP Server...", flush=True)
    mcp.run()
