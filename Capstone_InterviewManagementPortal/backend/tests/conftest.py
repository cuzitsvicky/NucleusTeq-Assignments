import os
import base64
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

# Set env DB_NAME to test database before imports
os.environ["DB_NAME"] = "interview_portal_test"

from app.main import app
from app.core.config import settings
from app.utils.security_utils import get_password_hash


def create_basic_auth_headers(email: str, password: str) -> dict:
    """
    Generate HTTP Basic Authentication headers.
    """
    token = base64.b64encode(f"{email}:{password}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


@pytest_asyncio.fixture(scope="function")
async def client():
    """
    Asynchronous HTTPX client that yields a request client bound to the FastAPI app.
    Properly handles the app lifespan startup (connecting to MongoDB) and shutdown.
    """
    from app.core.database import connect_to_mongo, close_mongo_connection
    await connect_to_mongo()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    await close_mongo_connection()


@pytest_asyncio.fixture(scope="function")
async def async_client(client):
    """
    Alias fixture for client to maintain backwards compatibility.
    """
    yield client


@pytest_asyncio.fixture(autouse=True, scope="function")
async def run_around_tests(client):
    """
    Ensure every test runs against a clean database.
    """
    from app.core.database import db
    await db.client.drop_database(settings.DB_NAME)
    yield
    await db.client.drop_database(settings.DB_NAME)


@pytest_asyncio.fixture(scope="function")
async def admin_headers(client):
    """
    Insert a test administrator user and return basic auth headers.
    """
    from app.core.database import db
    await db.users.insert_one({
        "name": "Test Admin",
        "email": "admin@nucleusteq.com",
        "password": get_password_hash("admin123"),
        "role": "Admin",
        "active": True,
        "reset_required": False
    })
    return create_basic_auth_headers("admin@nucleusteq.com", "admin123")


@pytest_asyncio.fixture(scope="function")
async def hr_headers(client):
    """
    Insert a test HR user and return basic auth headers.
    """
    from app.core.database import db
    await db.users.insert_one({
        "name": "Test HR",
        "email": "hr@nucleusteq.com",
        "password": get_password_hash("hr123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    return create_basic_auth_headers("hr@nucleusteq.com", "hr123")


@pytest_asyncio.fixture(scope="function")
async def interviewer_headers(client):
    """
    Insert a test Interviewer user and return basic auth headers.
    """
    from app.core.database import db
    await db.users.insert_one({
        "name": "Test Interviewer",
        "email": "interviewer@nucleusteq.com",
        "password": get_password_hash("int123"),
        "role": "Interviewer",
        "active": True,
        "reset_required": False
    })
    return create_basic_auth_headers("interviewer@nucleusteq.com", "int123")
