import pytest

from app.exceptions import BadRequestException, ForbiddenException
from app.routers import jobs
from app.schemas import JobCreateRequest
from tests.conftest import async_return


@pytest.mark.asyncio
async def test_create_job_requires_hr(admin_user, job_payload):
    with pytest.raises(ForbiddenException):
        await jobs.create_job(JobCreateRequest(**job_payload), admin_user)


@pytest.mark.asyncio
async def test_create_job_success(monkeypatch, hr_user, job_payload):
    monkeypatch.setattr(jobs.job_service, "create_job", async_return({"id": "job-id", **job_payload}))

    result = await jobs.create_job(JobCreateRequest(**job_payload), hr_user)

    assert result.id == "job-id"


@pytest.mark.asyncio
async def test_get_jobs(monkeypatch, hr_user):
    monkeypatch.setattr(jobs.job_service, "get_jobs", async_return({"data": []}))

    result = await jobs.get_jobs(name="Python", current_user=hr_user)

    assert result == {"data": []}


@pytest.mark.asyncio
async def test_get_job_invalid_id(hr_user):
    with pytest.raises(BadRequestException):
        await jobs.get_job("bad-id", hr_user)


@pytest.mark.asyncio
async def test_get_job_success(monkeypatch, hr_user, object_ids, job_payload):
    monkeypatch.setattr(jobs.job_service, "get_job_by_id", async_return({"id": object_ids.job, **job_payload}))

    result = await jobs.get_job(object_ids.job, hr_user)

    assert result.id == object_ids.job


@pytest.mark.asyncio
async def test_update_job_requires_hr(admin_user, object_ids, job_payload):
    with pytest.raises(ForbiddenException):
        await jobs.update_job(object_ids.job, JobCreateRequest(**job_payload), admin_user)


@pytest.mark.asyncio
async def test_update_job_invalid_id(hr_user, job_payload):
    with pytest.raises(BadRequestException):
        await jobs.update_job("bad-id", JobCreateRequest(**job_payload), hr_user)


@pytest.mark.asyncio
async def test_update_job_success(monkeypatch, hr_user, object_ids, job_payload):
    update = async_return(None)
    monkeypatch.setattr(jobs.job_service, "update_job", update)

    result = await jobs.update_job(object_ids.job, JobCreateRequest(**job_payload), hr_user)

    assert result == {"message": "Job updated"}
    update.assert_awaited_once()
