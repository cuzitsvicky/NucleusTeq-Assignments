import pytest
from app.core.config import settings
from app.utils.security_utils import get_password_hash

pytestmark = pytest.mark.asyncio


@pytest.fixture(autouse=True)
async def run_around_tests(async_client):
    from app.core.database import db
    await db.client.drop_database(settings.DB_NAME)
    yield
    await db.client.drop_database(settings.DB_NAME)


@pytest.fixture
async def async_admin_headers(async_client):
    from app.core.database import db
    await db.users.insert_one({
        "name": "Test Admin",
        "email": "admin@nucleusteq.com",
        "password": get_password_hash("admin123"),
        "role": "Admin",
        "active": True,
        "reset_required": False
    })
    return {"Authorization": "Basic YWRtaW5AbnVjbGV1c3RlcS5jb206YWRtaW4xMjM="} # admin@nucleusteq.com:admin123


async def insert_user(user_data: dict):
    from app.core.database import db
    return await db.users.insert_one(user_data)


async def test_login_and_me(async_client, async_admin_headers):
    response = await async_client.get("/api/auth/me", headers=async_admin_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "admin@nucleusteq.com"
    assert response.json()["role"] == "Admin"
    assert response.json()["reset_required"] is False


async def test_login_invalid_credentials(async_client):
    response = await async_client.get("/api/auth/me", headers={"Authorization": "Basic YWRtaW5AbnVjbGV1c3RlcS5jb206d3JvbmdwYXNz"})
    assert response.status_code == 401


async def test_disabled_user_login(async_client):
    await insert_user({
        "name": "Test Disabled",
        "email": "disabled@nucleusteq.com",
        "password": get_password_hash("pass123"),
        "role": "HR",
        "active": False,
        "reset_required": False
    })
    headers = {"Authorization": "Basic ZGlzYWJsZWRAbnVjbGV1c3RlcS5jb206cGFzczEyMw=="}
    response = await async_client.get("/api/auth/me", headers=headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "User account is disabled"


async def test_explicit_login_success(async_client):
    await insert_user({
        "name": "Explicit Login User",
        "email": "explicit@nucleusteq.com",
        "password": get_password_hash("loginPass123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    payload = {
        "email": "explicit@nucleusteq.com",
        "password": "loginPass123"
    }
    response = await async_client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["user"]["email"] == "explicit@nucleusteq.com"
    assert res_data["user"]["role"] == "HR"
    assert res_data["user"]["reset_required"] is False
    assert res_data["token"] == "ZXhwbGljaXRAbnVjbGV1c3RlcS5jb206bG9naW5QYXNzMTIz"


async def test_explicit_login_invalid_credentials(async_client):
    await insert_user({
        "name": "Explicit Login User",
        "email": "explicit@nucleusteq.com",
        "password": get_password_hash("loginPass123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    response = await async_client.post("/api/auth/login", json={"email": "explicit@nucleusteq.com", "password": "wrong"})
    assert response.status_code == 401
    
    response2 = await async_client.post("/api/auth/login", json={"email": "nonexistent@nucleusteq.com", "password": "wrong"})
    assert response2.status_code == 401


async def test_explicit_login_disabled_user(async_client):
    await insert_user({
        "name": "Disabled User",
        "email": "disabled_explicit@nucleusteq.com",
        "password": get_password_hash("loginPass123"),
        "role": "HR",
        "active": False,
        "reset_required": False
    })
    payload = {
        "email": "disabled_explicit@nucleusteq.com",
        "password": "loginPass123"
    }
    response = await async_client.post("/api/auth/login", json=payload)
    assert response.status_code == 403
    assert response.json()["detail"] == "User account is disabled"


async def test_password_reset(async_client):
    await insert_user({
        "name": "First Login User",
        "email": "first@nucleusteq.com",
        "password": get_password_hash("temp123"),
        "role": "Interviewer",
        "active": True,
        "reset_required": True
    })
    headers = {"Authorization": "Basic Zmlyc3RAbnVjbGV1c3RlcS5jb206dGVtcDEyMw=="}
    
    # Check that me endpoint shows reset_required: True
    me_resp = await async_client.get("/api/auth/me", headers=headers)
    assert me_resp.json()["reset_required"] is True
    
    # Change password
    reset_resp = await async_client.post("/api/auth/reset-password", json={"new_password": "newPass12"}, headers=headers)
    assert reset_resp.status_code == 200
    
    # Check that logging in with new password works and reset_required is now False
    new_headers = {"Authorization": "Basic Zmlyc3RAbnVjbGV1c3RlcS5jb206bmV3UGFzczEy"}
    me_resp2 = await async_client.get("/api/auth/me", headers=new_headers)
    assert me_resp2.status_code == 200
    assert me_resp2.json()["reset_required"] is False