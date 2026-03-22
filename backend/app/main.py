from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from redis.asyncio import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.api import api_router
from app.core.config import settings
from app.core.exceptions import AppError, app_error_handler

app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)  # type: ignore[arg-type]
app.include_router(api_router)


@app.get("/health")
async def health() -> dict:
    result: dict = {"status": "ok", "db": "ok", "redis": "ok"}

    try:
        engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        await engine.dispose()
    except Exception:
        result["db"] = "error"
        result["status"] = "degraded"

    try:
        redis = Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1)
        await redis.ping()
        await redis.aclose()
    except Exception:
        result["redis"] = "error"
        result["status"] = "degraded"

    return result
