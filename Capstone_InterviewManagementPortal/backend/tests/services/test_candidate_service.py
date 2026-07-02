import pytest
from app.services import candidate_service
from app.repositories import job_repo
from app.exceptions import BadRequestException, NotFoundException


async def test_service_create_candidate_not_found_job():
    candidate_data = {
        "first_name": "Service",
        "last_name": "Test",
        "email": "service@nucleusteq.com",
        "mobile": "1231231231",
        "current_company": "Service Corp",
        "total_experience": "2 years",
        "applied_job_id": "60c72b2f9b1d8e1f544976a4" # Invalid job id
    }
    with pytest.raises(NotFoundException):
        await candidate_service.create_candidate(candidate_data, "hr@nucleusteq.com")


async def test_service_create_candidate_success():
    # Insert a job
    job_id = await job_repo.create_job({
        "title": "React Developer",
        "job_details": "React Details",
        "job_role": "Developer",
        "required_skills": "React",
        "experience_required": "1 year",
        "employment_type": "Full Time",
        "location": "Boston"
    })
    
    candidate_data = {
        "first_name": "Service",
        "last_name": "Test",
        "email": "service@nucleusteq.com",
        "mobile": "1231231231",
        "current_company": "Service Corp",
        "total_experience": "2 years",
        "applied_job_id": job_id
    }
    candidate_id = await candidate_service.create_candidate(candidate_data, "hr@nucleusteq.com")
    assert candidate_id is not None
    
    # Check duplicate
    with pytest.raises(BadRequestException):
        await candidate_service.create_candidate(candidate_data, "hr@nucleusteq.com")
