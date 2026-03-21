import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.user import Gender, TrainingLevel


class ProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    first_name: str | None
    last_name: str | None
    birth_date: datetime | None
    gender: Gender | None
    weight_kg: float | None
    height_cm: int | None
    timezone: str
    ftp_watts: int | None
    threshold_pace_sec_per_km: int | None
    vo2max: float | None
    lthr: int | None
    hr_max: int | None
    hr_resting: int | None
    training_level: TrainingLevel | None
    weekly_hours_available: float | None

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    birth_date: datetime | None = None
    gender: Gender | None = None
    weight_kg: float | None = None
    height_cm: int | None = None
    timezone: str | None = None
    ftp_watts: int | None = None
    threshold_pace_sec_per_km: int | None = None
    vo2max: float | None = None
    lthr: int | None = None
    hr_max: int | None = None
    hr_resting: int | None = None
    training_level: TrainingLevel | None = None
    weekly_hours_available: float | None = None
