import pytest
from bson import ObjectId

from app.exceptions import NotFoundException
from app.services import job_service
from tests.conftest import async_return


@pytest.mark.asyncio
async def test_create_job_adds_id(monkeypatch, job_payload):
    monkeypatch.setattr(job_service.job_repo, "create_job", async_return("job-id"))

    result = await job_service.create_job(job_payload.copy())

    assert result["id"] == "job-id"


@pytest.mark.asyncio
async def test_get_jobs_formats_ids(monkeypatch, object_ids, job_payload):
    job = {"_id": ObjectId(object_ids.job), **job_payload}
    monkeypatch.setattr(job_service.job_repo, "get_all_jobs", async_return(([job], 1)))

    result = await job_service.get_jobs(1, 10, "Python")

    assert result["data"][0]["id"] == object_ids.job
    assert "_id" not in result["data"][0]
    assert result["total"] == 1


@pytest.mark.asyncio
async def test_get_job_by_id_found(monkeypatch, object_ids, job_payload):
    monkeypatch.setattr(job_service.job_repo, "get_job_by_id", async_return({"_id": ObjectId(object_ids.job), **job_payload}))

    result = await job_service.get_job_by_id(object_ids.job)

    assert result["id"] == object_ids.job


@pytest.mark.asyncio
async def test_get_job_by_id_missing(monkeypatch):
    monkeypatch.setattr(job_service.job_repo, "get_job_by_id", async_return(None))

    with pytest.raises(NotFoundException) as exc:
        await job_service.get_job_by_id("missing")

    assert exc.value.detail == "Job not found"


@pytest.mark.asyncio
async def test_update_job_success(monkeypatch, object_ids):
    monkeypatch.setattr(job_service.job_repo, "get_job_by_id", async_return({"_id": ObjectId(object_ids.job)}))
    update_job = async_return(None)
    monkeypatch.setattr(job_service.job_repo, "update_job", update_job)

    await job_service.update_job(object_ids.job, {"title": "Updated"})

    update_job.assert_awaited_once_with(object_ids.job, {"title": "Updated"})


@pytest.mark.asyncio
async def test_update_job_missing(monkeypatch):
    monkeypatch.setattr(job_service.job_repo, "get_job_by_id", async_return(None))

    with pytest.raises(NotFoundException):
        await job_service.update_job("missing", {"title": "Updated"})
