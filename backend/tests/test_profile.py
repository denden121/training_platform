"""
Tests for GET /profile, PUT /profile
"""

import pytest
from httpx import AsyncClient

from tests.conftest import register

# ---------------------------------------------------------------------------
# GET /profile
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_profile_requires_auth(client: AsyncClient):
    r = await client.get("/profile")
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_get_profile_invalid_token_401(client: AsyncClient):
    r = await client.get("/profile", headers={"Authorization": "Bearer bad.token"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_get_profile_empty_after_register(client: AsyncClient, auth_headers: dict):
    r = await client.get("/profile", headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    # All optional fields are null on fresh profile
    assert data["first_name"] is None
    assert data["last_name"] is None
    assert data["ftp_watts"] is None
    assert data["timezone"] == "UTC"


@pytest.mark.asyncio
async def test_get_profile_has_user_id(client: AsyncClient, auth_headers: dict):
    r = await client.get("/profile", headers=auth_headers)
    assert "user_id" in r.json()
    assert "id" in r.json()


@pytest.mark.asyncio
async def test_profiles_isolated_between_users(client: AsyncClient):
    t1 = await register(client, "user1@example.com")
    t2 = await register(client, "user2@example.com")

    # Update user1 profile
    await client.put(
        "/profile",
        json={"first_name": "Alice", "ftp_watts": 250},
        headers={"Authorization": f"Bearer {t1['access_token']}"},
    )

    # user2 must not see user1's data
    r = await client.get("/profile", headers={"Authorization": f"Bearer {t2['access_token']}"})
    assert r.json()["first_name"] is None
    assert r.json()["ftp_watts"] is None


# ---------------------------------------------------------------------------
# PUT /profile
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_update_profile_requires_auth(client: AsyncClient):
    r = await client.put("/profile", json={"first_name": "Ivan"})
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_update_profile_basic(client: AsyncClient, auth_headers: dict):
    r = await client.put("/profile", json={"first_name": "Ivan", "last_name": "Petrov"}, headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["first_name"] == "Ivan"
    assert data["last_name"] == "Petrov"


@pytest.mark.asyncio
async def test_update_profile_partial_doesnt_wipe_other_fields(client: AsyncClient, auth_headers: dict):
    await client.put("/profile", json={"first_name": "Ivan", "ftp_watts": 300}, headers=auth_headers)
    # Update only last_name
    r = await client.put("/profile", json={"last_name": "Petrov"}, headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["first_name"] == "Ivan"  # still there
    assert data["ftp_watts"] == 300  # still there
    assert data["last_name"] == "Petrov"


@pytest.mark.asyncio
async def test_update_profile_fitness_metrics(client: AsyncClient, auth_headers: dict):
    payload = {
        "ftp_watts": 280,
        "vo2max": 58.5,
        "lthr": 162,
        "hr_max": 185,
        "hr_resting": 42,
        "threshold_pace_sec_per_km": 270,
        "weekly_hours_available": 10.5,
    }
    r = await client.put("/profile", json=payload, headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["ftp_watts"] == 280
    assert data["vo2max"] == 58.5
    assert data["lthr"] == 162
    assert data["hr_max"] == 185
    assert data["hr_resting"] == 42
    assert data["threshold_pace_sec_per_km"] == 270
    assert data["weekly_hours_available"] == 10.5


@pytest.mark.asyncio
async def test_update_profile_gender_enum(client: AsyncClient, auth_headers: dict):
    for gender in ("male", "female", "other"):
        r = await client.put("/profile", json={"gender": gender}, headers=auth_headers)
        assert r.status_code == 200, f"Failed for gender={gender}"
        assert r.json()["gender"] == gender


@pytest.mark.asyncio
async def test_update_profile_training_level_enum(client: AsyncClient, auth_headers: dict):
    for level in ("beginner", "amateur", "advanced", "elite"):
        r = await client.put("/profile", json={"training_level": level}, headers=auth_headers)
        assert r.status_code == 200, f"Failed for level={level}"
        assert r.json()["training_level"] == level


@pytest.mark.asyncio
async def test_update_profile_timezone(client: AsyncClient, auth_headers: dict):
    r = await client.put("/profile", json={"timezone": "Europe/Moscow"}, headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["timezone"] == "Europe/Moscow"


@pytest.mark.asyncio
async def test_update_profile_persisted(client: AsyncClient, auth_headers: dict):
    """PUT then GET returns updated data."""
    await client.put("/profile", json={"first_name": "Test", "ftp_watts": 999}, headers=auth_headers)
    r = await client.get("/profile", headers=auth_headers)
    assert r.json()["first_name"] == "Test"
    assert r.json()["ftp_watts"] == 999


@pytest.mark.asyncio
async def test_update_profile_empty_body_ok(client: AsyncClient, auth_headers: dict):
    """Empty PUT is valid — no fields changed."""
    r = await client.put("/profile", json={}, headers=auth_headers)
    assert r.status_code == 200


@pytest.mark.asyncio
async def test_update_profile_does_not_affect_other_user(client: AsyncClient):
    t1 = await register(client, "u1@example.com")
    t2 = await register(client, "u2@example.com")

    await client.put(
        "/profile",
        json={"ftp_watts": 400},
        headers={"Authorization": f"Bearer {t1['access_token']}"},
    )

    r = await client.get("/profile", headers={"Authorization": f"Bearer {t2['access_token']}"})
    assert r.json()["ftp_watts"] is None
