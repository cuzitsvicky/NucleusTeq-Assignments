import pytest
from bson import ObjectId
from fastapi.security import HTTPBasicCredentials

from app.exceptions import ForbiddenException
from app.routers import auth
from app.schemas import LoginRequest, PasswordResetRequest
from tests.conftest import async_return


def test_build_user_response_defaults(object_ids):
    response = auth.auth_service.build_user_response({
        "_id": ObjectId(object_ids.user),
        "email": "user@nucleusteq.com",
        "role": "HR",
    })

    assert response.id == object_ids.user
    assert response.name == ""
    assert response.active is True
    assert response.reset_required is False


@pytest.mark.asyncio
async def test_get_current_user_calls_auth_service(monkeypatch):
    authenticate = async_return({"email": "user@nucleusteq.com"})
    monkeypatch.setattr(auth.auth_service, "authenticate_user", authenticate)

    result = await auth.get_current_user(HTTPBasicCredentials(username="user@nucleusteq.com", password="pass1"))

    assert result == {"email": "user@nucleusteq.com"}
    authenticate.assert_awaited_once_with("user@nucleusteq.com", "pass1", is_basic_auth=True)


@pytest.mark.asyncio
async def test_check_password_reset_blocks_reset_required():
    with pytest.raises(ForbiddenException) as exc:
        await auth.check_password_reset({"reset_required": True})

    assert exc.value.detail == "Password reset required on first login"


@pytest.mark.asyncio
async def test_check_password_reset_allows_user(hr_user):
    assert await auth.check_password_reset(hr_user) == hr_user


@pytest.mark.asyncio
async def test_login_returns_user_and_token(monkeypatch, object_ids):
    monkeypatch.setattr(auth.auth_service, "authenticate_user", async_return({
        "_id": ObjectId(object_ids.user),
        "name": "Hr User",
        "email": "hr@nucleusteq.com",
        "role": "HR",
    }))
    monkeypatch.setattr(auth.auth_service, "generate_basic_token", lambda email, password: "token")

    result = await auth.login(LoginRequest(email="hr@nucleusteq.com", password="pass1"))

    assert result.token == "token"
    assert result.user.email == "hr@nucleusteq.com"


@pytest.mark.asyncio
async def test_get_me_returns_current_user(hr_user):
    result = await auth.get_me(hr_user)

    assert result.email == "hr@nucleusteq.com"


@pytest.mark.asyncio
async def test_reset_password(monkeypatch, hr_user):
    reset = async_return(None)
    monkeypatch.setattr(auth.auth_service, "reset_password", reset)

    result = await auth.reset_password(PasswordResetRequest(new_password="pass12!"), hr_user)

    assert result.message == "Password reset successfully"
    reset.assert_awaited_once_with(str(hr_user["_id"]), "pass12!")
