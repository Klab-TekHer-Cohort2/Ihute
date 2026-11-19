import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field
from sqlalchemy.orm import Session

from cluster_logic import update_cluster
from database import get_db
from deps import require_role
from models import Report, User
from reports_routes import can_view, report_query, to_out
from schemas import CamelModel, ReportOut

router = APIRouter(prefix="/api/reports", tags=["officer review"])


class ReviewRequest(CamelModel):
    status: str = Field(pattern="^(verified|rejected|needs_photo)$")
    confirmed_disease: str | None = Field(default=None, max_length=120)
    officer_advice: str | None = None


@router.patch("/{report_id}/review", response_model=ReportOut)
def review_report(
    report_id: uuid.UUID,
    data: ReviewRequest,
    user: User = Depends(require_role("officer", "admin")),
    db: Session = Depends(get_db),
):
    """The officer's decision. The AI's prediction is never overwritten; the decision is stored beside it."""
    row = db.execute(report_query().where(Report.id == report_id)).first()
    if row is None or not can_view(user, row[0]):
        raise HTTPException(status_code=404, detail="Report not found")
    report, lat, lng = row

    confirmed = (data.confirmed_disease or "").strip() or None
    advice = (data.officer_advice or "").strip() or None

    if data.status == "verified":
        confirmed = confirmed or report.predicted_disease  # officer agrees with the AI
        if not confirmed:
            raise HTTPException(status_code=422, detail="Say which disease you confirmed (confirmedDisease)")
    elif data.status == "needs_photo" and not advice:
        raise HTTPException(status_code=422, detail="Tell the farmer what photo you need (officerAdvice)")

    report.status = data.status
    report.confirmed_disease = confirmed if data.status == "verified" else None
    report.officer_advice = advice
    report.reviewed_by = user.id
    report.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)

    if data.status == "verified":
        try:
            update_cluster(report, db)
        except Exception:
            pass  # cluster update failure must never break the review response

    return to_out(report, lat, lng)
