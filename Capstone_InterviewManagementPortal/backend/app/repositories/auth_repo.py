from ..db.database import db
from bson.objectid import ObjectId


def get_user_by_email(email: str):
    return db.users.find_one({"email": email.strip().lower()})


def update_password(user_id: str, hashed_password: str):
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed_password, "reset_required": False}},
    )
