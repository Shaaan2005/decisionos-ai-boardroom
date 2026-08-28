import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_and_login_flow(async_client: AsyncClient):
    # 1. Register
    register_payload = {
        "email": "strategist@decisionos.ai",
        "password": "Password123!",
        "full_name": "Alex Mercer",
        "current_role": "Staff Engineer",
        "career_goals": "Transition into AI startup leadership"
    }
    response = await async_client.post("/api/auth/register", json=register_payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "strategist@decisionos.ai"
    token = data["access_token"]

    # 2. Login
    login_payload = {
        "email": "strategist@decisionos.ai",
        "password": "Password123!"
    }
    login_res = await async_client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 3. Get /me
    me_res = await async_client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["full_name"] == "Alex Mercer"
    assert me_data["profile"]["current_role"] == "Staff Engineer"
