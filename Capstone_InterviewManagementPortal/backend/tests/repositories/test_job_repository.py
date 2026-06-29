import pytest
from app.repositories import job_repo
from app.core.database import db
from bson.objectid import ObjectId

pytestmark = pytest.mark.asyncio


async def test_repository_create_and_get_job(async_client):
    job_data = {
        "title": "Backend Dev",
        "job_details": "FastAPI development",
        "job_role": "Developer",
        "required_skills": "Python",
        "experience_required": "1 year",
        "employment_type": "Full Time",
        "location": "Remote"
    }
    
    # Create job
    job_id = await job_repo.create_job(job_data)
    assert job_id is not None
    assert ObjectId.is_valid(job_id)
    
    # Get job
    fetched_job = await job_repo.get_job_by_id(job_id)
    assert fetched_job is not None
    assert fetched_job["title"] == "Backend Dev"
    assert fetched_job["location"] == "Remote"


async def test_repository_get_job_by_id_invalid(async_client):
    # Invalid ObjectId format
    assert await job_repo.get_job_by_id("invalid-id") is None
    
    # Non-existent valid ObjectId
    non_existent_id = str(ObjectId())
    assert await job_repo.get_job_by_id(non_existent_id) is None


async def test_repository_update_job(async_client):
    job_data = {
        "title": "Backend Dev",
        "job_details": "FastAPI development",
        "job_role": "Developer",
        "required_skills": "Python",
        "experience_required": "1 year",
        "employment_type": "Full Time",
        "location": "Remote"
    }
    job_id = await job_repo.create_job(job_data)
    
    update_data = {
        "title": "Senior Backend Dev",
        "location": "Onsite"
    }
    await job_repo.update_job(job_id, update_data)
    
    # Fetch and verify
    fetched_job = await job_repo.get_job_by_id(job_id)
    assert fetched_job["title"] == "Senior Backend Dev"
    assert fetched_job["location"] == "Onsite"
    assert fetched_job["job_role"] == "Developer"  # Unchanged field remains intact


async def test_repository_get_all_jobs_pagination(async_client):
    # Insert 12 jobs to verify pagination (PAGE_SIZE = 10)
    for i in range(12):
        await job_repo.create_job({
            "title": f"Job {i}",
            "job_details": "Details",
            "job_role": "Role",
            "required_skills": "Skills",
            "experience_required": "1 year",
            "employment_type": "Full Time",
            "location": "Remote"
        })
        
    # Get page 1 (should return 10 items)
    page1 = await job_repo.get_all_jobs(page=1)
    assert len(page1) == 10
    
    # Get page 2 (should return 2 items)
    page2 = await job_repo.get_all_jobs(page=2)
    assert len(page2) == 2
