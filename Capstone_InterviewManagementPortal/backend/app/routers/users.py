"""
User router containing endpoints for user management and registration.
"""

from typing import List

from fastapi import APIRouter, Depends

from ..exceptions import (
    BadRequestException,
    ForbiddenException,
    NotFoundException,
)
from ..schemas import (
    UserCreateRequest,
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


@router.get("/users", response_model=List[UserResponse])
async def get_users(
    page: int = 1,
    current_user: dict = Depends(check_password_reset),
):
    if current_user["role"] != "Admin":
        raise ForbiddenException("Not authorized")

    if page < 1:
        raise BadRequestException("Page number must be 1 or greater")

    return await user_service.get_users(page)


@router.get("/interviewers", response_model=List[UserResponse])
async def get_interviewers(
    current_user: dict = Depends(check_password_reset),
):
    if current_user["role"] not in ("Admin", "HR"):
        raise ForbiddenException("Not authorized")

    return await user_service.get_active_interviewers()


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
