import logging
from ..repositories import auth_repo
from ..utils import verify_password, get_password_hash
from ..exceptions import UnauthorizedException, ForbiddenException
from ..enums import UserRole


logger = logging.getLogger("app")

def authenticate_user(email: str, password: str, is_basic_auth: bool = False) -> dict:
    """
    Authenticate user.

    Args:
        email (str): Email of the user
        password (str): Password of the user
        is_basic_auth (bool): Whether the authentication is basic auth
    
    Returns:
        dict: User document
    
    Raises:
        UnauthorizedException: If the user is not authenticated
        ForbiddenException: If the user is disabled
    """
    user = auth_repo.get_user_by_email(email.strip().lower())
    if not user or not verify_password(password, user["password"]):
        headers = {"WWW-Authenticate": "Basic"} if is_basic_auth else None
        raise UnauthorizedException(
            detail="Invalid email or password",
            headers=headers
        )
    if not user.get("active", True):
        logger.warning(f"Login attempt for disabled account: {email}")
        raise ForbiddenException(detail="User account is disabled")
    # Validate role
    if user.get("role") not in [r.value for r in UserRole]:
        logger.warning(f"Login attempt with invalid role: {user.get('role')} for email: {email}")
        raise ForbiddenException(detail="Invalid user role configuration")
    return user


def reset_password(user_id: str, new_password: str):
    """
    Reset password.

    Args:
        user_id (str): ID of the user
        new_password (str): New password
    
    Returns:
        None
    """
    hashed = get_password_hash(new_password)
    auth_repo.update_password(user_id, hashed)
    logger.info(f"User {user_id} reset their password successfully")
