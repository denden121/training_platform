"""
Unit tests for app.core.security — no HTTP, no DB needed.
"""
import time

import pytest
from jose import JWTError, jwt

from app.core.config import settings
from app.core.security import (
    ALGORITHM,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------


def test_hash_password_returns_string():
    h = hash_password("secret")
    assert isinstance(h, str)
    assert h != "secret"


def test_verify_password_correct():
    h = hash_password("my_password")
    assert verify_password("my_password", h) is True


def test_verify_password_wrong():
    h = hash_password("my_password")
    assert verify_password("wrong", h) is False


def test_hash_is_different_each_call():
    """Bcrypt uses a random salt — two hashes of the same password must differ."""
    h1 = hash_password("same")
    h2 = hash_password("same")
    assert h1 != h2
    # But both verify correctly
    assert verify_password("same", h1)
    assert verify_password("same", h2)


# ---------------------------------------------------------------------------
# Access token
# ---------------------------------------------------------------------------


def test_create_access_token_decodable():
    token = create_access_token("user-123")
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_decode_access_token_returns_user_id():
    token = create_access_token("abc-uuid")
    assert decode_token(token, "access") == "abc-uuid"


def test_access_token_not_accepted_as_refresh():
    token = create_access_token("user-123")
    with pytest.raises(JWTError):
        decode_token(token, "refresh")


def test_access_token_has_expiry():
    token = create_access_token("user-123")
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    assert "exp" in payload
    assert payload["exp"] > time.time()


# ---------------------------------------------------------------------------
# Refresh token
# ---------------------------------------------------------------------------


def test_create_refresh_token_decodable():
    token = create_refresh_token("user-456")
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "user-456"
    assert payload["type"] == "refresh"


def test_decode_refresh_token_returns_user_id():
    token = create_refresh_token("xyz-uuid")
    assert decode_token(token, "refresh") == "xyz-uuid"


def test_refresh_token_not_accepted_as_access():
    token = create_refresh_token("user-456")
    with pytest.raises(JWTError):
        decode_token(token, "access")


def test_refresh_token_expires_later_than_access():
    access = create_access_token("u")
    refresh = create_refresh_token("u")
    exp_access = jwt.decode(access, settings.SECRET_KEY, algorithms=[ALGORITHM])["exp"]
    exp_refresh = jwt.decode(refresh, settings.SECRET_KEY, algorithms=[ALGORITHM])["exp"]
    assert exp_refresh > exp_access


# ---------------------------------------------------------------------------
# Invalid / tampered tokens
# ---------------------------------------------------------------------------


def test_decode_garbage_token_raises():
    with pytest.raises(JWTError):
        decode_token("not.a.token")


def test_decode_token_wrong_secret_raises():
    token = jwt.encode({"sub": "u", "type": "access"}, "wrong-secret", algorithm=ALGORITHM)
    with pytest.raises(JWTError):
        decode_token(token, "access")


def test_decode_token_missing_sub_raises():
    token = jwt.encode({"type": "access"}, settings.SECRET_KEY, algorithm=ALGORITHM)
    with pytest.raises(JWTError):
        decode_token(token, "access")


def test_decode_token_missing_type_raises():
    token = jwt.encode({"sub": "u"}, settings.SECRET_KEY, algorithm=ALGORITHM)
    with pytest.raises(JWTError):
        decode_token(token, "access")
