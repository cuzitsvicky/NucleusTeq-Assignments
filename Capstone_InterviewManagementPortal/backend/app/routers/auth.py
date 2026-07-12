import logging
from fastapi import APIRouter, Depends
from ..schemas import (
    LoginRequest,
    LoginResponse,
    MessageResponse,
    PasswordResetRequest,
    UserResponse,
)
from ..services import auth_service
from ..services.auth_service import get_current_user, check_password_reset

router = APIRouter()
logger = logging.getLogger(__name__)


# Define the login endpoint to authenticate users and return a token
@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    logger.info("Login request for user: %s", credentials.email)
    user = await auth_service.authenticate_user(credentials.email, credentials.password)

    # Token generation
    token = auth_service.generate_basic_token(credentials.email, credentials.password)
    logger.info("User %s successfully logged in", credentials.email)
    return LoginResponse(user=auth_service.build_user_response(user), token=token)


# Define the endpoint to get the current authenticated user's information
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    logger.info("User info fetched for user: %s", current_user["email"])
    return auth_service.build_user_response(current_user)


# Define the endpoint to reset the current user's password
@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: PasswordResetRequest, current_user: dict = Depends(get_current_user)
):
    logger.info("Password reset requested for user: %s", current_user["email"])
    await auth_service.reset_password(str(current_user["_id"]), payload.new_password)
    logger.info("Password reset completed for user %s", current_user["email"])
    return MessageResponse(message="Password reset successfully")