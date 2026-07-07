import pytest

pytestmark = pytest.mark.asyncio


async def test_update_candidate_profile(client, hr_headers):
    # Create a job first to apply to
    job_resp = await client.post("/api/jobs/", json={
        "title": "React Developer",
        "job_details": "Build stunning web apps.",
        "job_role": "Frontend Developer",
        "required_skills": "React",
        "experience_required": "2 years",
        "employment_type": "Full Time",
        "location": "New York"
    }, headers=hr_headers)
    assert job_resp.status_code == 200
    job_id = job_resp.json()["id"]
    
    # Create candidate
    form_data = {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "janesmith@nucleusteq.com",
        "mobile": "9876543210",
        "current_company": "Global Tech",
        "total_experience": "5 years",
        "applied_job_id": job_id
    }
    mock_pdf = ( "resume.pdf", b"pdf content", "application/pdf" )
    resp = await client.post("/api/candidates/", data=form_data, files={"resume": mock_pdf}, headers=hr_headers)
    assert resp.status_code == 200
    candidate_id = resp.json()["id"]
    
    # Update candidate profile fields
    update_payload = {
        "first_name": "Janet",
        "last_name": "Smith-Doe",
        "email": "janetsmith@nucleusteq.com",
        "mobile": "9876543210",
        "current_company": "Global Tech Corp",
        "total_experience": "6 years",
        "applied_job_id": job_id
    }
    
    update_resp = await client.put(f"/api/candidates/{candidate_id}", json=update_payload, headers=hr_headers)
    assert update_resp.status_code == 200
    
    # Get candidate profile to verify updates
    get_resp = await client.get(f"/api/candidates/{candidate_id}", headers=hr_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["first_name"] == "Janet"
    assert get_resp.json()["last_name"] == "Smith-Doe"
    assert get_resp.json()["email"] == "janetsmith@nucleusteq.com"
    assert get_resp.json()["current_company"] == "Global Tech Corp"


async def test_create_candidate_validation_error_returns_422(client, hr_headers):
    form_data = {
        "first_name": "Jane123",
        "last_name": "Smith",
        "email": "janesmith@nucleusteq.com",
        "mobile": "9876543210",
        "current_company": "Global Tech",
        "total_experience": "5 years",
        "applied_job_id": "507f1f77bcf86cd799439011"
    }
    mock_pdf = ("resume.pdf", b"pdf content", "application/pdf")

    resp = await client.post(
        "/api/candidates/",
        data=form_data,
        files={"resume": mock_pdf},
        headers=hr_headers,
    )

    assert resp.status_code == 422
    body = resp.json()
    assert body["message"] == "Validation failed"
    assert body["errors"][0]["field"] == "first_name"
    assert "Name must contain only letters and spaces" in body["errors"][0]["message"]
