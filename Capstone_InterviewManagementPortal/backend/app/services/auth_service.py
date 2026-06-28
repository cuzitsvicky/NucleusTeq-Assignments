import logging
from ..repositories import auth_repo
from ..utils import verify_password, get_password_hash
from ..exceptions import UnauthorizedException, ForbiddenException

logger = logging.getLogger("app")


async def authenticate_user(email: str, password: str, is_basic_auth: bool = False) -> dict:
    user = await auth_repo.get_user_by_email(email.strip().lower())
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
    from ..enums import UserRole
    if user.get("role") not in [r.value for r in UserRole]:
        logger.warning(f"Login attempt with invalid role: {user.get('role')} for email: {email}")
        raise ForbiddenException(detail="Invalid user role configuration")
        
    return user


async def reset_password(user_id: str, new_password: str):
    hashed = get_password_hash(new_password)
    await auth_repo.update_password(user_id, hashed)
    logger.info(f"User {user_id} reset their password successfully")
