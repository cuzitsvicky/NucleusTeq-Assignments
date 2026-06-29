import pytest
from app.services import job_service
from app.core.database import db
from bson.objectid import ObjectId

pytestmark = pytest.mark.asyncio


async def test_service_create_job(async_client):
    job_data = {
        "title": "Service Job",
        "job_details": "FastAPI service testing",
        "job_role": "Architect",
        "required_skills": "Python, Design Patterns",
        "experience_required": "8 years",
        "employment_type": "Full Time",
        "location": "New York"
    }
    
    # Create job via service
    result = await job_service.create_job(job_data)
    assert result["id"] is not None
    assert ObjectId.is_valid(result["id"])
    assert result["title"] == "Service Job"


async def test_service_get_jobs_pagination(async_client):
    # Create multiple jobs
    for i in range(5):
        await job_service.create_job({
            "title": f"Service Job {i}",
            "job_details": "Details",
            "job_role": "Role",
            "required_skills": "Skills",
            "experience_required": "1 year",
            "employment_type": "Full Time",
            "location": "Remote"
        })
        
    jobs = await job_service.get_jobs(page=1)
    assert len(jobs) == 5
    for job in jobs:
        assert "id" in job
        assert "_id" not in job


async def test_service_get_job_by_id(async_client):
    job_data = {
        "title": "Single Job",
        "job_details": "Single details",
        "job_role": "Role",
        "required_skills": "Skills",
        "experience_required": "2 years",
        "employment_type": "Full Time",
        "location": "Boston"
    }
    created = await job_service.create_job(job_data)
    job_id = created["id"]
    
    # Fetch job by ID
    fetched = await job_service.get_job_by_id(job_id)
    assert fetched is not None
    assert fetched["id"] == job_id
    assert fetched["title"] == "Single Job"
    assert "_id" not in fetched
    
    # Fetch non-existent job
    assert await job_service.get_job_by_id(str(ObjectId())) is None


async def test_service_update_job(async_client):
    job_data = {
        "title": "Original Job",
        "job_details": "Details",
        "job_role": "Role",
        "required_skills": "Skills",
        "experience_required": "2 years",
        "employment_type": "Full Time",
        "location": "Boston"
    }
    created = await job_service.create_job(job_data)
    job_id = created["id"]
    
    update_data = {
        "title": "Updated Job Title",
        "job_details": "Updated details"
    }
    await job_service.update_job(job_id, update_data)
    
    # Verify updates
    fetched = await job_service.get_job_by_id(job_id)
    assert fetched["title"] == "Updated Job Title"
    assert fetched["job_details"] == "Updated details"
