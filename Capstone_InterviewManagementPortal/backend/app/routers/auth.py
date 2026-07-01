"""
Authentication router containing login, current user and password reset endpoints.
"""

import logging

from fastapi import APIRouter, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from ..schemas import (
    LoginRequest,
    LoginResponse,
    PasswordResetRequest,
    UserResponse,
)
from ..services import auth_service
from ..exceptions import ForbiddenException

router = APIRouter()
security = HTTPBasic()

logger = logging.getLogger(__name__)


def build_user_response(user: dict) -> UserResponse:
    """
    Convert database user document into UserResponse schema.
    """
    return UserResponse(
        id=str(user["_id"]),
        name=user.get("name", ""),
        email=user["email"],
        role=user["role"],
        active=user.get("active", True),
        reset_required=user.get("reset_required", False),
    )


async def get_current_user(
    credentials: HTTPBasicCredentials = Depends(security),
):
    """
    Authenticate a user using HTTP Basic Authentication.
    """
    return await auth_service.authenticate_user(
        credentials.username,
        credentials.password,
        is_basic_auth=True,
    )


async def check_password_reset(
    current_user: dict = Depends(get_current_user),
):
    """
    Prevent users with reset_required=True from accessing protected endpoints.
    """
    if current_user.get("reset_required", False):
        raise ForbiddenException(detail="Password reset required on first login")

    return current_user


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Authenticate user and return profile along with Basic Auth token.
    """

    user = await auth_service.authenticate_user(
        credentials.email,
        credentials.password,
    )

    token = auth_service.generate_basic_token(
        credentials.email,
        credentials.password,
    )

    return LoginResponse(
        user=build_user_response(user),
        token=token,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
):
    """
    Return details of currently authenticated user.
    """
    return build_user_response(current_user)


@router.post("/reset-password")
async def reset_password(
    payload: PasswordResetRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Reset the authenticated user's password.
    """

    await auth_service.reset_password(
        str(current_user["_id"]),
        payload.new_password,
    )

    logger.info(
        "Password reset completed for user %s",
        current_user["email"],
    )

    return {"message": "Password reset successfully"}
