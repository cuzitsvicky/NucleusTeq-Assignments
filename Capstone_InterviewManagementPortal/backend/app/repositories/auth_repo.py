"""
Authentication repository containing database operations
related to authentication.
"""

from bson.objectid import ObjectId

from ..core.database import db


async def get_user_by_email(email: str):
    """
    Retrieve a user by email.
    """
    return await db.users.find_one({"email": email.strip().lower()})


async def update_password(
    user_id: str,
    hashed_password: str,
) -> int:
    """
    Update a user's password and clear the reset_required flag.

    Returns:
        int: Number of modified documents.
    """

    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "password": hashed_password,
                "reset_required": False,
            }
        },
    )

    return result.modified_count
