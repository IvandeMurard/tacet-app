from fastapi import APIRouter
from app.services.hive_mind import get_hive_analytics

router = APIRouter()

@router.get("/analytics/hive-intel", tags=["Analytics"])
def fetch_hive_intelligence():
    """
    Retrieves the global learnings and statistical aggregations of the Tacet Hive Mind.
    Useful for proving ROI to Revenue Managers.
    """
    data = get_hive_analytics()
    return {
        "status": "success",
        "intelligence": data
    }
