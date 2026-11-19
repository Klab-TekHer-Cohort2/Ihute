import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Reads and writes camelCase JSON (fullName) to match the frontend."""
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class RegisterRequest(CamelModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str | None = None
    email: str | None = None
    password: str = Field(min_length=6, max_length=64)
    district: str = Field(min_length=1, max_length=80)
    sector: str = Field(min_length=1, max_length=80)
    preferred_language: str = Field(default="rw", pattern="^(rw|en)$")


class LoginRequest(CamelModel):
    identifier: str  # phone or email
    password: str


class UserOut(CamelModel):
    id: uuid.UUID
    full_name: str
    phone: str | None = None
    email: str | None = None
    role: str
    district: str | None = None
    sector: str | None = None
    preferred_language: str


class AuthResponse(CamelModel):
    user: UserOut
    token: str


class LatLng(CamelModel):
    lat: float
    lng: float


class ReportOut(CamelModel):
    id: uuid.UUID
    crop: str
    description: str | None = None
    image_url: str | None = None
    voice_url: str | None = None
    voice_transcript: str | None = None
    # what the AI said (kept separate from what the officer decides)
    predicted_disease: str | None = None
    confidence: float | None = None
    ai_symptoms: str | None = None
    ai_advice: str | None = None
    result_audio_url: str | None = None
    district: str | None = None
    sector: str | None = None
    location: LatLng | None = None
    # officer verification
    status: str
    confirmed_disease: str | None = None
    officer_advice: str | None = None
    submitted_at: datetime
    reviewed_at: datetime | None = None
