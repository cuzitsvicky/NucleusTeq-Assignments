import base64
import logging
from fastapi import Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from ..enums import UserRole
from ..exceptions import (
    BadRequestException,
    ForbiddenException,
    UnauthorizedException,
)
from ..repositories import auth_repo
from ..schemas import UserResponse
from ..utils import get_password_hash, normalize_email, verify_password

logger = logging.getLogger(__name__)


def generate_basic_token(email: str, password: str) -> str:
    """
    Generate a base64-encoded Basic Auth token from email and password.

    Args:
        email (str): User email (will be lowercased).
        password (str): User password.

    Returns:
        str: Base64-encoded token in format 'base64(email:password)'.
    """
    auth_string = f"{normalize_email(email)}:{password}"
    return base64.b64encode(auth_string.encode("utf-8")).decode("utf-8")


def build_user_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        name=user.get("name", ""),
        email=user["email"],
        role=user["role"],
        active=user.get("active", True),
        reset_required=user.get("reset_required", False),
    )


async def authenticate_user(
    email: str, password: str, is_basic_auth: bool = False
) -> dict:
    """
    Validate user credentials and return user record if valid.

    Checks email/password, account status, and role validity.

    Args:
        email (str): User email.
        password (str): User password.
        is_basic_auth (bool): If True, adds 'WWW-Authenticate' header to error.

    Returns:
        dict: User record.

    Raises:
        UnauthorizedException: Invalid credentials.
        ForbiddenException: Account disabled or invalid role.
    """

    email = normalize_email(email)
    user = await auth_repo.get_user_by_email(email)
    if not user or not verify_password(password, user["password"]):
        headers = {"WWW-Authenticate": "Basic"} if is_basic_auth else None
        raise UnauthorizedException(detail="Invalid email or password", headers=headers)

    if not user.get("active", True):
        logger.warning("Login attempt for disabled account: %s", email)
        raise ForbiddenException(detail="User account is disabled")

    if user.get("role") not in [role.value for role in UserRole]:
        logger.warning("Invalid role '%s' found for user %s", user.get("role"), email)
        raise ForbiddenException(detail="Invalid user role configuration")

    logger.info("User authenticated successfully: %s", email)
    return user


async def reset_password(user_id: str, new_password: str):
    """
    Update user password with hashed new password.

    Args:
        user_id (str): User ID.
        new_password (str): New plain text password (will be hashed).

    Raises:
        BadRequestException: Password update failed.
    """

    hashed_password = get_password_hash(new_password)
    updated = await auth_repo.update_password(user_id, hashed_password)
    if updated == 0:
        raise BadRequestException("Password could not be updated")
    logger.info("Password reset successfully for user %s", user_id)


security = HTTPBasic()


# Get the current authenticated user using HTTP Basic authentication
async def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    logger.info("Authenticating user via basic auth: %s", credentials.username)
    return await authenticate_user(
        credentials.username,
        credentials.password,
        is_basic_auth=True,
    )


# Check if the current user is required to reset their password on first login
async def check_password_reset(current_user: dict = Depends(get_current_user)):
    if current_user.get("reset_required", False):
        logger.warning("Password reset required before proceeding for user: %s", current_user.get("email", "Unknown"))
        raise ForbiddenException(detail="Password reset required on first login")
    return current_user
