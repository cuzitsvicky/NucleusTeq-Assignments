from ..core.database import db
from bson.objectid import ObjectId

from ..utils.pagination import paginate_collection

# To create a new job in the database
async def create_job(job_data: dict):
    result = await db.jobs.insert_one(job_data)
    return str(result.inserted_id)

# To get all jobs with optional filters and pagination
async def get_all_jobs(page: int = 1, limit: int = 10, name: str = "", employment_type: str = "", location: str = "", experience: str = ""):
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

    return await paginate_collection(db.jobs, query, page, limit, sort=("_id", -1))

# To get a job by ID
async def get_job_by_id(job_id: str):
    if not ObjectId.is_valid(job_id):
        return None
    return await db.jobs.find_one({"_id": ObjectId(job_id)})

# To update a job by ID
async def update_job(job_id: str, job_data: dict):
    await db.jobs.update_one({"_id": ObjectId(job_id)}, {"$set": job_data})
