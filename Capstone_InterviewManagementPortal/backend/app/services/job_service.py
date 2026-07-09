import logging
from ..exceptions import NotFoundException
from ..repositories import job_repo
from ..utils.pagination import build_paginated_response

logger = logging.getLogger(__name__)


async def create_job(job_data: dict):
    """
    Create a new job posting.
    
    Args:
        job_data (dict): Job details including title, description, employment_type, location, experience.
    
    Returns:
        dict: Created job data with ID.
    """

    job_id = await job_repo.create_job(job_data)
    job_data["id"] = job_id
    logger.info("Job created successfully: %s", job_id)

    return job_data


async def get_jobs(
    page: int = 1,
    limit: int = 10,
    name: str = "",
    employment_type: str = "",
    location: str = "",
    experience: str = "",
):
    """
    Fetch paginated list of jobs with optional filters.
    
    Args:
        page (int): Page number (default: 1).
        limit (int): Results per page (default: 10).
        name (str): Filter by job title.
        employment_type (str): Filter by employment type.
        location (str): Filter by job location.
        experience (str): Filter by required experience.
    
    Returns:
        dict: Paginated response with jobs and total count.
    """
    
    jobs, total = await job_repo.get_all_jobs(
        page=page,
        limit=limit,
        name=name,
        employment_type=employment_type,
        location=location,
        experience=experience,
    )

    for job in jobs:
        job["id"] = str(job.pop("_id"))

    return build_paginated_response(jobs, page, limit, total)


async def get_job_by_id(job_id: str):
    """
    Fetch a single job by ID.
    
    Args:
        job_id (str): Job ID.
    
    Returns:
        dict: Job record.
    
    Raises:
        NotFoundException: If job not found.
    """
    job = await job_repo.get_job_by_id(job_id)

    if not job:
        logger.warning("Job not found: %s", job_id)
        raise NotFoundException("Job not found")

    job["id"] = str(job.pop("_id"))

    return job


async def update_job(job_id: str, job_data: dict):
    """
    Update an existing job posting.
    
    Args:
        job_id (str): Job ID.
        job_data (dict): Updated job data.
    
    Raises:
        NotFoundException: If job not found.
    """
    job = await job_repo.get_job_by_id(job_id)

    if not job:
        logger.warning("Attempt to update non-existent job: %s", job_id)
        raise NotFoundException("Job not found")

    await job_repo.update_job(job_id, job_data)

    logger.info("Job updated successfully: %s", job_id)
