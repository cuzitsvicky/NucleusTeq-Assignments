from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from bson import ObjectId


USER_ID = "507f1f77bcf86cd799439011"
JOB_ID = "507f1f77bcf86cd799439012"
CANDIDATE_ID = "507f1f77bcf86cd799439013"
INTERVIEW_ID = "507f1f77bcf86cd799439014"


@pytest.fixture
def object_ids():
    return SimpleNamespace(
        user=USER_ID,
        job=JOB_ID,
        candidate=CANDIDATE_ID,
        interview=INTERVIEW_ID,
    )


@pytest.fixture
def admin_user(object_ids):
    return {
        "_id": ObjectId(object_ids.user),
        "name": "Admin User",
        "email": "admin@nucleusteq.com",
        "role": "Admin",
        "active": True,
        "reset_required": False,
    }


@pytest.fixture
def hr_user(object_ids):
    return {
        "_id": ObjectId(object_ids.user),
        "name": "Hr User",
        "email": "hr@nucleusteq.com",
        "role": "HR",
        "active": True,
        "reset_required": False,
    }


@pytest.fixture
def interviewer_user(object_ids):
    return {
        "_id": ObjectId(object_ids.user),
        "name": "Interview User",
        "email": "interviewer@nucleusteq.com",
        "role": "Interviewer",
        "active": True,
        "reset_required": False,
    }


@pytest.fixture
def job_payload():
    return {
        "title": "Python Developer",
        "job_details": "Build APIs",
        "job_role": "Backend Engineer",
        "required_skills": "Python, FastAPI",
        "experience_required": "2 years",
        "employment_type": "Full Time",
        "location": "Indore",
    }


@pytest.fixture
def candidate_payload(object_ids):
    return {
        "first_name": "Asha",
        "last_name": "Sharma",
        "email": "asha@example.com",
        "mobile": "9876543210",
        "current_company": "NucleusTeq",
        "total_experience": "3 years",
        "applied_job_id": object_ids.job,
    }


@pytest.fixture
def interview_payload(object_ids):
    return {
        "candidate_id": object_ids.candidate,
        "job_id": object_ids.job,
        "job_title": "Python Developer",
        "interview_date": "2999-01-01",
        "interview_time": "10:30",
        "interviewer_email": "interviewer@nucleusteq.com",
        "focus_areas": "Python and APIs",
    }


@pytest.fixture
def feedback_payload():
    return {
        "technical_rating": 4,
        "communication_rating": 5,
        "problem_solving_rating": 4,
        "tech_areas_covered": "Python",
        "comments": "Good discussion",
        "recommendation": "SELECT",
    }


class FakeInsertResult:
    def __init__(self, inserted_id=None):
        self.inserted_id = inserted_id or ObjectId()


class FakeUpdateResult:
    def __init__(self, modified_count=1):
        self.modified_count = modified_count


class FakeCursor:
    def __init__(self, data=None):
        self.data = list(data or [])
        self.calls = []

    def sort(self, *args):
        self.calls.append(("sort", args))
        return self

    def skip(self, value):
        self.calls.append(("skip", value))
        return self

    def limit(self, value):
        self.calls.append(("limit", value))
        return self

    async def to_list(self, length=None):
        return self.data[:length] if length is not None else self.data


class FakeCollection:
    def __init__(self, find_one_result=None, find_data=None, count=0, modified_count=1):
        self.find_one_result = find_one_result
        self.find_data = list(find_data or [])
        self.count = count
        self.modified_count = modified_count
        self.inserted = []
        self.find_one_calls = []
        self.find_calls = []
        self.update_calls = []
        self.count_calls = []
        self.cursor = FakeCursor(self.find_data)

    async def find_one(self, query):
        self.find_one_calls.append(query)
        return self.find_one_result

    async def insert_one(self, data):
        self.inserted.append(data)
        return FakeInsertResult()

    async def update_one(self, query, update):
        self.update_calls.append((query, update))
        return FakeUpdateResult(self.modified_count)

    async def count_documents(self, query):
        self.count_calls.append(query)
        return self.count

    def find(self, query):
        self.find_calls.append(query)
        self.cursor = FakeCursor(self.find_data)
        return self.cursor


def async_return(value=None):
    return AsyncMock(return_value=value)
