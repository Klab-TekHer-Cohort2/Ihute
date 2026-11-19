from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from models import Cluster, Report


# A cluster escalates to level 2 at 5 reports, level 3 at 10
_LEVEL_THRESHOLDS = {2: 5, 3: 10}


def _compute_level(report_count: int) -> int:
    if report_count >= _LEVEL_THRESHOLDS[3]:
        return 3
    if report_count >= _LEVEL_THRESHOLDS[2]:
        return 2
    return 1


def update_cluster(report: Report, db: Session) -> Cluster | None:
    """
    Called after a report is verified by an officer.
    Finds or creates the cluster for (crop, confirmed_disease, district, sector)
    and updates its stats. Returns the cluster.
    """
    if not report.confirmed_disease or not report.district or not report.sector:
        return None

    crop = report.crop.strip().lower()
    disease = report.confirmed_disease.strip().lower()
    district = report.district.strip().lower()
    sector = report.sector.strip().lower()

    cluster = db.scalar(
        select(Cluster).where(
            func.lower(Cluster.crop) == crop,
            func.lower(Cluster.disease) == disease,
            func.lower(Cluster.district) == district,
            func.lower(Cluster.sector) == sector,
        )
    )

    now = datetime.now(timezone.utc)

    if cluster is None:
        cluster = Cluster(
            crop=crop,
            disease=disease,
            district=district,
            sector=sector,
            report_count=0,
            status="pending",
            first_report_at=report.submitted_at or now,
        )
        db.add(cluster)

    cluster.report_count += 1
    cluster.last_report_at = now
    cluster.level = _compute_level(cluster.report_count)

    # Recalculate average confidence from all verified reports in this cluster
    confidences = db.scalars(
        select(Report.confidence).where(
            func.lower(Report.crop) == crop,
            func.lower(Report.confirmed_disease) == disease,
            func.lower(Report.district) == district,
            func.lower(Report.sector) == sector,
            Report.confidence.is_not(None),
        )
    ).all()
    if confidences:
        cluster.average_confidence = sum(confidences) / len(confidences)

    # Link this report to the cluster
    db.flush()  # ensure cluster.id is available
    report.cluster_id = cluster.id

    db.commit()
    db.refresh(cluster)
    return cluster
