import logging
from fastapi import APIRouter, Depends
from ..services import dashboard_service
from ..services.auth_service import check_password_reset

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
async def get_dashboard_stats(current_user: dict = Depends(check_password_reset)):
    logger.info("API request to fetch dashboard stats for user: %s", current_user["email"])
    return await dashboard_service.get_stats(
        current_user["role"], current_user["email"]
    )
