import uuid
from datetime import datetime
from sqlalchemy import String, Float, Text, DateTime, ForeignKey, Boolean, Integer, func
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(120), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="farmer")  # farmer | officer | admin
    district: Mapped[str | None] = mapped_column(String(80))
    sector: Mapped[str | None] = mapped_column(String(80))
    preferred_language: Mapped[str] = mapped_column(String(5), default="rw")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Cluster(Base):
    """A possible disease cluster: same crop + disease in the same sector (Level 1)."""
    __tablename__ = "clusters"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    crop: Mapped[str] = mapped_column(String(40))
    disease: Mapped[str] = mapped_column(String(120))
    district: Mapped[str] = mapped_column(String(80))
    sector: Mapped[str] = mapped_column(String(80))
    report_count: Mapped[int] = mapped_column(Integer, default=0)
    average_confidence: Mapped[float | None] = mapped_column(Float)
    level: Mapped[int] = mapped_column(Integer, default=1)  # 1..3
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | under_investigation | verified | rejected
    first_report_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_report_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    cluster_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("clusters.id"))

    # what the farmer sent (at least one of photo / voice / text)
    crop: Mapped[str] = mapped_column(String(40))  # maize | beans | cassava | potato
    channel: Mapped[str] = mapped_column(String(10), default="app")  # app | sms | ussd | voice
    description: Mapped[str | None] = mapped_column(Text)
    image_path: Mapped[str | None] = mapped_column(String(255))
    voice_path: Mapped[str | None] = mapped_column(String(255))
    voice_transcript: Mapped[str | None] = mapped_column(Text)

    # where (copied from the farmer's registered location; GPS point is optional)
    district: Mapped[str | None] = mapped_column(String(80))
    sector: Mapped[str | None] = mapped_column(String(80))
    location = mapped_column(Geometry("POINT", srid=4326), nullable=True)

    # what the AI answered the farmer
    predicted_disease: Mapped[str | None] = mapped_column(String(120))
    confidence: Mapped[float | None] = mapped_column(Float)
    ai_symptoms: Mapped[str | None] = mapped_column(Text)
    ai_advice: Mapped[str | None] = mapped_column(Text)
    result_audio_path: Mapped[str | None] = mapped_column(String(255))

    # what the officer decided (kept separate from the AI prediction)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | needs_photo | verified | rejected
    confirmed_disease: Mapped[str | None] = mapped_column(String(120))
    officer_advice: Mapped[str | None] = mapped_column(Text)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Alert(Base):
    """Community alert. Drafted by the system/AI, approved and sent by an officer."""
    __tablename__ = "alerts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    cluster_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("clusters.id"))
    crop: Mapped[str] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    symptoms: Mapped[str | None] = mapped_column(Text)
    measures: Mapped[str | None] = mapped_column(Text)  # how farmers can reduce or control the disease
    district: Mapped[str | None] = mapped_column(String(80))
    sector: Mapped[str | None] = mapped_column(String(80))
    radius_km: Mapped[float] = mapped_column(Float, default=5)
    level: Mapped[int] = mapped_column(Integer, default=2)  # 0..3
    status: Mapped[str] = mapped_column(String(10), default="draft")  # draft | sent | dismissed
    drafted_by: Mapped[str] = mapped_column(String(10), default="ai")  # ai | officer
    approved_by: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
