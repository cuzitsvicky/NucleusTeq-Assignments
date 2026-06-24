import os
import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient

# Set env DB_NAME to test database before imports
os.environ["DB_NAME"] = "interview_portal_test1"

from app.main import app
from app.core.config import settings
from app.core.database import db
from app.utils.security_utils import get_password_hash


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def run_around_tests():
    # Clean the test database before each test run
    mongo_client = MongoClient(settings.MONGO_URI)
    mongo_client.drop_database(settings.DB_NAME)
    yield
    # Clean up after test
    mongo_client.drop_database(settings.DB_NAME)


@pytest.fixture
def admin_headers():
    db.users.insert_one({
        "name": "Test Admin",
        "email": "admin@nucleusteq.com",
        "password": get_password_hash("admin123"),
        "role": "Admin",
        "active": True,
        "reset_required": False
    })
    return {"Authorization": "Basic YWRtaW5AbnVjbGV1c3RlcS5jb206YWRtaW4xMjM="} # admin@nucleusteq.com:admin123


@pytest.fixture
def hr_headers():
    db.users.insert_one({
        "name": "Test HR",
        "email": "hr@nucleusteq.com",
        "password": get_password_hash("hr123"),
        "role": "HR",
        "active": True,
        "reset_required": False
    })
    return {"Authorization": "Basic aHJAbnVjbGV1c3RlcS5jb206aHIxMjM="} # hr@nucleusteq.com:hr123


@pytest.fixture
def interviewer_headers():
    db.users.insert_one({
        "name": "Test Interviewer",
        "email": "interviewer@nucleusteq.com",
        "password": get_password_hash("int123"),
        "role": "Interviewer",
        "active": True,
        "reset_required": False
    })
    return {"Authorization": "Basic aW50ZXJ2aWV3ZXJAbnVjbGV1c3RlcS5jb206aW50MTIz"} # interviewer@nucleusteq.com:int123
