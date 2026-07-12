import logging
from ..core.database import db
from bson.objectid import ObjectId

from ..utils.pagination import paginate_collection

logger = logging.getLogger(__name__)


# To create a new job in the database
async def create_job(job_data: dict):
    logger.info("Inserting new job into database: %s", job_data.get("title"))
    result = await db.jobs.insert_one(job_data)
    logger.info("Job inserted in database with ID: %s", result.inserted_id)
    return str(result.inserted_id)


# To get all jobs with optional filters and pagination
async def get_all_jobs(
    page: int = 1,
    limit: int = 10,
    name: str = "",
    employment_type: str = "",
    location: str = "",
    experience: str = "",
):
    query = {}
    if name:
        query["title"] = {
            "$regex": name.strip(),
            "$options": "i",
        }
    if employment_type:
        query["employment_type"] = employment_type
    if location:
        query["location"] = {
            "$regex": location.strip(),
            "$options": "i",
        }
    if experience:
        query["experience_required"] = {
            "$regex": experience.strip(),
            "$options": "i",
        }
    logger.info("Retrieving jobs with query: %s, page: %d, limit: %d", query, page, limit)
    return await paginate_collection(db.jobs, query, page, limit, sort=("_id", -1))


# To get a job by ID
async def get_job_by_id(job_id: str):
    if not ObjectId.is_valid(job_id):
        logger.warning("Invalid job ID format requested: %s", job_id)
        return None
    logger.info("Fetching job by ID from database: %s", job_id)
    return await db.jobs.find_one({"_id": ObjectId(job_id)})


# To update a job by ID
async def update_job(job_id: str, job_data: dict):
    logger.info("Updating job ID: %s in database", job_id)
    await db.jobs.update_one({"_id": ObjectId(job_id)}, {"$set": job_data})
