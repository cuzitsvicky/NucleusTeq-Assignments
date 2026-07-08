from types import SimpleNamespace

import pytest
from bson import ObjectId

from app.repositories import auth_repo
from tests.conftest import FakeCollection


@pytest.mark.asyncio
async def test_get_user_by_email_normalizes_email(monkeypatch):
    users = FakeCollection(find_one_result={"email": "test@nucleusteq.com"})
    monkeypatch.setattr(auth_repo, "db", SimpleNamespace(users=users))

    user = await auth_repo.get_user_by_email(" Test@NucleusTeq.com ")

    assert user == {"email": "test@nucleusteq.com"}
    assert users.find_one_calls == [{"email": "test@nucleusteq.com"}]


@pytest.mark.asyncio
async def test_update_password_sets_hash_and_reset_flag(monkeypatch, object_ids):
    users = FakeCollection(modified_count=1)
    monkeypatch.setattr(auth_repo, "db", SimpleNamespace(users=users))

    modified = await auth_repo.update_password(object_ids.user, "hashed")

    assert modified == 1
    assert users.update_calls == [
        (
            {"_id": ObjectId(object_ids.user)},
            {"$set": {"password": "hashed", "reset_required": False}},
        )
    ]
