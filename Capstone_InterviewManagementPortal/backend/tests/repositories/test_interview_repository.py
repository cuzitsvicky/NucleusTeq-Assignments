from types import SimpleNamespace

import pytest
from bson import ObjectId

from app.repositories import interview_repo
from tests.conftest import FakeCollection, async_return


@pytest.mark.asyncio
async def test_create_interview(monkeypatch):
    interviews = FakeCollection()
    monkeypatch.setattr(interview_repo, "db", SimpleNamespace(interviews=interviews))

    interview_id = await interview_repo.create_interview({"candidate_id": "c1"})

    assert ObjectId.is_valid(interview_id)
    assert interviews.inserted == [{"candidate_id": "c1"}]


@pytest.mark.asyncio
async def test_get_all_interviews_uses_default_query(monkeypatch):
    paginate = async_return(([], 0))
    monkeypatch.setattr(interview_repo, "paginate_collection", paginate)
    monkeypatch.setattr(interview_repo, "db", SimpleNamespace(interviews=object()))

    await interview_repo.get_all_interviews(None, 2, 5)

    paginate.assert_awaited_once_with(
        interview_repo.db.interviews,
        {},
        2,
        5,
        sort=("_id", -1),
    )


@pytest.mark.asyncio
async def test_get_interview_by_id_invalid_returns_none():
    assert await interview_repo.get_interview_by_id("bad") is None


@pytest.mark.asyncio
async def test_get_interview_by_id(monkeypatch, object_ids):
    interviews = FakeCollection(find_one_result={"_id": ObjectId(object_ids.interview)})
    monkeypatch.setattr(interview_repo, "db", SimpleNamespace(interviews=interviews))

    assert await interview_repo.get_interview_by_id(object_ids.interview) == {"_id": ObjectId(object_ids.interview)}
    assert interviews.find_one_calls == [{"_id": ObjectId(object_ids.interview)}]


@pytest.mark.asyncio
async def test_get_interview_by_candidate_and_date(monkeypatch):
    interviews = FakeCollection(find_one_result={"status": "SCHEDULED"})
    monkeypatch.setattr(interview_repo, "db", SimpleNamespace(interviews=interviews))

    await interview_repo.get_interview_by_candidate_and_date("c1", "i@nucleusteq.com", "2999-01-01")

    assert interviews.find_one_calls == [
        {
            "candidate_id": "c1",
            "interviewer_email": "i@nucleusteq.com",
            "interview_date": "2999-01-01",
            "status": "SCHEDULED",
        }
    ]


@pytest.mark.asyncio
async def test_get_candidate_ids_by_interviewer_email(monkeypatch):
    interviews = FakeCollection(find_data=[{"candidate_id": "c1"}, {"candidate_id": "c1"}, {"candidate_id": "c2"}])
    monkeypatch.setattr(interview_repo, "db", SimpleNamespace(interviews=interviews))

    result = await interview_repo.get_candidate_ids_by_interviewer_email("i@nucleusteq.com")

    assert sorted(result) == ["c1", "c2"]
    assert interviews.find_calls == [{"interviewer_email": "i@nucleusteq.com"}]


@pytest.mark.asyncio
async def test_interviewer_has_candidate(monkeypatch):
    interviews = FakeCollection(find_one_result={"candidate_id": "c1"})
    monkeypatch.setattr(interview_repo, "db", SimpleNamespace(interviews=interviews))

    assert await interview_repo.interviewer_has_candidate("i@nucleusteq.com", "c1") is True
    assert interviews.find_one_calls == [
        {"interviewer_email": "i@nucleusteq.com", "candidate_id": "c1"}
    ]


@pytest.mark.asyncio
async def test_interviewer_has_candidate_false(monkeypatch):
    interviews = FakeCollection(find_one_result=None)
    monkeypatch.setattr(interview_repo, "db", SimpleNamespace(interviews=interviews))

    assert await interview_repo.interviewer_has_candidate("i@nucleusteq.com", "c1") is False


@pytest.mark.asyncio
async def test_update_interview_status(monkeypatch, object_ids):
    interviews = FakeCollection()
    monkeypatch.setattr(interview_repo, "db", SimpleNamespace(interviews=interviews))

    await interview_repo.update_interview_status(object_ids.interview, "COMPLETED")

    assert interviews.update_calls == [
        ({"_id": ObjectId(object_ids.interview)}, {"$set": {"status": "COMPLETED"}})
    ]


@pytest.mark.asyncio
async def test_create_and_get_feedback(monkeypatch):
    feedback = FakeCollection(find_one_result={"interview_id": "i1"})
    monkeypatch.setattr(interview_repo, "db", SimpleNamespace(feedback=feedback))

    await interview_repo.create_feedback({"interview_id": "i1"})
    result = await interview_repo.get_feedback_for_interview("i1")

    assert feedback.inserted == [{"interview_id": "i1"}]
    assert result == {"interview_id": "i1"}
    assert feedback.find_one_calls == [{"interview_id": "i1"}]
