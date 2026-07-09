from fastapi import APIRouter, Depends
from ..services import dashboard_service
from .auth import check_password_reset

router = APIRouter()


@router.get("/")
async def get_dashboard_stats(current_user: dict = Depends(check_password_reset)):
    return await dashboard_service.get_stats(
        current_user["role"], current_user["email"]
    )
