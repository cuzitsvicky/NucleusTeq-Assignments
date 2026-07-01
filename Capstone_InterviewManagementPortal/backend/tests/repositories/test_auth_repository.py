import pytest
from app.repositories import auth_repo
from app.core.database import db
from app.utils.security_utils import get_password_hash, verify_password


@pytest.mark.asyncio
async def test_auth_repo_get_user_by_email(async_client):
    # Insert a user first
    await db.users.insert_one({
        "name": "Auth Repo User",
        "email": "repouser@nucleusteq.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    
    # Retrieve user
    user = await auth_repo.get_user_by_email("repouser@nucleusteq.com")
    assert user is not None
    assert user["name"] == "Auth Repo User"
    
    # Case insensitivity / whitespace strip check
    user_case = await auth_repo.get_user_by_email("  RepoUser@nucleusteq.com  ")
    assert user_case is not None
    assert user_case["name"] == "Auth Repo User"


@pytest.mark.asyncio
async def test_auth_repo_update_password(async_client):
    result = await db.users.insert_one({
        "name": "Auth Repo User",
        "email": "repouser@nucleusteq.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "active": True,
        "reset_required": True
    })
    user_id = result.inserted_id
    
    # Update password
    new_hashed = get_password_hash("newPassword123")
    await auth_repo.update_password(str(user_id), new_hashed)
    
    # Fetch from db and verify
    user = await db.users.find_one({"_id": user_id})
    assert user["reset_required"] is False
    assert verify_password("newPassword123", user["password"]) is True
