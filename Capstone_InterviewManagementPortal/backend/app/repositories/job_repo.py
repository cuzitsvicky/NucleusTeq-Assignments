from ..core.database import db
from bson.objectid import ObjectId

from ..constants import PAGE_SIZE


async def create_job(job_data: dict):
    result = await db.jobs.insert_one(job_data)
    return str(result.inserted_id)


async def get_all_jobs(page: int = 1):
    skip = (page - 1) * PAGE_SIZE
    return await db.jobs.find().skip(skip).limit(PAGE_SIZE).to_list(length=PAGE_SIZE)


async def get_job_by_id(job_id: str):
    if not ObjectId.is_valid(job_id):
        return None
    return await db.jobs.find_one({"_id": ObjectId(job_id)})


async def update_job(job_id: str, job_data: dict):
    await db.jobs.update_one({"_id": ObjectId(job_id)}, {"$set": job_data})
