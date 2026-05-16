from mcp.server.fastmcp import FastMCP
from app.services.acoustic_engine import generate_forecast

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
        forecast = generate_forecast(
            hotel_id=hotel_id,
            hotel_lat=lat,
            hotel_lon=lon,
            target_start=start_date,
            target_end=end_date,
            limit_sites=5
        )
        
        # Return the JSON payload containing the mathematical 'explainability_chain'
        # The calling LLM will parse this to formulate natural language recommendations
        return forecast.model_dump_json(indent=2)
        
    except Exception as e:
        return f"Error computing environmental profile: {str(e)}"

if __name__ == "__main__":
    # Start the MCP server using standard IO (for integration with Claude Desktop or orchestration scripts)
    print("Starting Tacet MCP Server...", flush=True)
    mcp.run()
