import datetime
import logging
from bson.objectid import ObjectId
from ..core.database import db
from ..utils import normalize_email
from ..utils.pagination import paginate_collection

logger = logging.getLogger(__name__)


# To create a new candidate in the database
async def create_candidate(candidate_data: dict) -> str:
    logger.info("Inserting new candidate in database: %s %s", candidate_data.get("first_name"), candidate_data.get("last_name"))
    result = await db.candidates.insert_one(candidate_data)
    logger.info("Candidate inserted in database with ID: %s", result.inserted_id)
    return str(result.inserted_id)


# To get all candidates with optional filters and pagination
async def get_all_candidates(
    page: int = 1,
    limit: int = 10,
    name: str = "",
    email: str = "",
    status: str = "",
    applied_job_id: str = "",
):
    query = {}
    conditions = []

    if name:
        conditions.append(
            {
                "$or": [
                    {"first_name": {"$regex": name.strip(), "$options": "i"}},
                    {"last_name": {"$regex": name.strip(), "$options": "i"}},
                ]
            }
        )
    if email:
        conditions.append({"email": {"$regex": email.strip(), "$options": "i"}})
    if status:
        conditions.append({"status": status})
    if applied_job_id:
        conditions.append({"applied_job_id": applied_job_id})
    if conditions:
        query["$and"] = conditions
    
    logger.info("Retrieving candidates with query: %s, page: %d, limit: %d", query, page, limit)
    return await paginate_collection(
        db.candidates, query, page, limit, sort=("_id", -1)
    )


# To get a candidate by ID
async def get_candidate_by_id(candidate_id: str):
    if not ObjectId.is_valid(candidate_id):
        logger.warning("Invalid candidate ID format requested: %s", candidate_id)
        return None
    logger.info("Fetching candidate by ID from database: %s", candidate_id)
    return await db.candidates.find_one({"_id": ObjectId(candidate_id)})


# To get a candidate by email or mobile
async def get_candidate_by_email_or_mobile(email: str, mobile: str):
    logger.info("Fetching candidate by email: %s or mobile: %s", email, mobile)
    return await db.candidates.find_one(
        {
            "$or": [
                {"email": normalize_email(email)},
                {"mobile": mobile},
            ]
        }
    )


# To get a candidate by email or mobile excluding a specific candidate ID
async def get_candidate_by_email_or_mobile_exclude(
    email: str, mobile: str, exclude_id: str
):
    logger.info("Checking candidate existence for email: %s or mobile: %s excluding ID: %s", email, mobile, exclude_id)
    return await db.candidates.find_one(
        {
            "_id": {"$ne": ObjectId(exclude_id)},
            "$or": [
                {"email": normalize_email(email)},
                {"mobile": mobile},
            ],
        }
    )


# To update candidate details
async def update_candidate(candidate_id: str, candidate_data: dict) -> int:
    logger.info("Updating candidate details in database for ID: %s", candidate_id)
    result = await db.candidates.update_one(
        {"_id": ObjectId(candidate_id)}, {"$set": candidate_data}
    )
    logger.info("Candidate details updated. Modified %d document(s) for ID: %s", result.modified_count, candidate_id)
    return result.modified_count


# To update candidate status
async def update_candidate_status(candidate_id: str, status: str) -> int:
    logger.info("Updating candidate status to %s for ID: %s in database", status, candidate_id)
    result = await db.candidates.update_one(
        {"_id": ObjectId(candidate_id)},
        {"$set": {"status": status}},
    )
    logger.info("Candidate status updated. Modified %d document(s) for ID: %s", result.modified_count, candidate_id)
    return result.modified_count


# To store candidate status history
async def add_status_history(candidate_id: str, status: str, updated_by: str):
    logger.info("Adding status history record in database for Candidate: %s, Status: %s, Updated By: %s", candidate_id, status, updated_by)
    await db.status_history.insert_one(
        {
            "candidate_id": candidate_id,
            "status": status,
            "updated_by": updated_by,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
    )


# get candidate status history with pagination
async def get_status_history(candidate_id: str, page: int = 1, limit: int = 10):
    logger.info("Retrieving candidate status history from database for Candidate: %s, Page: %d, Limit: %d", candidate_id, page, limit)
    return await paginate_collection(
        db.status_history,
        {"candidate_id": candidate_id},
        page,
        limit,
        sort=("timestamp", -1),
    )


# get candidates by a list of ids with pagination
async def get_candidates_by_ids(candidate_ids: list, page: int = 1, limit: int = 10):
    logger.info("Retrieving candidates by IDs: %s, Page: %d, Limit: %d", candidate_ids, page, limit)
    object_ids = [ObjectId(cid) for cid in candidate_ids]
    return await paginate_collection(
        db.candidates, {"_id": {"$in": object_ids}}, page, limit, sort=("_id", -1)
    )
