from types import SimpleNamespace

import pytest

from app.repositories import dashboard_repo
from tests.conftest import FakeCollection


@pytest.mark.asyncio
async def test_count_jobs_uses_jobs_collection(monkeypatch):
    jobs = FakeCollection(count=3)
    monkeypatch.setattr(dashboard_repo, "db", SimpleNamespace(jobs=jobs))

    result = await dashboard_repo.count_jobs({"employment_type": "Full Time"})

    assert result == 3
    assert jobs.count_calls == [{"employment_type": "Full Time"}]


@pytest.mark.asyncio
async def test_count_candidates_uses_candidates_collection(monkeypatch):
    candidates = FakeCollection(count=4)
    monkeypatch.setattr(dashboard_repo, "db", SimpleNamespace(candidates=candidates))

    result = await dashboard_repo.count_candidates({"status": "SELECTED"})

    assert result == 4
    assert candidates.count_calls == [{"status": "SELECTED"}]


@pytest.mark.asyncio
async def test_count_interviews_uses_interviews_collection(monkeypatch):
    interviews = FakeCollection(count=5)
    monkeypatch.setattr(dashboard_repo, "db", SimpleNamespace(interviews=interviews))

    result = await dashboard_repo.count_interviews({"status": "SCHEDULED"})

    assert result == 5
    assert interviews.count_calls == [{"status": "SCHEDULED"}]
