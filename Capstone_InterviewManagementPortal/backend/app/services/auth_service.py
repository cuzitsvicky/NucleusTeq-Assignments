import base64
import logging
from ..enums import UserRole
from ..exceptions import (
    BadRequestException,
    ForbiddenException,
    UnauthorizedException,
)
from ..repositories import auth_repo
from ..utils import get_password_hash, verify_password

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
    auth_string = f"{email.strip().lower()}:{password}"
    return base64.b64encode(auth_string.encode("utf-8")).decode("utf-8")


async def authenticate_user(email: str, password: str, is_basic_auth: bool = False) -> dict:
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

    email = email.strip().lower()

    user = await auth_repo.get_user_by_email(email)

    if not user or not verify_password(password, user["password"]):
        headers = {"WWW-Authenticate": "Basic"} if is_basic_auth else None

        raise UnauthorizedException(detail="Invalid email or password", headers=headers)

    if not user.get("active", True):
        logger.warning("Login attempt for disabled account: %s", email)

        raise ForbiddenException(detail="User account is disabled")

    if user.get("role") not in [role.value for role in UserRole]:

        logger.warning("Invalid role '%s' found for user %s",user.get("role"),email)

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
