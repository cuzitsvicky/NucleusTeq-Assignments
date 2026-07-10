import logging
from bson.objectid import ObjectId
from ..core.database import db
from ..utils import normalize_email

logger = logging.getLogger(__name__)


# Get a user by email, ensuring the email is stripped of whitespace and converted to lowercase for consistency.
async def get_user_by_email(email: str):
    logger.info("Fetching user by email from database: %s", email)
    return await db.users.find_one({"email": normalize_email(email)})


# Update Password for a user by their unique ID, ensuring the ID is valid before updating the database.
async def update_password(user_id: str, hashed_password: str) -> int:
    logger.info("Updating password for user ID: %s in database", user_id)
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "password": hashed_password,
                "reset_required": False,
            }
        },
    )
    # Return the number of documents modified (should be 1 if successful, 0 if no document was found with the given user_id)
    logger.info("Password update modified %d document(s) for user ID: %s", result.modified_count, user_id)
    return result.modified_count
