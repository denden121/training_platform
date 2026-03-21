import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    athlete = "athlete"
    coach = "coach"
    admin = "admin"


class User(Base):
    __tablename__ = "user"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.athlete, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    profile: Mapped["Profile"] = relationship("Profile", back_populates="user", uselist=False)


class TrainingLevel(str, enum.Enum):
    beginner = "beginner"
    amateur = "amateur"
    advanced = "advanced"
    elite = "elite"


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class Profile(Base):
    __tablename__ = "profile"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    birth_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    gender: Mapped[Gender | None] = mapped_column(Enum(Gender), nullable=True)

    weight_kg: Mapped[float | None] = mapped_column(nullable=True)
    height_cm: Mapped[int | None] = mapped_column(nullable=True)
    timezone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Fitness metrics
    ftp_watts: Mapped[int | None] = mapped_column(nullable=True)
    threshold_pace_sec_per_km: Mapped[int | None] = mapped_column(nullable=True)
    vo2max: Mapped[float | None] = mapped_column(nullable=True)
    lthr: Mapped[int | None] = mapped_column(nullable=True)
    hr_max: Mapped[int | None] = mapped_column(nullable=True)
    hr_resting: Mapped[int | None] = mapped_column(nullable=True)

    training_level: Mapped[TrainingLevel | None] = mapped_column(Enum(TrainingLevel), nullable=True)
    weekly_hours_available: Mapped[float | None] = mapped_column(nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="profile")
