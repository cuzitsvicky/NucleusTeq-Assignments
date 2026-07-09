from fastapi import APIRouter, Depends, Query
from ..exceptions import (
    ForbiddenException,
    NotFoundException,
)
from ..schemas import (
    MessageResponse,
    UserCreateRequest,
    PaginatedResponse,
    UserResponse,
    UserUpdateRequest,
)
from ..enums import UserRole
from ..services import user_service
from ..utils import require_roles
from .auth import check_password_reset

router = APIRouter()


# Helper function to check if the user has Admin role
@router.post("/register", response_model=UserResponse)
async def register(
    user: UserCreateRequest, current_user: dict = Depends(check_password_reset)
):
    require_roles(
        current_user, {UserRole.ADMIN}, "Only admin can create users"
    )
    new_user = await user_service.register_user(user.model_dump())
    return UserResponse(**new_user)


# Endpoint to get a list of users with optional filters and pagination
@router.get("/users", response_model=PaginatedResponse[UserResponse])
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    name: str = "",
    role: str = "",
    current_user: dict = Depends(check_password_reset),
):
    require_roles(current_user, {UserRole.ADMIN})
    return await user_service.get_users(page, limit, name, role)


# Endpoint to get a list of active interviewers with pagination
@router.get("/interviewers", response_model=PaginatedResponse[UserResponse])
async def get_interviewers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(check_password_reset),
):
    require_roles(current_user, {UserRole.ADMIN, UserRole.HR})
    return await user_service.get_active_interviewers(page, limit)


# Endpoint to update a specific user's information
@router.put("/users/{user_id}", response_model=MessageResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdateRequest,
    current_user: dict = Depends(check_password_reset),
):
    require_roles(current_user, {UserRole.ADMIN})
    if str(current_user["_id"]) == user_id:
        raise ForbiddenException("You cannot update your own account")
    target_user = await user_service.get_user_by_id(user_id)
    if not target_user:
        raise NotFoundException("User not found")
    await user_service.update_user(user_id, user_update.model_dump())
    return MessageResponse(message="User updated")
