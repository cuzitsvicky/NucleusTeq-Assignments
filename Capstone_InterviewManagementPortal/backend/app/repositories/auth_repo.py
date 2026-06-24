from ..db.database import db
from bson.objectid import ObjectId


def get_user_by_email(email: str):
    """
    Get user by email.

    Args:
        email (str): Email of the user
    
    Returns:
        User document
    """
    return db.users.find_one({"email": email.strip().lower()})


def update_password(user_id: str, hashed_password: str):
    """
    Update user password.

    Args:
        user_id (str): ID of the user
        hashed_password (str): Hashed password
    """
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed_password, "reset_required": False}},
    )
