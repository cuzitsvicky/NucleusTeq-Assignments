import pytest

from app.exceptions import ForbiddenException, NotFoundException
from app.routers import users
from app.schemas import UserCreateRequest, UserUpdateRequest
from tests.conftest import async_return


@pytest.mark.asyncio
async def test_register_requires_admin(hr_user):
    with pytest.raises(ForbiddenException):
        await users.register(UserCreateRequest(
            name="Test User",
            email="test@nucleusteq.com",
            password="pass12",
            role="HR",
        ), hr_user)


@pytest.mark.asyncio
async def test_register_success(monkeypatch, admin_user):
    monkeypatch.setattr(users.user_service, "register_user", async_return({
        "id": "user-id",
        "name": "Test User",
        "email": "test@nucleusteq.com",
        "role": "HR",
        "active": True,
        "reset_required": True,
    }))

    result = await users.register(UserCreateRequest(
        name="Test User",
        email="test@nucleusteq.com",
        password="pass12",
        role="HR",
    ), admin_user)

    assert result.email == "test@nucleusteq.com"


@pytest.mark.asyncio
async def test_get_users_requires_admin(hr_user):
    with pytest.raises(ForbiddenException):
        await users.get_users(current_user=hr_user)


@pytest.mark.asyncio
async def test_get_users_success(monkeypatch, admin_user):
    monkeypatch.setattr(users.user_service, "get_users", async_return({"data": [], "total": 0}))

    assert await users.get_users(current_user=admin_user) == {"data": [], "total": 0}


@pytest.mark.asyncio
async def test_get_interviewers_requires_admin_or_hr(interviewer_user):
    with pytest.raises(ForbiddenException):
        await users.get_interviewers(current_user=interviewer_user)


@pytest.mark.asyncio
async def test_get_interviewers_success(monkeypatch, hr_user):
    monkeypatch.setattr(users.user_service, "get_active_interviewers", async_return({"data": []}))

    assert await users.get_interviewers(current_user=hr_user) == {"data": []}


@pytest.mark.asyncio
async def test_update_user_requires_admin(hr_user):
    with pytest.raises(ForbiddenException):
        await users.update_user("target-id", UserUpdateRequest(name="Test User", role="HR", active=True), hr_user)


@pytest.mark.asyncio
async def test_update_user_blocks_self_update(admin_user):
    with pytest.raises(ForbiddenException) as exc:
        await users.update_user(str(admin_user["_id"]), UserUpdateRequest(name="Test User", role="HR", active=True), admin_user)

    assert exc.value.detail == "You cannot update your own account"


@pytest.mark.asyncio
async def test_update_user_missing_target(monkeypatch, admin_user):
    monkeypatch.setattr(users.user_service, "get_user_by_id", async_return(None))

    with pytest.raises(NotFoundException):
        await users.update_user("target-id", UserUpdateRequest(name="Test User", role="HR", active=True), admin_user)


@pytest.mark.asyncio
async def test_update_user_success(monkeypatch, admin_user):
    monkeypatch.setattr(users.user_service, "get_user_by_id", async_return({"id": "target-id"}))
    update = async_return(None)
    monkeypatch.setattr(users.user_service, "update_user", update)

    result = await users.update_user("target-id", UserUpdateRequest(name="Test User", role="HR", active=True), admin_user)

    assert result.message == "User updated"
    update.assert_awaited_once_with("target-id", {"name": "Test User", "role": "HR", "active": True})
