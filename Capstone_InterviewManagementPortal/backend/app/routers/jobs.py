import logging
from bson.objectid import ObjectId
from fastapi import APIRouter, Depends, Query

from ..services.auth_service import check_password_reset
from ..exceptions import (
    BadRequestException,
)
from ..schemas import JobCreateRequest, JobResponse, MessageResponse, PaginatedResponse
from ..enums import UserRole
from ..services import job_service
from ..utils import require_roles

router = APIRouter()
logger = logging.getLogger(__name__)


# Endpoint to create a new job posting
@router.post("/", response_model=JobResponse)
async def create_job(
    job: JobCreateRequest, current_user: dict = Depends(check_password_reset)
):
    require_roles(current_user, {UserRole.HR})
    logger.info("API request to create job: %s by HR user: %s", job.title, current_user["email"])
    new_job = await job_service.create_job(job.model_dump())
    logger.info("Job created successfully with ID: %s", new_job.get("id"))
    return JobResponse(**new_job)


# Endpoint to get a list of jobs with optional filters and pagination
@router.get("/", response_model=PaginatedResponse[JobResponse])
async def get_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    name: str = "",
    employment_type: str = "",
    location: str = "",
    experience: str = "",
    current_user: dict = Depends(check_password_reset),
):
    logger.info("API request to fetch jobs with page: %d, limit: %d, title query: %s, user: %s", page, limit, name, current_user["email"])
    return await job_service.get_jobs(
        page=page,
        limit=limit,
        name=name,
        employment_type=employment_type,
        location=location,
        experience=experience,
    )


# Endpoint to get a specific job by ID
@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, current_user: dict = Depends(check_password_reset)):
    logger.info("API request to fetch job ID: %s by user: %s", job_id, current_user["email"])
    if not ObjectId.is_valid(job_id):
        logger.warning("Invalid job ID format requested: %s", job_id)
        raise BadRequestException("Invalid job ID format")
    job = await job_service.get_job_by_id(job_id)
    return JobResponse(**job)


# Endpoint to update a specific job by ID
@router.put("/{job_id}", response_model=MessageResponse)
async def update_job(
    job_id: str,
    job: JobCreateRequest,
    current_user: dict = Depends(check_password_reset),
):
    require_roles(current_user, {UserRole.HR})
    logger.info("API request to update job ID: %s by HR user: %s", job_id, current_user["email"])
    if not ObjectId.is_valid(job_id):
        logger.warning("Invalid job ID format requested for update: %s", job_id)
        raise BadRequestException("Invalid job ID format")
    await job_service.update_job(job_id, job.model_dump())
    logger.info("Job ID: %s updated successfully", job_id)
    return MessageResponse(message="Job updated")
