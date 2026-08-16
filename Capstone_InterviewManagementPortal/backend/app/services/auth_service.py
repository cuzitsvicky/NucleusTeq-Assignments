import base64
import logging
import httpx
from fastapi import Depends, Request
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from ..enums import UserRole
from ..exceptions import (
    BadRequestException,
    ForbiddenException,
    UnauthorizedException,
)
from ..repositories import auth_repo
from ..schemas import UserResponse
from ..utils import get_password_encoded, normalize_email, verify_encoded_password
from ..core.config import settings

logger = logging.getLogger(__name__)
security = HTTPBasic()


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
    if not user or not verify_encoded_password(password, user["password"]):
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
    Update user password with encoded new password.

    Args:
        user_id (str): User ID.
        new_password (str): New plain text password (will be encoded).

    Raises:
        BadRequestException: Password update failed.
    """

    encoded_password = get_password_encoded(new_password)
    updated = await auth_repo.update_password(user_id, encoded_password)
    if updated == 0:
        raise BadRequestException("Password could not be updated")
    logger.info("Password reset successfully for user %s", user_id)


async def verify_keycloak_token(token: str) -> dict:
    """
    Verify Keycloak token by calling the OIDC /userinfo endpoint.
    Returns the MongoDB user dict matching the email if valid.
    """
    url = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/userinfo"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                userinfo = response.json()
                email = userinfo.get("email")
                if not email:
                    raise UnauthorizedException(detail="Keycloak token does not contain email")
                
                # Fetch user details from MongoDB using email
                user = await auth_repo.get_user_by_email(email)
                if not user:
                    raise ForbiddenException(detail="User email is not registered in the system")
                
                return user
            else:
                logger.warning("Keycloak token verification failed: %s %s", response.status_code, response.text)
                raise UnauthorizedException(detail="Invalid or expired token")
    except httpx.RequestError as exc:
        logger.error("Error communicating with Keycloak: %s", exc)
        raise UnauthorizedException(detail="Authentication service unavailable")


# Get the current authenticated user supporting both Keycloak Bearer token and HTTP Basic authentication
async def get_current_user(request: Request):
    if hasattr(request, "headers"):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise UnauthorizedException(detail="Missing authorization header")
        
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            return await verify_keycloak_token(token)
        elif auth_header.startswith("Basic "):
            try:
                scheme, param = auth_header.split(" ", 1)
                decoded = base64.b64decode(param).decode("utf-8")
                username, password = decoded.split(":", 1)
                return await authenticate_user(username, password, is_basic_auth=True)
            except Exception:
                raise UnauthorizedException(detail="Invalid basic auth format")
        else:
            raise UnauthorizedException(detail="Unsupported authorization scheme")
    elif hasattr(request, "username") and hasattr(request, "password"):
        # This is for backward compatibility and test runners directly passing HTTPBasicCredentials
        return await authenticate_user(request.username, request.password, is_basic_auth=True)
    else:
        raise UnauthorizedException(detail="Invalid request or credentials type")


# Check if the current user is required to reset their password on first login
async def check_password_reset(current_user: dict = Depends(get_current_user)):
    if current_user.get("reset_required", False):
        logger.warning("Password reset required before proceeding for user: %s", current_user.get("email", "Unknown"))
        raise ForbiddenException(detail="Password reset required on first login")
    return current_user
