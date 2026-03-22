import uuid
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import InvalidToken, UserNotFound
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user import UserRepository
from app.services.auth import AuthService
from app.services.profile import ProfileService

bearer = HTTPBearer()


def get_user_repo(db: Annotated[AsyncSession, Depends(get_db)]) -> UserRepository:
    return UserRepository(db)


def get_auth_service(repo: Annotated[UserRepository, Depends(get_user_repo)]) -> AuthService:
    return AuthService(repo)


def get_profile_service(repo: Annotated[UserRepository, Depends(get_user_repo)]) -> ProfileService:
    return ProfileService(repo)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer)],
    repo: Annotated[UserRepository, Depends(get_user_repo)],
) -> User:
    try:
        user_id = decode_token(credentials.credentials, token_type="access")
    except JWTError as exc:
        raise InvalidToken() from exc
    user = await repo.get_by_id(uuid.UUID(user_id))
    if user is None or not user.is_active:
        raise UserNotFound()
    return user
