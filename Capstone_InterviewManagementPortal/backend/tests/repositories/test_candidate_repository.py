from types import SimpleNamespace

import pytest
from bson import ObjectId

from app.repositories import candidate_repo
from tests.conftest import FakeCollection, async_return


@pytest.mark.asyncio
async def test_create_candidate(monkeypatch):
    candidates = FakeCollection()
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(candidates=candidates))

    candidate_id = await candidate_repo.create_candidate({"email": "a@example.com"})

    assert ObjectId.is_valid(candidate_id)
    assert candidates.inserted == [{"email": "a@example.com"}]


@pytest.mark.asyncio
async def test_get_all_candidates_builds_conditions(monkeypatch):
    paginate = async_return(([], 0))
    monkeypatch.setattr(candidate_repo, "paginate_collection", paginate)
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(candidates=object()))

    await candidate_repo.get_all_candidates(1, 10, " Ash ", " A@E.com ", "PROFILE_CREATED", "job-1")

    paginate.assert_awaited_once_with(
        candidate_repo.db.candidates,
        {
            "$and": [
                {
                    "$or": [
                        {"first_name": {"$regex": "Ash", "$options": "i"}},
                        {"last_name": {"$regex": "Ash", "$options": "i"}},
                    ]
                },
                {"email": {"$regex": "A@E.com", "$options": "i"}},
                {"status": "PROFILE_CREATED"},
                {"applied_job_id": "job-1"},
            ]
        },
        1,
        10,
        sort=("_id", -1),
    )


@pytest.mark.asyncio
async def test_get_all_candidates_without_filters(monkeypatch):
    paginate = async_return(([], 0))
    monkeypatch.setattr(candidate_repo, "paginate_collection", paginate)
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(candidates=object()))

    await candidate_repo.get_all_candidates()

    paginate.assert_awaited_once_with(
        candidate_repo.db.candidates,
        {},
        1,
        10,
        sort=("_id", -1),
    )


@pytest.mark.asyncio
async def test_get_candidate_by_id_invalid_returns_none():
    assert await candidate_repo.get_candidate_by_id("bad") is None


@pytest.mark.asyncio
async def test_get_candidate_by_id(monkeypatch, object_ids):
    candidates = FakeCollection(find_one_result={"_id": ObjectId(object_ids.candidate)})
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(candidates=candidates))

    assert await candidate_repo.get_candidate_by_id(object_ids.candidate) == {"_id": ObjectId(object_ids.candidate)}
    assert candidates.find_one_calls == [{"_id": ObjectId(object_ids.candidate)}]


@pytest.mark.asyncio
async def test_get_candidate_by_email_or_mobile(monkeypatch):
    candidates = FakeCollection(find_one_result={"email": "a@example.com"})
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(candidates=candidates))

    await candidate_repo.get_candidate_by_email_or_mobile(" A@Example.com ", "123")

    assert candidates.find_one_calls == [
        {"$or": [{"email": "a@example.com"}, {"mobile": "123"}]}
    ]


@pytest.mark.asyncio
async def test_get_candidate_by_email_or_mobile_exclude(monkeypatch, object_ids):
    candidates = FakeCollection()
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(candidates=candidates))

    await candidate_repo.get_candidate_by_email_or_mobile_exclude(" A@Example.com ", "123", object_ids.candidate)

    assert candidates.find_one_calls == [
        {
            "_id": {"$ne": ObjectId(object_ids.candidate)},
            "$or": [{"email": "a@example.com"}, {"mobile": "123"}],
        }
    ]


@pytest.mark.asyncio
async def test_update_candidate(monkeypatch, object_ids):
    candidates = FakeCollection(modified_count=1)
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(candidates=candidates))

    assert await candidate_repo.update_candidate(object_ids.candidate, {"first_name": "Asha"}) == 1
    assert candidates.update_calls == [
        ({"_id": ObjectId(object_ids.candidate)}, {"$set": {"first_name": "Asha"}})
    ]


@pytest.mark.asyncio
async def test_update_candidate_status(monkeypatch, object_ids):
    candidates = FakeCollection(modified_count=1)
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(candidates=candidates))

    assert await candidate_repo.update_candidate_status(object_ids.candidate, "SELECTED") == 1
    assert candidates.update_calls == [
        ({"_id": ObjectId(object_ids.candidate)}, {"$set": {"status": "SELECTED"}})
    ]


@pytest.mark.asyncio
async def test_add_status_history(monkeypatch, object_ids):
    history = FakeCollection()
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(status_history=history))

    await candidate_repo.add_status_history(object_ids.candidate, "PROFILE_CREATED", "hr@nucleusteq.com")

    assert history.inserted[0]["candidate_id"] == object_ids.candidate
    assert history.inserted[0]["status"] == "PROFILE_CREATED"
    assert history.inserted[0]["updated_by"] == "hr@nucleusteq.com"
    assert "timestamp" in history.inserted[0]


@pytest.mark.asyncio
async def test_get_status_history(monkeypatch, object_ids):
    paginate = async_return(([], 0))
    monkeypatch.setattr(candidate_repo, "paginate_collection", paginate)
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(status_history=object()))

    await candidate_repo.get_status_history(object_ids.candidate, 2, 5)

    paginate.assert_awaited_once_with(
        candidate_repo.db.status_history,
        {"candidate_id": object_ids.candidate},
        2,
        5,
        sort=("timestamp", -1),
    )


@pytest.mark.asyncio
async def test_get_candidates_by_ids(monkeypatch, object_ids):
    paginate = async_return(([], 0))
    monkeypatch.setattr(candidate_repo, "paginate_collection", paginate)
    monkeypatch.setattr(candidate_repo, "db", SimpleNamespace(candidates=object()))

    await candidate_repo.get_candidates_by_ids([object_ids.candidate], 1, 10)

    paginate.assert_awaited_once_with(
        candidate_repo.db.candidates,
        {"_id": {"$in": [ObjectId(object_ids.candidate)]}},
        1,
        10,
        sort=("_id", -1),
    )
