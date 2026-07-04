from bson.objectid import ObjectId

from ..core.database import db
from ..utils.pagination import paginate_collection


async def get_user_by_email(email: str):
    return await db.users.find_one(
        {
            "email": email.strip().lower(),
        }
    )


async def get_user_by_id(user_id: str):
    if not ObjectId.is_valid(user_id):
        return None

    return await db.users.find_one(
        {
            "_id": ObjectId(user_id),
        }
    )


async def create_user(user_data: dict):
    user_data.setdefault("reset_required", True)

    result = await db.users.insert_one(user_data)

    return str(result.inserted_id)


async def get_all_users(
    page: int = 1,
    limit: int = 10,
    name: str = "",
    role: str = "",
):
    query = {}

    if name:
        query["name"] = {
            "$regex": name.strip(),
            "$options": "i",
        }

    if role:
        query["role"] = role

    return await paginate_collection(db.users, query, page, limit)


async def update_user(user_id: str, user_data: dict):
    result = await db.users.update_one(
        {
            "_id": ObjectId(user_id),
        },
        {
            "$set": user_data,
        },
    )

    return result.modified_count


async def get_active_interviewers(page: int = 1, limit: int = 10):
    query = {
        "role": "Interviewer",
        "active": True,
    }

    return await paginate_collection(db.users, query, page, limit)
