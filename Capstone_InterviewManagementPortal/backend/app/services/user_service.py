import logging

from ..exceptions import BadRequestException
from ..enums import UserRole
from ..repositories import interview_repo, user_repo
from ..utils.pagination import build_paginated_response
from ..utils import get_password_encoded

logger = logging.getLogger(__name__)


def format_user(user: dict):
    user["id"] = str(user.pop("_id"))
    user.pop("password", None)
    user.setdefault("reset_required", False)
    return user


async def register_user(user_data: dict):
    """
    Register a new user with encoded password.
    
    Args:
        user_data (dict): User details including email, password, name, and role.
    
    Returns:
        dict: Created user data with ID.
    
    Raises:
        BadRequestException: If email already registered.
    """
    
    existing_user = await user_repo.get_user_by_email(user_data["email"])
    if existing_user:
        logger.warning("Registration failed. Email already registered: %s", user_data["email"])
        raise BadRequestException("Email already registered")
    user_data["password"] = get_password_encoded(user_data["password"])
    user_data.update({"active": True, "reset_required": True,})
    user_id = await user_repo.create_user(user_data)
    user_data["id"] = user_id

    logger.info("User registered successfully: %s", user_data.get("email", "Unknown"))

    return user_data


async def get_users(page: int = 1, limit: int = 10, name: str = "", role: str = ""):
    """
    Fetch paginated list of users with optional filters.
    
    Args:
        page (int): Page number (default: 1).
        limit (int): Results per page (default: 10).
        name (str): Filter by user name.
        role (str): Filter by user role.
    
    Returns:
        dict: Paginated response with users and total count.
    """

    logger.info("Fetching users with filter: name='%s', role='%s', page=%d, limit=%d", name, role, page, limit)
    users, total = await user_repo.get_all_users(page, limit, name, role)
    return build_paginated_response([format_user(user) for user in users], page, limit, total)


async def get_user_by_id(user_id: str):
    """
    Fetch single user by ID.
    
    Args:
        user_id (str): User ID.
    
    Returns:
        dict: User record or None if not found.
    """

    logger.info("Fetching user details for ID: %s", user_id)
    user = await user_repo.get_user_by_id(user_id)
    if user:
        return format_user(user)
    logger.warning("User not found for ID: %s", user_id)
    return None


async def update_user(user_id: str, user_data: dict):
    """
    Update user profile data.
    
    Args:
        user_id (str): User ID.
        user_data (dict): Updated user data.
    
    Raises:
        BadRequestException: If no changes made or update fails.
    """

    if user_data.get("active") is False:
        existing_user = await user_repo.get_user_by_id(user_id)

        if (
            existing_user
            and existing_user.get("role") == UserRole.INTERVIEWER
            and await interview_repo.interviewer_has_pending_future_interview(existing_user["email"])
        ):
            logger.warning(
                "Cannot disable interviewer %s. They have a pending scheduled interview.",
                existing_user["email"]
            )
            raise BadRequestException(
                "Interviewer cannot be disabled while a future scheduled interview is pending"
            )

    updated = await user_repo.update_user(user_id, user_data)
    if updated == 0:
        logger.warning("No changes made during update for user ID: %s", user_id)
        raise BadRequestException("No changes were made")
    logger.info("User %s updated successfully", user_id)


async def get_active_interviewers(page: int = 1, limit: int = 10):
    """
    Fetch paginated list of active interviewers.
    
    Args:
        page (int): Page number (default: 1).
        limit (int): Results per page (default: 10).
    
    Returns:
        dict: Paginated response with active interviewers.
    """

    users, total = await user_repo.get_active_interviewers(page, limit)
    return build_paginated_response([format_user(user) for user in users], page, limit, total)
