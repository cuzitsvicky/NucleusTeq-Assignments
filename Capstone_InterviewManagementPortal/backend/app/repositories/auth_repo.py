from ..core.database import db
from bson.objectid import ObjectId


async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email.strip().lower()})


async def update_password(user_id: str, hashed_password: str):
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed_password, "reset_required": False}},
    )
