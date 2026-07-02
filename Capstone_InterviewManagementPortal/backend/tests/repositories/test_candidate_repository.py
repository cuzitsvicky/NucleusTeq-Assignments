import pytest
from app.repositories import candidate_repo
from bson.objectid import ObjectId


async def test_repository_create_and_get_candidate():
    candidate_data = {
        "first_name": "Repo",
        "last_name": "Test",
        "email": "repo@nucleusteq.com",
        "mobile": "1231231230",
        "current_company": "Repo Corp",
        "total_experience": "2 years",
        "applied_job_id": "60c72b2f9b1d8e1f544976a4"
    }
    candidate_id = await candidate_repo.create_candidate(candidate_data)
    assert ObjectId.is_valid(candidate_id)
    
    retrieved = await candidate_repo.get_candidate_by_id(candidate_id)
    assert retrieved is not None
    assert retrieved["first_name"] == "Repo"
    
    # Exclude check
    duplicate = await candidate_repo.get_candidate_by_email_or_mobile("repo@nucleusteq.com", "9999999999")
    assert duplicate is not None
    
    # Status and history tests
    await candidate_repo.update_candidate_status(candidate_id, "INTERVIEWED")
    updated = await candidate_repo.get_candidate_by_id(candidate_id)
    assert updated["status"] == "INTERVIEWED"
    
    await candidate_repo.add_status_history(candidate_id, "INTERVIEWED", "tester@nucleusteq.com")
    history = await candidate_repo.get_status_history(candidate_id)
    assert len(history) == 1
    assert history[0]["status"] == "INTERVIEWED"
