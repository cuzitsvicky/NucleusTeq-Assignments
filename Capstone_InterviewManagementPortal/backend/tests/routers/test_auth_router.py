from pymongo import MongoClient

from app.core.config import settings
from app.utils.security_utils import get_password_hash


def insert_user(user_data: dict):
    mongo_client = MongoClient(settings.MONGO_URI)
    return mongo_client[settings.DB_NAME].users.insert_one(user_data)


def test_login_and_me(client, admin_headers):
    response = client.get("/api/auth/me", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "admin@nucleusteq.com"
    assert response.json()["role"] == "Admin"
    assert response.json()["reset_required"] is False


def test_login_invalid_credentials(client):
    response = client.get("/api/auth/me", headers={"Authorization": "Basic YWRtaW5AbnVjbGV1c3RlcS5jb206d3JvbmdwYXNz"})
    assert response.status_code == 401


def test_disabled_user_login(client):
    insert_user({
        "name": "Test Disabled",
        "email": "disabled@nucleusteq.com",
        "password": get_password_hash("pass123"),
        "role": "HR",
        "active": False,
        "reset_required": False
    })
    headers = {"Authorization": "Basic ZGlzYWJsZWRAbnVjbGV1c3RlcS5jb206cGFzczEyMw=="}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 403
    assert response.json()["detail"] == "User account is disabled"


def test_explicit_login_success(client):
    insert_user({
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
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["user"]["email"] == "explicit@nucleusteq.com"
    assert res_data["user"]["role"] == "HR"
    assert res_data["user"]["reset_required"] is False
    assert res_data["token"] == "ZXhwbGljaXRAbnVjbGV1c3RlcS5jb206bG9naW5QYXNzMTIz"


def test_explicit_login_invalid_credentials(client):
    insert_user({
        "name": "Explicit Login User",
        "email": "explicit@nucleusteq.com",
        "password": get_password_hash("loginPass123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    response = client.post("/api/auth/login", json={"email": "explicit@nucleusteq.com", "password": "wrong"})
    assert response.status_code == 401
    
    response2 = client.post("/api/auth/login", json={"email": "nonexistent@nucleusteq.com", "password": "wrong"})
    assert response2.status_code == 401


def test_explicit_login_disabled_user(client):
    insert_user({
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
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 403
    assert response.json()["detail"] == "User account is disabled"



def test_password_reset(client):
    insert_user({
        "name": "First Login User",
        "email": "first@nucleusteq.com",
        "password": get_password_hash("temp123"),
        "role": "Interviewer",
        "active": True,
        "reset_required": True
    })
    headers = {"Authorization": "Basic Zmlyc3RAbnVjbGV1c3RlcS5jb206dGVtcDEyMw=="}
    
    # Check that me endpoint shows reset_required: True
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.json()["reset_required"] is True
    
    # Change password
    reset_resp = client.post("/api/auth/reset-password", json={"new_password": "newPass12"}, headers=headers)
    assert reset_resp.status_code == 200
    
    # Check that logging in with new password works and reset_required is now False
    new_headers = {"Authorization": "Basic Zmlyc3RAbnVjbGV1c3RlcS5jb206bmV3UGFzczEy"}
    me_resp2 = client.get("/api/auth/me", headers=new_headers)
    assert me_resp2.status_code == 200
    assert me_resp2.json()["reset_required"] is False