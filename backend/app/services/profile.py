from app.core.exceptions import ProfileNotFound
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.profile import ProfileResponse, ProfileUpdate


class ProfileService:
    def __init__(self, repo: UserRepository) -> None:
        self.repo = repo

    def get(self, user: User) -> ProfileResponse:
        if not user.profile:
            raise ProfileNotFound()
        return ProfileResponse.model_validate(user.profile)

    async def update(self, user: User, data: ProfileUpdate) -> ProfileResponse:
        if not user.profile:
            raise ProfileNotFound()
        profile = user.profile
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(profile, field, value)
        await self.repo.save(profile)
        return ProfileResponse.model_validate(profile)
