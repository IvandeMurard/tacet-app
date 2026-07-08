from fastapi import APIRouter
from app.services.sensory_memory import get_sensory_analytics

router = APIRouter()

@router.get("/analytics/sensory-intel", tags=["Analytics"])
def fetch_sensory_intelligence():
    """
    Retrieves the global learnings and statistical aggregations of the Tacet Sensory Memory.
    Useful for proving ROI to Revenue Managers.
    """
    data = get_sensory_analytics()
    return {
        "status": "success",
        "intelligence": data
    }
