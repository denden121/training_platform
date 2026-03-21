from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.profile import router as profile_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(profile_router)
