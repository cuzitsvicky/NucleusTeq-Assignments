import pytest
from app.services import auth_service
from app.core.database import db
from app.utils.security_utils import get_password_hash, verify_password
from app.exceptions import UnauthorizedException, ForbiddenException

# Configure all test functions in this module to run asynchronously under pytest-asyncio
pytestmark = pytest.mark.asyncio


@pytest.fixture(autouse=True)
async def run_around_tests(async_client):
    """
    Autouse fixture that runs database cleanup before and after each test case.
    Explicitly requests the `async_client` fixture to ensure the database connection
    has been initialized by FastAPI's lifespan handlers.
    """
    # Clean users collection before test
    await db.users.delete_many({})
    yield
    # Clean users collection after test
    await db.users.delete_many({})


async def test_service_authenticate_user_success(async_client):
    await db.users.insert_one({
        "name": "Auth Service User",
        "email": "service_auth@nucleusteq.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    user = await auth_service.authenticate_user("service_auth@nucleusteq.com", "password123")
    assert user is not None
    assert user["email"] == "service_auth@nucleusteq.com"


async def test_service_authenticate_user_invalid_credentials(async_client):
    await db.users.insert_one({
        "name": "Auth Service User",
        "email": "service_auth@nucleusteq.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    # Wrong password
    with pytest.raises(UnauthorizedException):
        await auth_service.authenticate_user("service_auth@nucleusteq.com", "wrong")
        
    # Non-existent email
    with pytest.raises(UnauthorizedException):
        await auth_service.authenticate_user("nonexistent@nucleusteq.com", "password123")


async def test_service_authenticate_user_disabled(async_client):
    await db.users.insert_one({
        "name": "Disabled Service User",
        "email": "disabled_service@nucleusteq.com",
        "password": get_password_hash("password123"),
        "role": "HR",
        "active": False,
        "reset_required": False
    })
    with pytest.raises(ForbiddenException):
        await auth_service.authenticate_user("disabled_service@nucleusteq.com", "password123")


async def test_service_reset_password(async_client):
    result = await db.users.insert_one({
        "name": "Reset Service User",
        "email": "reset_service@nucleusteq.com",
        "password": get_password_hash("tempPass123"),
        "role": "Interviewer",
        "active": True,
        "reset_required": True
    })
    user_id = result.inserted_id
    
    await auth_service.reset_password(str(user_id), "newSecurePass1")
    
    # Fetch user directly from database and verify
    user = await db.users.find_one({"_id": user_id})
    assert user["reset_required"] is False
    assert verify_password("newSecurePass1", user["password"]) is True
