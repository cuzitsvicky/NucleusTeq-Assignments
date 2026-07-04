"""
User router containing endpoints for user management and registration.
"""

from fastapi import APIRouter, Depends, Query

from ..exceptions import (
    ForbiddenException,
    NotFoundException,
)
from ..schemas import (
    UserCreateRequest,
    PaginatedResponse,
    UserResponse,
    UserUpdateRequest,
)
from ..services import user_service
from .auth import check_password_reset

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(
    user: UserCreateRequest,
    current_user: dict = Depends(check_password_reset),
):
    if current_user["role"] != "Admin":
        raise ForbiddenException("Only administrators can create users")

    new_user = await user_service.register_user(user.model_dump())
    return UserResponse(**new_user)


@router.get("/users", response_model=PaginatedResponse[UserResponse])
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    name: str = "",
    role: str = "",
    current_user: dict = Depends(check_password_reset),
):
    if current_user["role"] != "Admin":
        raise ForbiddenException("Not authorized")

    return await user_service.get_users(page, limit, name, role)


@router.get("/interviewers", response_model=PaginatedResponse[UserResponse])
async def get_interviewers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(check_password_reset),
):
    if current_user["role"] not in ("Admin", "HR"):
        raise ForbiddenException("Not authorized")

    return await user_service.get_active_interviewers(page, limit)


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_update: UserUpdateRequest,
    current_user: dict = Depends(check_password_reset),
):
    if current_user["role"] != "Admin":
        raise ForbiddenException("Not authorized")

    if str(current_user["_id"]) == user_id:
        raise ForbiddenException("You cannot update your own account")

    target_user = await user_service.get_user_by_id(user_id)

    if not target_user:
        raise NotFoundException("User not found")

    await user_service.update_user(
        user_id,
        user_update.model_dump(),
    )

    return {"message": "User updated"}
