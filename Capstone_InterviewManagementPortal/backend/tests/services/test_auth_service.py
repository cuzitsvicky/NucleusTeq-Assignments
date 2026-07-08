import base64

import pytest

from app.exceptions import BadRequestException, ForbiddenException, UnauthorizedException
from app.services import auth_service
from tests.conftest import async_return


def test_generate_basic_token_normalizes_email():
    token = auth_service.generate_basic_token(" User@NucleusTeq.com ", "pass1")

    assert base64.b64decode(token).decode("utf-8") == "user@nucleusteq.com:pass1"


@pytest.mark.asyncio
async def test_authenticate_user_success(monkeypatch):
    hashed = auth_service.get_password_hash("pass1")
    monkeypatch.setattr(auth_service.auth_repo, "get_user_by_email", async_return({
        "email": "user@nucleusteq.com",
        "password": hashed,
        "active": True,
        "role": "HR",
    }))

    user = await auth_service.authenticate_user(" USER@NucleusTeq.com ", "pass1")

    assert user["email"] == "user@nucleusteq.com"


@pytest.mark.asyncio
async def test_authenticate_user_invalid_credentials_with_basic_header(monkeypatch):
    monkeypatch.setattr(auth_service.auth_repo, "get_user_by_email", async_return(None))

    with pytest.raises(UnauthorizedException) as exc:
        await auth_service.authenticate_user("user@nucleusteq.com", "bad", is_basic_auth=True)

    assert exc.value.detail == "Invalid email or password"
    assert exc.value.headers == {"WWW-Authenticate": "Basic"}


@pytest.mark.asyncio
async def test_authenticate_user_disabled(monkeypatch):
    monkeypatch.setattr(auth_service.auth_repo, "get_user_by_email", async_return({
        "email": "user@nucleusteq.com",
        "password": auth_service.get_password_hash("pass1"),
        "active": False,
        "role": "HR",
    }))

    with pytest.raises(ForbiddenException) as exc:
        await auth_service.authenticate_user("user@nucleusteq.com", "pass1")

    assert exc.value.detail == "User account is disabled"


@pytest.mark.asyncio
async def test_authenticate_user_invalid_role(monkeypatch):
    monkeypatch.setattr(auth_service.auth_repo, "get_user_by_email", async_return({
        "email": "user@nucleusteq.com",
        "password": auth_service.get_password_hash("pass1"),
        "active": True,
        "role": "Wrong",
    }))

    with pytest.raises(ForbiddenException) as exc:
        await auth_service.authenticate_user("user@nucleusteq.com", "pass1")

    assert exc.value.detail == "Invalid user role configuration"


@pytest.mark.asyncio
async def test_reset_password_success(monkeypatch):
    update_password = async_return(1)
    monkeypatch.setattr(auth_service.auth_repo, "update_password", update_password)

    await auth_service.reset_password("user-id", "newpass1")

    update_password.assert_awaited_once()
    assert update_password.await_args.args[0] == "user-id"
    assert update_password.await_args.args[1] == auth_service.get_password_hash("newpass1")


@pytest.mark.asyncio
async def test_reset_password_failure(monkeypatch):
    monkeypatch.setattr(auth_service.auth_repo, "update_password", async_return(0))

    with pytest.raises(BadRequestException) as exc:
        await auth_service.reset_password("user-id", "newpass1")

    assert exc.value.detail == "Password could not be updated"
