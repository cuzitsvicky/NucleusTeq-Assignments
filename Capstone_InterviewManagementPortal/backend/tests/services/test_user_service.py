import pytest
from bson import ObjectId

from app.exceptions import BadRequestException
from app.services import user_service
from tests.conftest import async_return


def test_format_user_removes_password_and_defaults_reset_required(object_ids):
    user = {
        "_id": ObjectId(object_ids.user),
        "name": "Admin User",
        "email": "admin@nucleusteq.com",
        "password": "secret",
    }

    assert user_service.format_user(user) == {
        "id": object_ids.user,
        "name": "Admin User",
        "email": "admin@nucleusteq.com",
        "reset_required": False,
    }


@pytest.mark.asyncio
async def test_register_user_success(monkeypatch):
    monkeypatch.setattr(user_service.user_repo, "get_user_by_email", async_return(None))
    monkeypatch.setattr(user_service.user_repo, "create_user", async_return("new-id"))

    user = await user_service.register_user({
        "name": "New User",
        "email": "new@nucleusteq.com",
        "password": "pass1",
        "role": "HR",
    })

    assert user["id"] == "new-id"
    assert user["active"] is True
    assert user["reset_required"] is True
    assert user["password"] == user_service.get_password_hash("pass1")


@pytest.mark.asyncio
async def test_register_user_duplicate(monkeypatch):
    monkeypatch.setattr(user_service.user_repo, "get_user_by_email", async_return({"email": "new@nucleusteq.com"}))

    with pytest.raises(BadRequestException) as exc:
        await user_service.register_user({"email": "new@nucleusteq.com"})

    assert exc.value.detail == "Email already registered"


@pytest.mark.asyncio
async def test_get_users_formats_paginated_users(monkeypatch, object_ids):
    monkeypatch.setattr(user_service.user_repo, "get_all_users", async_return((
        [{"_id": ObjectId(object_ids.user), "email": "u@nucleusteq.com", "password": "x"}],
        1,
    )))

    result = await user_service.get_users(1, 10, "u", "HR")

    assert result["data"] == [{"email": "u@nucleusteq.com", "id": object_ids.user, "reset_required": False}]
    assert result["total"] == 1


@pytest.mark.asyncio
async def test_get_user_by_id_found(monkeypatch, object_ids):
    monkeypatch.setattr(user_service.user_repo, "get_user_by_id", async_return({
        "_id": ObjectId(object_ids.user),
        "email": "u@nucleusteq.com",
        "password": "x",
    }))

    assert await user_service.get_user_by_id(object_ids.user) == {
        "email": "u@nucleusteq.com",
        "id": object_ids.user,
        "reset_required": False,
    }


@pytest.mark.asyncio
async def test_get_user_by_id_missing(monkeypatch):
    monkeypatch.setattr(user_service.user_repo, "get_user_by_id", async_return(None))

    assert await user_service.get_user_by_id("missing") is None


@pytest.mark.asyncio
async def test_update_user_success(monkeypatch):
    monkeypatch.setattr(user_service.user_repo, "update_user", async_return(1))

    assert await user_service.update_user("user-id", {"active": False}) is None


@pytest.mark.asyncio
async def test_update_user_no_changes(monkeypatch):
    monkeypatch.setattr(user_service.user_repo, "update_user", async_return(0))

    with pytest.raises(BadRequestException) as exc:
        await user_service.update_user("user-id", {"active": False})

    assert exc.value.detail == "No changes were made"


@pytest.mark.asyncio
async def test_get_active_interviewers(monkeypatch, object_ids):
    monkeypatch.setattr(user_service.user_repo, "get_active_interviewers", async_return((
        [{"_id": ObjectId(object_ids.user), "email": "i@nucleusteq.com", "password": "x"}],
        1,
    )))

    result = await user_service.get_active_interviewers()

    assert result["data"][0]["email"] == "i@nucleusteq.com"
    assert "password" not in result["data"][0]
