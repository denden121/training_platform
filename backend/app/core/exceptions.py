from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    status_code: int = 500
    detail: str = "Internal server error"

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.__class__.detail
        super().__init__(self.detail)


class EmailAlreadyExists(AppError):
    status_code = 409
    detail = "Email already registered"


class InvalidCredentials(AppError):
    status_code = 401
    detail = "Invalid email or password"


class AccountDisabled(AppError):
    status_code = 403
    detail = "Account disabled"


class InvalidToken(AppError):
    status_code = 401
    detail = "Invalid token"


class ProfileNotFound(AppError):
    status_code = 404
    detail = "Profile not found"


class UserNotFound(AppError):
    status_code = 401
    detail = "User not found or inactive"


def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
