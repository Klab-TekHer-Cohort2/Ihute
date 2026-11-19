import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from geoalchemy2.elements import WKTElement
from sqlalchemy import Float, func, select, type_coerce
from sqlalchemy.orm import Session

from ai import analyze_report
from database import get_db
from deps import get_current_user, require_role
from models import Report, User
from schemas import LatLng, ReportOut
from storage import save_image, save_voice

router = APIRouter(prefix="/api/reports", tags=["reports"])

CROPS = {"maize", "beans", "cassava", "potato"}
STATUSES = {"pending", "needs_photo", "verified", "rejected"}


def report_query():
    """A report plus its map position as plain numbers."""
    return select(
        Report,
        type_coerce(func.ST_Y(Report.location), Float).label("lat"),
        type_coerce(func.ST_X(Report.location), Float).label("lng"),
    )


def to_out(r: Report, lat: float | None = None, lng: float | None = None) -> ReportOut:
    return ReportOut(
        id=r.id,
        crop=r.crop,
        description=r.description,
        image_url=f"/api/uploads/{r.image_path}" if r.image_path else None,
        voice_url=f"/api/uploads/{r.voice_path}" if r.voice_path else None,
        voice_transcript=r.voice_transcript,
        predicted_disease=r.predicted_disease,
        confidence=r.confidence,
        ai_symptoms=r.ai_symptoms,
        ai_advice=r.ai_advice,
        result_audio_url=f"/api/uploads/{r.result_audio_path}" if r.result_audio_path else None,
        district=r.district,
        sector=r.sector,
        location=LatLng(lat=lat, lng=lng) if lat is not None and lng is not None else None,
        status=r.status,
        confirmed_disease=r.confirmed_disease,
        officer_advice=r.officer_advice,
        submitted_at=r.submitted_at,
        reviewed_at=r.reviewed_at,
    )


def officer_scope(query, user: User):
    """Officers only see reports from their own area. Admins see everything."""
    if user.role == "admin":
        return query
    if not user.district:
        raise HTTPException(status_code=403, detail="Your officer account has no district assigned")
    query = query.where(func.lower(Report.district) == user.district.strip().lower())
    if user.sector:  # sector officer; an officer without a sector covers the whole district
        query = query.where(func.lower(Report.sector) == user.sector.strip().lower())
    return query


def can_view(user: User, r: Report) -> bool:
    if user.role == "admin":
        return True
    if user.role == "farmer":
        return r.farmer_id == user.id
    same_district = (r.district or "").strip().lower() == (user.district or "").strip().lower()
    same_sector = (r.sector or "").strip().lower() == (user.sector or "").strip().lower()
    return same_district and (not user.sector or same_sector)


@router.post("", response_model=ReportOut, status_code=201)
async def create_report(
    crop: str = Form(...),
    description: str | None = Form(None),
    lat: float | None = Form(None),
    lng: float | None = Form(None),
    photo: UploadFile | None = File(None),
    voice: UploadFile | None = File(None),
    user: User = Depends(require_role("farmer")),
    db: Session = Depends(get_db),
):
    """A farmer reports a crop problem with a photo, a voice note, text, or any mix."""
    crop = crop.strip().lower()
    if crop not in CROPS:
        raise HTTPException(status_code=422, detail=f"crop must be one of: {', '.join(sorted(CROPS))}")

    description = (description or "").strip() or None
    if photo is not None and not photo.filename:
        photo = None
    if voice is not None and not voice.filename:
        voice = None
    if not (photo or voice or description):
        raise HTTPException(status_code=422, detail="Send a photo, a voice note or a description")

    if (lat is None) != (lng is None):
        raise HTTPException(status_code=422, detail="Send both lat and lng, or neither")
    if lat is not None and not (-90 <= lat <= 90 and -180 <= lng <= 180):
        raise HTTPException(status_code=422, detail="lat/lng out of range")

    image_path = await save_image(photo) if photo else None
    voice_path = await save_voice(voice) if voice else None

    report = Report(
        farmer_id=user.id,
        crop=crop,
        channel="app",
        description=description,
        image_path=image_path,
        voice_path=voice_path,
        district=user.district,   # copied from the farmer's registered location:
        sector=user.sector,       # this is what routes the report to the sector officer
        location=WKTElement(f"POINT({lng} {lat})", srid=4326) if lat is not None else None,
        status="pending",
    )
    db.add(report)
    db.commit()  # saved first, so the report is never lost if the AI step fails
    db.refresh(report)

    try:
        analyze_report(report)
        db.commit()
        db.refresh(report)
    except Exception:
        db.rollback()  # the report stays saved and still reaches the officer

    return to_out(report, lat, lng)


@router.get("/mine", response_model=list[ReportOut])
def my_reports(user: User = Depends(require_role("farmer")), db: Session = Depends(get_db)):
    rows = db.execute(
        report_query().where(Report.farmer_id == user.id).order_by(Report.submitted_at.desc())
    ).all()
    return [to_out(r, lat, lng) for r, lat, lng in rows]


@router.get("", response_model=list[ReportOut])
def list_reports(
    status: str | None = Query(None),
    crop: str | None = Query(None),
    user: User = Depends(require_role("officer", "admin")),
    db: Session = Depends(get_db),
):
    """The officer's queue: reports from the officer's own sector (or district)."""
    query = officer_scope(report_query(), user)
    if status:
        if status not in STATUSES:
            raise HTTPException(status_code=422, detail=f"status must be one of: {', '.join(sorted(STATUSES))}")
        query = query.where(Report.status == status)
    if crop:
        query = query.where(Report.crop == crop.strip().lower())
    rows = db.execute(query.order_by(Report.submitted_at.desc()).limit(200)).all()
    return [to_out(r, lat, lng) for r, lat, lng in rows]


@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = db.execute(report_query().where(Report.id == report_id)).first()
    # 404 (not 403) when you may not see it, so nobody can probe which reports exist
    if row is None or not can_view(user, row[0]):
        raise HTTPException(status_code=404, detail="Report not found")
    r, lat, lng = row
    return to_out(r, lat, lng)
