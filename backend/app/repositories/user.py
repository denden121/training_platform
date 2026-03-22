import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import Profile, User


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email).options(selectinload(User.profile)))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id).options(selectinload(User.profile)))
        return result.scalar_one_or_none()

    async def create(self, email: str, password_hash: str) -> User:
        user = User(email=email, password_hash=password_hash)
        profile = Profile(user=user, timezone="UTC")
        self.db.add(user)
        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def save(self, instance: object) -> None:
        await self.db.commit()
        await self.db.refresh(instance)
