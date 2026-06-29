import pytest
from app.core.database import db

@pytest.mark.asyncio
async def test_router_register_user(client, admin_headers, hr_headers):
    payload = {
        "name": "New Employee",
        "email": "employee@nucleusteq.com",
        "password": "password123",
        "role": "Interviewer"
    }
    
    # Non-admin (HR) registration attempt -> 403 Forbidden
    hr_resp = await client.post("/api/auth/register", json=payload, headers=hr_headers)
    assert hr_resp.status_code == 403
    
    # Admin registration attempt -> 200 Success
    admin_resp = await client.post("/api/auth/register", json=payload, headers=admin_headers)
    assert admin_resp.status_code == 200
    res_data = admin_resp.json()
    assert res_data["email"] == "employee@nucleusteq.com"
    assert res_data["role"] == "Interviewer"
    assert res_data["active"] is True
    assert res_data["reset_required"] is True


@pytest.mark.asyncio
async def test_router_get_users(client, admin_headers, hr_headers):
    # Non-admin (HR) list users attempt -> 403 Forbidden
    hr_resp = await client.get("/api/auth/users", headers=hr_headers)
    assert hr_resp.status_code == 403
    
    # Admin list users attempt -> 200 Success
    admin_resp = await client.get("/api/auth/users", headers=admin_headers)
    assert admin_resp.status_code == 200
    assert len(admin_resp.json()) >= 1


@pytest.mark.asyncio
async def test_router_get_interviewers(client, admin_headers, hr_headers, interviewer_headers):
    # Interviewer access to list interviewers -> 403 Forbidden
    int_resp = await client.get("/api/auth/interviewers", headers=interviewer_headers)
    assert int_resp.status_code == 403
    
    # Admin/HR access to list interviewers -> 200 Success
    hr_resp = await client.get("/api/auth/interviewers", headers=hr_headers)
    assert hr_resp.status_code == 200
    assert isinstance(hr_resp.json(), list)


@pytest.mark.asyncio
async def test_router_update_and_disable_user(client, admin_headers, hr_headers):
    # Create target user to update
    register_resp = await client.post("/api/auth/register", json={
        "name": "Target User",
        "email": "target@nucleusteq.com",
        "password": "password123",
        "role": "Interviewer"
    }, headers=admin_headers)
    assert register_resp.status_code == 200
    user_id = register_resp.json()["id"]
    
    # Non-admin update attempt -> 403 Forbidden
    update_payload = {
        "name": "Updated Name",
        "role": "HR",
        "active": False
    }
    hr_resp = await client.put(f"/api/auth/users/{user_id}", json=update_payload, headers=hr_headers)
    assert hr_resp.status_code == 403
    
    # Admin update attempt (and disabling user) -> 200 Success
    admin_resp = await client.put(f"/api/auth/users/{user_id}", json=update_payload, headers=admin_headers)
    assert admin_resp.status_code == 200
    assert admin_resp.json()["message"] == "User updated"
    
    # Double check database state to verify update and disable
    user_doc = await db.users.find_one({"email": "target@nucleusteq.com"})
    assert user_doc["name"] == "Updated Name"
    assert user_doc["role"] == "HR"
    assert user_doc["active"] is False


@pytest.mark.asyncio
async def test_router_update_user_self_block(client, admin_headers):
    # Get current admin profile to fetch ID
    me_resp = await client.get("/api/auth/me", headers=admin_headers)
    assert me_resp.status_code == 200
    admin_id = me_resp.json()["id"]
    
    # Attempt to update own account (even with admin headers) -> 403 Forbidden
    payload = {
        "name": "Admin Try Self Update",
        "role": "Admin",
        "active": True
    }
    resp = await client.put(f"/api/auth/users/{admin_id}", json=payload, headers=admin_headers)
    assert resp.status_code == 403
    assert "You cannot update your own account" in resp.json()["detail"]
