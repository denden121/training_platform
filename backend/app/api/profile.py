from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user, get_profile_service
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.profile import ProfileService

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProfileService, Depends(get_profile_service)],
) -> ProfileResponse:
    return service.get(current_user)


@router.put("", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[ProfileService, Depends(get_profile_service)],
) -> ProfileResponse:
    return await service.update(current_user, body)
