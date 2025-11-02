from fastapi import APIRouter
from datetime import datetime, timezone
from database import check_database_connection

router = APIRouter()


@router.get("/healthz")
async def health_check():
    """
    Health check endpoint that returns the status of the backend and database.
    Performs a database connection check and returns the result.
    """
    # Check database connection
    db_connected = await check_database_connection()
    
    # Overall status should be degraded if database is not connected
    overall_status = "healthy" if db_connected else "degraded"
    
    return {
        "status": overall_status,
        "database": "connected" if db_connected else "disconnected",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }