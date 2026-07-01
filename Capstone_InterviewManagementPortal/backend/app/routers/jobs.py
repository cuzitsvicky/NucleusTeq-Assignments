from typing import List

from bson.objectid import ObjectId
from fastapi import APIRouter, Depends

from .auth import check_password_reset
from ..exceptions import (
    BadRequestException,
    ForbiddenException,
)
from ..schemas import JobCreateRequest, JobResponse
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


@router.get("/", response_model=List[JobResponse])
async def get_jobs(
    page: int = 1,
    current_user: dict = Depends(check_password_reset),
):
    if page < 1:
        raise BadRequestException("Page number must be 1 or greater")

    return await job_service.get_jobs(page=page)


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
