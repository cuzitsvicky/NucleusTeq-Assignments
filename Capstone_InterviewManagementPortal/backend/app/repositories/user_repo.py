from ..core.database import db
from bson.objectid import ObjectId

from ..constants import PAGE_SIZE

# For getting user by email
def get_user_by_email(email: str):
    return db.users.find_one({"email": email.strip().lower()})

# For getting user by ID
def get_user_by_id(user_id: str):
    if not ObjectId.is_valid(user_id):
        return None
    return db.users.find_one({"_id": ObjectId(user_id)})

# For creating user
def create_user(user_data: dict):
    if "reset_required" not in user_data:
        user_data["reset_required"] = True
    result = db.users.insert_one(user_data)
    return str(result.inserted_id)

# For getting all users
def get_all_users(page: int = 1):
    skip = (page - 1) * PAGE_SIZE
    return list(db.users.find().skip(skip).limit(PAGE_SIZE))

# For updating user
def update_user(user_id: str, user_data: dict):
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": user_data})

# For getting active interviewers
def get_active_interviewers():
    return list(db.users.find({"role": "Interviewer", "active": True}))
