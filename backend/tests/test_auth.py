"""
Tests for POST /auth/register, /auth/login, /auth/refresh
"""
import pytest
from httpx import AsyncClient

from tests.conftest import register


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_register_returns_tokens(client: AsyncClient):
    data = await register(client)
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_status_201(client: AsyncClient):
    r = await client.post("/auth/register", json={"email": "a@a.com", "password": "password123"})
    assert r.status_code == 201


@pytest.mark.asyncio
async def test_register_duplicate_email_409(client: AsyncClient):
    await register(client, "dup@example.com")
    r = await client.post("/auth/register", json={"email": "dup@example.com", "password": "password123"})
    assert r.status_code == 409


@pytest.mark.asyncio
async def test_register_password_too_short_422(client: AsyncClient):
    r = await client.post("/auth/register", json={"email": "short@example.com", "password": "1234567"})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email_422(client: AsyncClient):
    r = await client.post("/auth/register", json={"email": "not-an-email", "password": "password123"})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_register_missing_fields_422(client: AsyncClient):
    r = await client.post("/auth/register", json={"email": "x@x.com"})
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    await register(client, "login@example.com")
    r = await client.post("/auth/login", json={"email": "login@example.com", "password": "password123"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password_401(client: AsyncClient):
    await register(client, "wp@example.com")
    r = await client.post("/auth/login", json={"email": "wp@example.com", "password": "wrongpassword"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email_401(client: AsyncClient):
    r = await client.post("/auth/login", json={"email": "ghost@example.com", "password": "password123"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_login_case_sensitive_password(client: AsyncClient):
    await register(client, "case@example.com", "Password123")
    r = await client.post("/auth/login", json={"email": "case@example.com", "password": "password123"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_login_updates_last_login_at(client: AsyncClient, db):
    from sqlalchemy import select
    from app.models.user import User

    await register(client, "ts@example.com")
    await client.post("/auth/login", json={"email": "ts@example.com", "password": "password123"})

    result = await db.execute(select(User).where(User.email == "ts@example.com"))
    user = result.scalar_one()
    assert user.last_login_at is not None


# ---------------------------------------------------------------------------
# Refresh
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_refresh_returns_new_tokens(client: AsyncClient, tokens: dict):
    r = await client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_refresh_new_access_token_works(client: AsyncClient, tokens: dict):
    r = await client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    new_access = r.json()["access_token"]
    r2 = await client.get("/profile", headers={"Authorization": f"Bearer {new_access}"})
    assert r2.status_code == 200


@pytest.mark.asyncio
async def test_refresh_invalid_token_401(client: AsyncClient):
    r = await client.post("/auth/refresh", json={"refresh_token": "invalid.token.here"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_refresh_with_access_token_rejected(client: AsyncClient, tokens: dict):
    """Access token must not be accepted as refresh token."""
    r = await client.post("/auth/refresh", json={"refresh_token": tokens["access_token"]})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_access_token_not_accepted_as_refresh(client: AsyncClient, tokens: dict):
    """Sanity: access token type check."""
    from jose import jwt
    from app.core.config import settings

    payload = jwt.decode(tokens["access_token"], settings.SECRET_KEY, algorithms=["HS256"])
    assert payload["type"] == "access"

    payload2 = jwt.decode(tokens["refresh_token"], settings.SECRET_KEY, algorithms=["HS256"])
    assert payload2["type"] == "refresh"
