import pytest
from app.services import auth_service
from app.core.database import db
from app.utils.security_utils import get_password_hash, verify_password
from app.exceptions import UnauthorizedException, ForbiddenException


def test_service_authenticate_user_success():
    db.users.insert_one({
        "name": "Auth Service User",
        "email": "service_auth@nucleusteq.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    user = auth_service.authenticate_user("service_auth@nucleusteq.com", "password123")
    assert user is not None
    assert user["email"] == "service_auth@nucleusteq.com"


def test_service_authenticate_user_invalid_credentials():
    db.users.insert_one({
        "name": "Auth Service User",
        "email": "service_auth@nucleusteq.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    # Wrong password
    with pytest.raises(UnauthorizedException):
        auth_service.authenticate_user("service_auth@nucleusteq.com", "wrong")
        
    # Non-existent email
    with pytest.raises(UnauthorizedException):
        auth_service.authenticate_user("nonexistent@nucleusteq.com", "password123")


def test_service_authenticate_user_disabled():
    db.users.insert_one({
        "name": "Disabled Service User",
        "email": "disabled_service@nucleusteq.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "active": False,
        "reset_required": False
    })
    with pytest.raises(ForbiddenException):
        auth_service.authenticate_user("disabled_service@nucleusteq.com", "password123")


def test_service_reset_password():
    user_id = db.users.insert_one({
        "name": "Reset Service User",
        "email": "reset_service@nucleusteq.com",
        "password": get_password_hash("tempPass123"),
        "role": "Interviewer",
        "active": True,
        "reset_required": True
    }).inserted_id
    
    auth_service.reset_password(str(user_id), "newSecurePass1")
    
    # Fetch user directly from database and verify
    user = db.users.find_one({"_id": user_id})
    assert user["reset_required"] is False
    assert verify_password("newSecurePass1", user["password"]) is True
