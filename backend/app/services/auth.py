import uuid
from datetime import UTC, datetime

from jose import JWTError

from app.core.exceptions import AccountDisabled, EmailAlreadyExists, InvalidCredentials, InvalidToken, UserNotFound
from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.repositories.user import UserRepository
from app.schemas.auth import TokenResponse


class AuthService:
    def __init__(self, repo: UserRepository) -> None:
        self.repo = repo

    async def register(self, email: str, password: str) -> TokenResponse:
        if await self.repo.get_by_email(email):
            raise EmailAlreadyExists()
        user = await self.repo.create(email, hash_password(password))
        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )

    async def login(self, email: str, password: str) -> TokenResponse:
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise InvalidCredentials()
        if not user.is_active:
            raise AccountDisabled()
        user.last_login_at = datetime.now(UTC)
        await self.repo.save(user)
        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            user_id = decode_token(refresh_token, token_type="refresh")
        except JWTError as exc:
            raise InvalidToken() from exc
        user = await self.repo.get_by_id(uuid.UUID(user_id))
        if not user or not user.is_active:
            raise UserNotFound()
        return TokenResponse(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )
