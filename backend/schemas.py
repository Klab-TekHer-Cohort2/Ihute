import uuid
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
