import logging
from fastapi import APIRouter, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from ..schemas import (
    LoginRequest,
    LoginResponse,
    MessageResponse,
    PasswordResetRequest,
    UserResponse,
)
from ..services import auth_service
from ..exceptions import ForbiddenException

router = APIRouter()
security = HTTPBasic()
logger = logging.getLogger(__name__)


# Get the current authenticated user using HTTP Basic authentication
async def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    return await auth_service.authenticate_user(
        credentials.username,
        credentials.password,
        is_basic_auth=True,
    )


# Check if the current user is required to reset their password on first login
async def check_password_reset(current_user: dict = Depends(get_current_user)):
    if current_user.get("reset_required", False):
        raise ForbiddenException(detail="Password reset required on first login")
    return current_user


# Define the login endpoint to authenticate users and return a token
@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    user = await auth_service.authenticate_user(credentials.email, credentials.password)

    # Token generation
    token = auth_service.generate_basic_token(credentials.email, credentials.password)
    return LoginResponse(user=auth_service.build_user_response(user), token=token)


# Define the endpoint to get the current authenticated user's information
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return auth_service.build_user_response(current_user)


# Define the endpoint to reset the current user's password
@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: PasswordResetRequest, current_user: dict = Depends(get_current_user)
):
    await auth_service.reset_password(str(current_user["_id"]), payload.new_password)
    logger.info("Password reset completed for user %s", current_user["email"])
    return MessageResponse(message="Password reset successfully")