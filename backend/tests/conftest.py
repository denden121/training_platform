import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


# Fresh in-memory DB per test — isolates data without needing rollback tricks
@pytest.fixture
async def engine():
    e = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with e.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield e
    await e.dispose()


@pytest.fixture
async def db(engine) -> AsyncSession:
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session


@pytest.fixture
async def client(db: AsyncSession) -> AsyncClient:
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


# --- Reusable helpers ---


async def register(client: AsyncClient, email: str = "user@example.com", password: str = "password123") -> dict:
    r = await client.post("/auth/register", json={"email": email, "password": password})
    assert r.status_code == 201, r.text
    return r.json()


@pytest.fixture
async def tokens(client: AsyncClient) -> dict:
    """Registered user tokens."""
    return await register(client)


@pytest.fixture
async def access_token(tokens: dict) -> str:
    return tokens["access_token"]


@pytest.fixture
async def auth_headers(access_token: str) -> dict:
    return {"Authorization": f"Bearer {access_token}"}
