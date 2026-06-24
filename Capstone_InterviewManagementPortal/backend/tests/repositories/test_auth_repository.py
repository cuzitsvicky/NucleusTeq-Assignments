from app.repositories import auth_repo
from app.core.database import db
from app.utils.security_utils import get_password_hash, verify_password


def test_auth_repo_get_user_by_email():
    # Insert a user first
    db.users.insert_one({
        "name": "Auth Repo User",
        "email": "repouser@nucleusteq.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    
    # Retrieve user
    user = auth_repo.get_user_by_email("repouser@nucleusteq.com")
    assert user is not None
    assert user["name"] == "Auth Repo User"
    
    # Case insensitivity / whitespace strip check
    user_case = auth_repo.get_user_by_email("  RepoUser@nucleusteq.com  ")
    assert user_case is not None
    assert user_case["name"] == "Auth Repo User"


def test_auth_repo_update_password():
    user_id = db.users.insert_one({
        "name": "Auth Repo User",
        "email": "repouser@nucleusteq.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "active": True,
        "reset_required": True
    }).inserted_id
    
    # Update password
    new_hashed = get_password_hash("newPassword123")
    auth_repo.update_password(str(user_id), new_hashed)
    
    # Fetch from db and verify
    user = db.users.find_one({"_id": user_id})
    assert user["reset_required"] is False
    assert verify_password("newPassword123", user["password"]) is True
