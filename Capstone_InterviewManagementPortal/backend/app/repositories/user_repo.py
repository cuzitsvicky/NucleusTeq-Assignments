import logging
from bson.objectid import ObjectId
from ..core.database import db
from ..enums import UserRole
from ..utils.pagination import paginate_collection
from ..utils import normalize_email

logger = logging.getLogger(__name__)


# Function to get a user by email, ensuring the email is stripped of whitespace and converted to lowercase for consistency.
async def get_user_by_email(email: str):
    logger.info("Fetching user by email from database: %s", email)
    return await db.users.find_one({"email": normalize_email(email)})


# Get a user by their unique ID, ensuring the ID is valid before querying the database.
async def get_user_by_id(user_id: str):
    if not ObjectId.is_valid(user_id):
        logger.warning("Invalid user ID format requested: %s", user_id)
        return None
    logger.info("Fetching user by ID from database: %s", user_id)
    return await db.users.find_one({"_id": ObjectId(user_id)})


# Function to create a new user in the database
async def create_user(user_data: dict):
    logger.info("Inserting new user into database: %s", user_data.get("email"))
    user_data.setdefault("reset_required", True)
    result = await db.users.insert_one(user_data)
    logger.info("User inserted in database with ID: %s", result.inserted_id)
    return str(result.inserted_id)


# Function to get all users with optional filters and pagination
async def get_all_users(page: int = 1, limit: int = 10, name: str = "", role: str = ""):
    query = {}
    if name:
        query["name"] = {
            "$regex": name.strip(),
            "$options": "i",
        }
    if role:
        query["role"] = role
    logger.info("Retrieving users with query: %s, page: %d, limit: %d", query, page, limit)
    return await paginate_collection(db.users, query, page, limit, sort=("_id", -1))


# Function to update a user's information in the database
async def update_user(user_id: str, user_data: dict):
    logger.info("Updating user details in database for ID: %s", user_id)
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": user_data},
    )
    logger.info("User updated. Modified %d document(s) for ID: %s", result.modified_count, user_id)
    return result.modified_count


# Function to get active interviewers with pagination
async def get_active_interviewers(page: int = 1, limit: int = 10):
    query = {"role": UserRole.INTERVIEWER.value, "active": True}
    logger.info("Retrieving active interviewers with page: %d, limit: %d", page, limit)
    return await paginate_collection(db.users, query, page, limit, sort=("_id", -1))
