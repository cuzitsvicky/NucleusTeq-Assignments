from bson.objectid import ObjectId
from fastapi import APIRouter, Depends, Query

from .auth import check_password_reset
from ..exceptions import (
    BadRequestException,
    ForbiddenException,
)
from ..schemas import JobCreateRequest, JobResponse, PaginatedResponse
from ..services import job_service

router = APIRouter()


@router.post("/", response_model=JobResponse)
async def create_job(
    job: JobCreateRequest,
    current_user: dict = Depends(check_password_reset),
):
    if current_user["role"] not in ["Admin", "HR"]:
        raise ForbiddenException("Not authorized")

    new_job = await job_service.create_job(job.model_dump())

    return JobResponse(**new_job)


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
    return await job_service.get_jobs(
        page=page,
        limit=limit,
        name=name,
        employment_type=employment_type,
        location=location,
        experience=experience,
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    current_user: dict = Depends(check_password_reset),
):
    if not ObjectId.is_valid(job_id):
        raise BadRequestException("Invalid job ID format")

    job = await job_service.get_job_by_id(job_id)

    return JobResponse(**job)


@router.put("/{job_id}")
async def update_job(
    job_id: str,
    job: JobCreateRequest,
    current_user: dict = Depends(check_password_reset),
):
    if current_user["role"] not in ["Admin", "HR"]:
        raise ForbiddenException("Not authorized")

    if not ObjectId.is_valid(job_id):
        raise BadRequestException("Invalid job ID format")

    await job_service.update_job(job_id, job.model_dump())

    return {"message": "Job updated"}
