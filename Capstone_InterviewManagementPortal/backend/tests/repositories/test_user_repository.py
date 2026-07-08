from types import SimpleNamespace

import pytest
from bson import ObjectId

from app.repositories import user_repo
from tests.conftest import FakeCollection, async_return


@pytest.mark.asyncio
async def test_get_user_by_email(monkeypatch):
    users = FakeCollection(find_one_result={"email": "user@nucleusteq.com"})
    monkeypatch.setattr(user_repo, "db", SimpleNamespace(users=users))

    assert await user_repo.get_user_by_email(" User@NucleusTeq.com ") == {"email": "user@nucleusteq.com"}
    assert users.find_one_calls == [{"email": "user@nucleusteq.com"}]


@pytest.mark.asyncio
async def test_get_user_by_id_rejects_invalid_id():
    assert await user_repo.get_user_by_id("bad-id") is None


@pytest.mark.asyncio
async def test_get_user_by_id_queries_object_id(monkeypatch, object_ids):
    users = FakeCollection(find_one_result={"_id": ObjectId(object_ids.user)})
    monkeypatch.setattr(user_repo, "db", SimpleNamespace(users=users))

    user = await user_repo.get_user_by_id(object_ids.user)

    assert user["_id"] == ObjectId(object_ids.user)
    assert users.find_one_calls == [{"_id": ObjectId(object_ids.user)}]


@pytest.mark.asyncio
async def test_create_user_defaults_reset_required(monkeypatch):
    users = FakeCollection()
    monkeypatch.setattr(user_repo, "db", SimpleNamespace(users=users))

    user_id = await user_repo.create_user({"email": "user@nucleusteq.com"})

    assert ObjectId.is_valid(user_id)
    assert users.inserted[0]["reset_required"] is True


@pytest.mark.asyncio
async def test_get_all_users_builds_filters(monkeypatch):
    paginate = async_return(([], 0))
    monkeypatch.setattr(user_repo, "paginate_collection", paginate)
    monkeypatch.setattr(user_repo, "db", SimpleNamespace(users=object()))

    assert await user_repo.get_all_users(1, 10, " Ann ", "HR") == ([], 0)
    paginate.assert_awaited_once_with(
        user_repo.db.users,
        {"name": {"$regex": "Ann", "$options": "i"}, "role": "HR"},
        1,
        10,
        sort=("_id", -1),
    )


@pytest.mark.asyncio
async def test_update_user_returns_modified_count(monkeypatch, object_ids):
    users = FakeCollection(modified_count=2)
    monkeypatch.setattr(user_repo, "db", SimpleNamespace(users=users))

    modified = await user_repo.update_user(object_ids.user, {"active": False})

    assert modified == 2
    assert users.update_calls == [
        ({"_id": ObjectId(object_ids.user)}, {"$set": {"active": False}})
    ]


@pytest.mark.asyncio
async def test_get_active_interviewers(monkeypatch):
    paginate = async_return(([], 0))
    monkeypatch.setattr(user_repo, "paginate_collection", paginate)
    monkeypatch.setattr(user_repo, "db", SimpleNamespace(users=object()))

    assert await user_repo.get_active_interviewers(2, 5) == ([], 0)
    paginate.assert_awaited_once_with(
        user_repo.db.users,
        {"role": "Interviewer", "active": True},
        2,
        5,
        sort=("_id", -1),
    )
