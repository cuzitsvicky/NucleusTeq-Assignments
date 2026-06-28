import logging
from fastapi import APIRouter, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from ..schemas import (
    UserResponse,
    PasswordResetRequest,
    LoginRequest,
    LoginResponse,
)
from ..services import auth_service

from ..exceptions import ForbiddenException

router = APIRouter()
security = HTTPBasic()
logger = logging.getLogger("app")


async def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    return await auth_service.authenticate_user(
        credentials.username, credentials.password, is_basic_auth=True
    )


async def check_password_reset(current_user: dict = Depends(get_current_user)):
    if current_user.get("reset_required", False):
        raise ForbiddenException(detail="Password reset required on first login")
    return current_user


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    user = await auth_service.authenticate_user(credentials.email, credentials.password)
    
    # Generate the basic auth token (base64 of "email:password")
    import base64
    auth_str = f"{credentials.email.strip().lower()}:{credentials.password}"
    token = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")
    
    return LoginResponse(
        user=UserResponse(
            id=str(user["_id"]),
            name=user.get("name", ""),
            email=user["email"],
            role=user["role"],
            active=user.get("active", True),
            reset_required=user.get("reset_required", False),
        ),
        token=token
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user.get("name", ""),
        email=current_user["email"],
        role=current_user["role"],
        active=current_user.get("active", True),
        reset_required=current_user.get("reset_required", False),
    )


@router.post("/reset-password")
async def reset_password(
    payload: PasswordResetRequest, current_user: dict = Depends(get_current_user)
):
    await auth_service.reset_password(str(current_user["_id"]), payload.new_password)
    return {"message": "Password reset successfully"}
