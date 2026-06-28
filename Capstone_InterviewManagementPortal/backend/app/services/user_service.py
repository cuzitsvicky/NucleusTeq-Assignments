from ..repositories import user_repo
from ..utils import get_password_hash
from ..exceptions import BadRequestException
import logging

logger = logging.getLogger("app")


# For registering user
async def register_user(user_data: dict):
    if await user_repo.get_user_by_email(user_data["email"]):
        raise BadRequestException("Email already registered")
    user_data["password"] = get_password_hash(user_data["password"])
    user_data["active"] = True
    user_data["reset_required"] = True
    user_id = await user_repo.create_user(user_data)
    user_data["id"] = user_id
    logger.info(f"User registered successfully: {user_data['email']} with ID {user_id}")
    return user_data


# For getting all users
async def get_users(page: int = 1):
    users = await user_repo.get_all_users(page=page)
    for u in users:
        u["id"] = str(u.pop("_id"))
        u.pop("password", None)
        if "reset_required" not in u:
            u["reset_required"] = False
    return users


# For updating user
async def update_user(user_id: str, user_data: dict):
    await user_repo.update_user(user_id, user_data)
    logger.info(f"User {user_id} updated details: {user_data}")


# For getting active interviewers
async def get_active_interviewers():
    users = await user_repo.get_active_interviewers()
    for u in users:
        u["id"] = str(u.pop("_id"))
        u.pop("password", None)
        if "reset_required" not in u:
            u["reset_required"] = False
    return users
