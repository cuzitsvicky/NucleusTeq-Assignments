import logging
from typing import List
from fastapi import APIRouter, Depends

from ..schemas import (
    UserCreateRequest,
    UserUpdateRequest,
    UserResponse,
)
from ..services import user_service
from ..repositories import user_repo
from ..exceptions import (
    ForbiddenException,
    NotFoundException,
    BadRequestException,
)
from .auth import check_password_reset

router = APIRouter()
logger = logging.getLogger("app")


@router.post("/register", response_model=UserResponse)
def register(user: UserCreateRequest, current_user: dict = Depends(check_password_reset)):
    """
    Registers a new user in the system.
    Only administrators are allowed to create users.
    """
    if current_user["role"] not in ["Admin"]:
        raise ForbiddenException(detail="Only administrators can create users")
    new_user = user_service.register_user(user.model_dump())
    return UserResponse(
        id=str(new_user["id"]),
        name=new_user["name"],
        email=new_user["email"],
        role=new_user["role"],
        active=new_user.get("active", True),
        reset_required=new_user.get("reset_required", True),
    )


@router.get("/users", response_model=List[UserResponse])
def get_users(page: int = 1, current_user: dict = Depends(check_password_reset)):
    """
    Retrieves a paginated list of all registered users.
    Only administrators are allowed to view this list.
    """
    if current_user["role"] not in ["Admin"]:
        raise ForbiddenException(detail="Not authorized")
    if page < 1:
        raise BadRequestException("Page number must be 1 or greater")
    return user_service.get_users(page=page)


@router.get("/interviewers", response_model=List[UserResponse])
def get_interviewers(current_user: dict = Depends(check_password_reset)):
    """
    Retrieves a list of all active interviewers.
    Access is restricted to Admin and HR roles.
    """
    if current_user["role"] not in ["Admin", "HR"]:
        raise ForbiddenException(detail="Not authorized")
    return user_service.get_active_interviewers()


@router.put("/users/{user_id}")
def update_user(
    user_id: str,
    user_update: UserUpdateRequest,
    current_user: dict = Depends(check_password_reset),
):
    """
    Updates the profile details (name, role, active status) of a user.
    Only administrators are allowed to edit users. Users cannot update their own account.
    """
    if current_user["role"] not in ["Admin"]:
        raise ForbiddenException(detail="Not authorized")
    if str(current_user["_id"]) == user_id:
        raise ForbiddenException(detail="You cannot update your own account")
    target_user = user_repo.get_user_by_id(user_id)
    if not target_user:
        raise NotFoundException(detail="User not found")
    user_service.update_user(user_id, user_update.model_dump())
    return {"message": "User updated"}

