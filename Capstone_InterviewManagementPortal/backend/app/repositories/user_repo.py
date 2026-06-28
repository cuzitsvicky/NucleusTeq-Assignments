from ..core.database import db
from bson.objectid import ObjectId

from ..constants import PAGE_SIZE


async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email.strip().lower()})


async def get_user_by_id(user_id: str):
    if not ObjectId.is_valid(user_id):
        return None
    return await db.users.find_one({"_id": ObjectId(user_id)})


async def create_user(user_data: dict):
    if "reset_required" not in user_data:
        user_data["reset_required"] = True
    result = await db.users.insert_one(user_data)
    return str(result.inserted_id)


async def get_all_users(page: int = 1):
    skip = (page - 1) * PAGE_SIZE
    return await db.users.find().skip(skip).limit(PAGE_SIZE).to_list(length=PAGE_SIZE)


async def update_user(user_id: str, user_data: dict):
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": user_data})


async def get_active_interviewers():
    return await db.users.find({"role": "Interviewer", "active": True}).to_list(
        length=None
    )
