import pytest
from app.repositories import user_repo
from app.core.database import db

def test_repo_create_user():
    user_data = {
        "name": "Repo User",
        "email": "repo_user@nucleusteq.com",
        "password": "hashed_password",
        "role": "HR",
        "active": True
    }
    user_id = user_repo.create_user(user_data)
    assert user_id is not None
    
    fetched = db.users.find_one({"email": "repo_user@nucleusteq.com"})
    assert fetched["name"] == "Repo User"
    assert fetched["reset_required"] is True

def test_repo_get_user_by_email_and_id():
    user_data = {
        "name": "Fetch User",
        "email": "fetch@nucleusteq.com",
        "password": "pass",
        "role": "Interviewer",
        "active": True,
        "reset_required": False
    }
    user_id = user_repo.create_user(user_data)
    
    # Get by email
    fetched_email = user_repo.get_user_by_email("FETCH@nucleusteq.com")
    assert fetched_email is not None
    assert str(fetched_email["_id"]) == user_id
    
    # Get by ID
    fetched_id = user_repo.get_user_by_id(user_id)
    assert fetched_id is not None
    assert fetched_id["email"] == "fetch@nucleusteq.com"

def test_repo_get_all_users():
    # Insert multiple users
    for i in range(12):
        user_repo.create_user({
            "name": f"User {i}",
            "email": f"user{i}@nucleusteq.com",
            "password": "pass",
            "role": "Interviewer",
            "active": True
        })
    
    # Page 1
    page1 = user_repo.get_all_users(page=1)
    assert len(page1) == 10
    
    # Page 2
    page2 = user_repo.get_all_users(page=2)
    assert len(page2) == 2

def test_repo_update_and_disable_user():
    user_id = user_repo.create_user({
        "name": "Update User",
        "email": "update@nucleusteq.com",
        "password": "pass",
        "role": "HR",
        "active": True
    })
    
    # Update user properties (and disable user)
    user_repo.update_user(user_id, {
        "name": "Updated User",
        "role": "Admin",
        "active": False
    })
    
    fetched = user_repo.get_user_by_id(user_id)
    assert fetched["name"] == "Updated User"
    assert fetched["role"] == "Admin"
    assert fetched["active"] is False

def test_repo_get_active_interviewers():
    # Create active interviewer
    user_repo.create_user({
        "name": "Active Int",
        "email": "active_int@nucleusteq.com",
        "password": "pass",
        "role": "Interviewer",
        "active": True
    })
    
    # Create inactive interviewer
    user_repo.create_user({
        "name": "Inactive Int",
        "email": "inactive_int@nucleusteq.com",
        "password": "pass",
        "role": "Interviewer",
        "active": False
    })
    
    # Create active HR (different role)
    user_repo.create_user({
        "name": "Active HR",
        "email": "active_hr@nucleusteq.com",
        "password": "pass",
        "role": "HR",
        "active": True
    })
    
    interviewers = user_repo.get_active_interviewers()
    emails = [i["email"] for i in interviewers]
    assert "active_int@nucleusteq.com" in emails
    assert "inactive_int@nucleusteq.com" not in emails
    assert "active_hr@nucleusteq.com" not in emails
