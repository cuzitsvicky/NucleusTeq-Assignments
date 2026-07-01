import logging

from ..exceptions import NotFoundException
from ..repositories import job_repo

logger = logging.getLogger(__name__)


async def create_job(job_data: dict):
    job_id = await job_repo.create_job(job_data)
    job_data["id"] = job_id

    logger.info("Job created successfully: %s", job_id)

    return job_data


async def get_jobs(page: int = 1):
    jobs = await job_repo.get_all_jobs(page=page)

    for job in jobs:
        job["id"] = str(job.pop("_id"))

    return jobs


async def get_job_by_id(job_id: str):
    job = await job_repo.get_job_by_id(job_id)

    if not job:
        logger.warning("Job not found: %s", job_id)
        raise NotFoundException("Job not found")

    job["id"] = str(job.pop("_id"))

    return job


async def update_job(job_id: str, job_data: dict):
    job = await job_repo.get_job_by_id(job_id)

    if not job:
        logger.warning("Attempt to update non-existent job: %s", job_id)
        raise NotFoundException("Job not found")

    await job_repo.update_job(job_id, job_data)

    logger.info("Job updated successfully: %s", job_id)
