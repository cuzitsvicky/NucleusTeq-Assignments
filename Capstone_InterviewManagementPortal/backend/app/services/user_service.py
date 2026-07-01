import logging

from ..exceptions import BadRequestException
from ..repositories import user_repo
from ..utils import get_password_hash

logger = logging.getLogger("__name__")


def format_user(user: dict):
    user["id"] = str(user.pop("_id"))
    user.pop("password", None)
    user.setdefault("reset_required", False)
    return user


def format_user(user: dict):
    user["id"] = str(user.pop("_id"))
    user.pop("password", None)
    user.setdefault("reset_required", False)
    return user


async def register_user(user_data: dict):
    existing_user = await user_repo.get_user_by_email(user_data["email"])

    if existing_user:
        raise BadRequestException("Email already registered")

    user_data["password"] = get_password_hash(user_data["password"])

    user_data.update(
        {
            "active": True,
            "reset_required": True,
        }
    )

    user_id = await user_repo.create_user(user_data)
    user_data["id"] = user_id

    logger.info("User registered successfully: %s", user_data["email"])

    return user_data


async def get_users(page: int = 1):
    users = await user_repo.get_all_users(page)

    return [format_user(user) for user in users]


async def get_user_by_id(user_id: str):
    user = await user_repo.get_user_by_id(user_id)

    if user:
        return format_user(user)

    return None


async def update_user(user_id: str, user_data: dict):
    updated = await user_repo.update_user(user_id, user_data)

    if updated == 0:
        raise BadRequestException("No changes were made")

    logger.info("User %s updated successfully", user_id)


async def get_active_interviewers():
    users = await user_repo.get_active_interviewers()

    return [format_user(user) for user in users]
