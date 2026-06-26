import pytest
from app.services import user_service
from app.repositories import user_repo
from app.exceptions import BadRequestException
from app.core.database import db

def test_service_register_user_success():
    payload = {
        "name": "Service User",
        "email": "service@nucleusteq.com",
        "password": "mySecurePassword12",
        "role": "HR"
    }
    
    result = user_service.register_user(payload)
    assert result["email"] == "service@nucleusteq.com"
    assert result["id"] is not None
    assert result["active"] is True
    assert result["reset_required"] is True
    assert result["password"] != "mySecurePassword12" # Hashed

def test_service_register_user_duplicate_email():
    payload1 = {
        "name": "User One",
        "email": "dup@nucleusteq.com",
        "password": "password123",
        "role": "HR"
    }
    user_service.register_user(payload1)
    
    # Try registering again with the same email
    payload2 = {
        "name": "User Two",
        "email": "dup@nucleusteq.com",
        "password": "password456",
        "role": "Interviewer"
    }
    with pytest.raises(BadRequestException) as excinfo:
        user_service.register_user(payload2)
    assert "Email already registered" in str(excinfo.value.detail)

def test_service_get_users():
    # Register a user
    user_service.register_user({
        "name": "Alice Smith",
        "email": "alice@nucleusteq.com",
        "password": "password123",
        "role": "HR"
    })
    
    users = user_service.get_users(page=1)
    assert len(users) >= 1
    
    # Verify that password is redacted and id is present as string
    target = next(u for u in users if u["email"] == "alice@nucleusteq.com")
    assert "password" not in target
    assert "id" in target
    assert isinstance(target["id"], str)

def test_service_update_and_disable_user():
    created = user_service.register_user({
        "name": "Bob Jones",
        "email": "bob@nucleusteq.com",
        "password": "password123",
        "role": "Interviewer"
    })
    user_id = created["id"]
    
    # Update and disable user
    user_service.update_user(user_id, {
        "name": "Bob Updated",
        "role": "HR",
        "active": False
    })
    
    # Verify via repo
    fetched = user_repo.get_user_by_id(user_id)
    assert fetched["name"] == "Bob Updated"
    assert fetched["role"] == "HR"
    assert fetched["active"] is False

def test_service_get_active_interviewers():
    user_service.register_user({
        "name": "Active Service Int",
        "email": "active_serv_int@nucleusteq.com",
        "password": "password123",
        "role": "Interviewer"
    })
    
    interviewers = user_service.get_active_interviewers()
    target = next((i for i in interviewers if i["email"] == "active_serv_int@nucleusteq.com"), None)
    assert target is not None
    assert "password" not in target
    assert target["id"] is not None
