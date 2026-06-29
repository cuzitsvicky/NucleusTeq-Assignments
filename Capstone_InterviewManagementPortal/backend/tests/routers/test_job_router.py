import pytest
from bson.objectid import ObjectId

pytestmark = pytest.mark.asyncio


async def test_router_create_job_success(client, hr_headers):
    payload = {
        "title": "Software Engineer",
        "job_details": "Develop API endpoints using FastAPI.",
        "job_role": "Backend Developer",
        "required_skills": "Python, FastAPI",
        "experience_required": "2-4 years",
        "employment_type": "Full Time",
        "location": "Remote"
    }
    
    # HR should be authorized to create a job
    response = await client.post("/api/jobs/", json=payload, headers=hr_headers)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["title"] == "Software Engineer"
    assert res_data["id"] is not None


async def test_router_create_job_unauthorized(client, interviewer_headers):
    payload = {
        "title": "Software Engineer",
        "job_details": "Develop API endpoints using FastAPI.",
        "job_role": "Backend Developer",
        "required_skills": "Python, FastAPI",
        "experience_required": "2-4 years",
        "employment_type": "Full Time",
        "location": "Remote"
    }
    
    # Interviewers should be blocked (403 Forbidden)
    response = await client.post("/api/jobs/", json=payload, headers=interviewer_headers)
    assert response.status_code == 403
    assert "Not authorized" in response.json()["detail"]


async def test_router_get_jobs_pagination(client, hr_headers):
    # Insert multiple jobs
    for i in range(3):
        await client.post("/api/jobs/", json={
            "title": f"Job {i}",
            "job_details": "Details",
            "job_role": "Role",
            "required_skills": "Skills",
            "experience_required": "1 year",
            "employment_type": "Full Time",
            "location": "Remote"
        }, headers=hr_headers)
        
    # Valid retrieval
    response = await client.get("/api/jobs/?page=1", headers=hr_headers)
    assert response.status_code == 200
    assert len(response.json()) == 3
    
    # Invalid page number (BadRequest)
    response_invalid = await client.get("/api/jobs/?page=0", headers=hr_headers)
    assert response_invalid.status_code == 400
    assert "Page number must be 1 or greater" in response_invalid.json()["detail"]


async def test_router_get_job_by_id(client, hr_headers):
    # Create job
    create_resp = await client.post("/api/jobs/", json={
        "title": "Fetch Job",
        "job_details": "Details",
        "job_role": "Role",
        "required_skills": "Skills",
        "experience_required": "1 year",
        "employment_type": "Full Time",
        "location": "Remote"
    }, headers=hr_headers)
    job_id = create_resp.json()["id"]
    
    # Get valid job
    response = await client.get(f"/api/jobs/{job_id}", headers=hr_headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Fetch Job"
    
    # Get invalid job ID format
    response_invalid = await client.get("/api/jobs/invalid-id", headers=hr_headers)
    assert response_invalid.status_code == 400
    assert "Invalid job ID format" in response_invalid.json()["detail"]
    
    # Get non-existent job
    non_existent = str(ObjectId())
    response_missing = await client.get(f"/api/jobs/{non_existent}", headers=hr_headers)
    assert response_missing.status_code == 404
    assert "Job not found" in response_missing.json()["detail"]


async def test_router_update_job(client, hr_headers, interviewer_headers):
    # Create job
    create_resp = await client.post("/api/jobs/", json={
        "title": "Update Job",
        "job_details": "Details",
        "job_role": "Role",
        "required_skills": "Skills",
        "experience_required": "1 year",
        "employment_type": "Full Time",
        "location": "Remote"
    }, headers=hr_headers)
    job_id = create_resp.json()["id"]
    
    update_payload = {
        "title": "Updated Job Title",
        "job_details": "Updated Details",
        "job_role": "Senior Role",
        "required_skills": "Skills",
        "experience_required": "2 years",
        "employment_type": "Full Time",
        "location": "Onsite"
    }
    
    # Interviewer attempt to update -> 403 Forbidden
    resp_unauth = await client.put(f"/api/jobs/{job_id}", json=update_payload, headers=interviewer_headers)
    assert resp_unauth.status_code == 403
    
    # Valid update -> 200 Success
    resp_success = await client.put(f"/api/jobs/{job_id}", json=update_payload, headers=hr_headers)
    assert resp_success.status_code == 200
    assert resp_success.json()["message"] == "Job updated"
    
    # Fetch to verify updates
    verify_resp = await client.get(f"/api/jobs/{job_id}", headers=hr_headers)
    assert verify_resp.json()["title"] == "Updated Job Title"
    
    # Update invalid job ID format
    resp_invalid = await client.put("/api/jobs/invalid-id", json=update_payload, headers=hr_headers)
    assert resp_invalid.status_code == 400
    
    # Update non-existent job
    non_existent = str(ObjectId())
    resp_missing = await client.put(f"/api/jobs/{non_existent}", json=update_payload, headers=hr_headers)
    assert resp_missing.status_code == 404
