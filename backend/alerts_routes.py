import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user, require_role
from models import Alert, Cluster, User
from schemas import AlertOut, CamelModel

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


class AlertDraftRequest(CamelModel):
    cluster_id: uuid.UUID | None = None
    crop: str = Field(min_length=1, max_length=40)
    title: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=10)
    symptoms: str | None = None
    measures: str | None = None
    district: str | None = Field(default=None, max_length=80)
    sector: str | None = Field(default=None, max_length=80)
    radius_km: float = Field(default=5, gt=0, le=200)
    level: int = Field(default=2, ge=0, le=3)


def to_out(a: Alert) -> AlertOut:
    return AlertOut.model_validate(a)


def officer_can_manage(user: User, alert: Alert) -> bool:
    if user.role == "admin":
        return True
    same_district = (alert.district or "").strip().lower() == (user.district or "").strip().lower()
    if not same_district:
        return False
    if user.sector:
        return (alert.sector or "").strip().lower() == user.sector.strip().lower()
    return True


# ── Officer: draft a new alert ────────────────────────────────────────────────

@router.post("", response_model=AlertOut, status_code=201)
def create_alert(
    data: AlertDraftRequest,
    user: User = Depends(require_role("officer", "admin")),
    db: Session = Depends(get_db),
):
    if data.cluster_id:
        cluster = db.get(Cluster, data.cluster_id)
        if cluster is None:
            raise HTTPException(status_code=404, detail="Cluster not found")

    district = (data.district or user.district or "").strip() or None
    sector = (data.sector or user.sector or "").strip() or None

    alert = Alert(
        cluster_id=data.cluster_id,
        crop=data.crop.strip().lower(),
        title=data.title.strip(),
        message=data.message.strip(),
        symptoms=(data.symptoms or "").strip() or None,
        measures=(data.measures or "").strip() or None,
        district=district,
        sector=sector,
        radius_km=data.radius_km,
        level=data.level,
        status="draft",
        drafted_by="officer",
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return to_out(alert)


# ── Officer: list alerts in their area ───────────────────────────────────────

@router.get("/officer", response_model=list[AlertOut])
def list_alerts_officer(
    status: str | None = Query(None),
    user: User = Depends(require_role("officer", "admin")),
    db: Session = Depends(get_db),
):
    query = select(Alert)
    if user.role != "admin":
        if not user.district:
            raise HTTPException(status_code=403, detail="Officer account has no district assigned")
        query = query.where(func.lower(Alert.district) == user.district.strip().lower())
        if user.sector:
            query = query.where(func.lower(Alert.sector) == user.sector.strip().lower())
    if status:
        query = query.where(Alert.status == status)
    alerts = db.scalars(query.order_by(Alert.created_at.desc()).limit(200)).all()
    return [to_out(a) for a in alerts]


# ── Officer: approve (send) or dismiss an alert ───────────────────────────────

@router.patch("/{alert_id}/approve", response_model=AlertOut)
def approve_alert(
    alert_id: uuid.UUID,
    user: User = Depends(require_role("officer", "admin")),
    db: Session = Depends(get_db),
):
    alert = db.get(Alert, alert_id)
    if alert is None or not officer_can_manage(user, alert):
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert.status != "draft":
        raise HTTPException(status_code=409, detail=f"Alert is already '{alert.status}'")

    now = datetime.now(timezone.utc)
    alert.status = "sent"
    alert.approved_by = user.id
    alert.approved_at = now
    alert.sent_at = now
    db.commit()
    db.refresh(alert)
    return to_out(alert)


@router.patch("/{alert_id}/dismiss", response_model=AlertOut)
def dismiss_alert(
    alert_id: uuid.UUID,
    user: User = Depends(require_role("officer", "admin")),
    db: Session = Depends(get_db),
):
    alert = db.get(Alert, alert_id)
    if alert is None or not officer_can_manage(user, alert):
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert.status == "dismissed":
        raise HTTPException(status_code=409, detail="Alert is already dismissed")

    alert.status = "dismissed"
    db.commit()
    db.refresh(alert)
    return to_out(alert)


# ── Farmer: fetch sent alerts for their area ─────────────────────────────────

@router.get("", response_model=list[AlertOut])
def farmer_alerts(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns sent alerts that match the farmer's district (and sector if set)."""
    query = select(Alert).where(Alert.status == "sent")
    if user.district:
        query = query.where(func.lower(Alert.district) == user.district.strip().lower())
    alerts = db.scalars(query.order_by(Alert.sent_at.desc()).limit(100)).all()
    return [to_out(a) for a in alerts]


# ── Officer: get clusters to help draft alerts ────────────────────────────────

@router.get("/clusters", response_model=list[dict])
def list_clusters(
    user: User = Depends(require_role("officer", "admin")),
    db: Session = Depends(get_db),
):
    query = select(Cluster)
    if user.role != "admin":
        if not user.district:
            raise HTTPException(status_code=403, detail="Officer account has no district assigned")
        query = query.where(func.lower(Cluster.district) == user.district.strip().lower())
        if user.sector:
            query = query.where(func.lower(Cluster.sector) == user.sector.strip().lower())
    clusters = db.scalars(query.order_by(Cluster.last_report_at.desc()).limit(100)).all()
    return [
        {
            "id": str(c.id),
            "crop": c.crop,
            "disease": c.disease,
            "district": c.district,
            "sector": c.sector,
            "reportCount": c.report_count,
            "averageConfidence": c.average_confidence,
            "level": c.level,
            "status": c.status,
            "firstReportAt": c.first_report_at.isoformat() if c.first_report_at else None,
            "lastReportAt": c.last_report_at.isoformat() if c.last_report_at else None,
        }
        for c in clusters
    ]
