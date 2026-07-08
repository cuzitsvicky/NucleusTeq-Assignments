from types import SimpleNamespace

import pytest
from bson import ObjectId

from app.repositories import job_repo
from tests.conftest import FakeCollection, async_return


@pytest.mark.asyncio
async def test_create_job(monkeypatch):
    jobs = FakeCollection()
    monkeypatch.setattr(job_repo, "db", SimpleNamespace(jobs=jobs))

    job_id = await job_repo.create_job({"title": "API"})

    assert ObjectId.is_valid(job_id)
    assert jobs.inserted == [{"title": "API"}]


@pytest.mark.asyncio
async def test_get_all_jobs_builds_all_filters(monkeypatch):
    paginate = async_return(([{"title": "API"}], 1))
    monkeypatch.setattr(job_repo, "paginate_collection", paginate)
    monkeypatch.setattr(job_repo, "db", SimpleNamespace(jobs=object()))

    result = await job_repo.get_all_jobs(1, 10, " API ", "Full Time", " Pune ", "2 years")

    assert result == ([{"title": "API"}], 1)
    paginate.assert_awaited_once_with(
        job_repo.db.jobs,
        {
            "title": {"$regex": "API", "$options": "i"},
            "employment_type": "Full Time",
            "location": {"$regex": "Pune", "$options": "i"},
            "experience_required": {"$regex": "2 years", "$options": "i"},
        },
        1,
        10,
        sort=("_id", -1),
    )


@pytest.mark.asyncio
async def test_get_job_by_id_invalid_returns_none():
    assert await job_repo.get_job_by_id("invalid") is None


@pytest.mark.asyncio
async def test_get_job_by_id_queries_object_id(monkeypatch, object_ids):
    jobs = FakeCollection(find_one_result={"_id": ObjectId(object_ids.job)})
    monkeypatch.setattr(job_repo, "db", SimpleNamespace(jobs=jobs))

    assert await job_repo.get_job_by_id(object_ids.job) == {"_id": ObjectId(object_ids.job)}
    assert jobs.find_one_calls == [{"_id": ObjectId(object_ids.job)}]


@pytest.mark.asyncio
async def test_update_job(monkeypatch, object_ids):
    jobs = FakeCollection()
    monkeypatch.setattr(job_repo, "db", SimpleNamespace(jobs=jobs))

    await job_repo.update_job(object_ids.job, {"title": "New"})

    assert jobs.update_calls == [
        ({"_id": ObjectId(object_ids.job)}, {"$set": {"title": "New"}})
    ]
