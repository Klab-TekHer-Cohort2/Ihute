import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from auth_routes import normalize_email, normalize_phone
from database import get_db
from deps import require_role
from models import User
from schemas import CreateOfficerRequest, UserOut
from security import hash_password

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/users", response_model=UserOut, status_code=201)
def create_user(
    data: CreateOfficerRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    """Admin creates an officer or another admin account."""
    if not data.phone and not data.email:
        raise HTTPException(status_code=422, detail="Provide a phone number or an email")

    phone = normalize_phone(data.phone) if data.phone else None
    email = normalize_email(data.email) if data.email else None

    checks = []
    if phone:
        checks.append(User.phone == phone)
    if email:
        checks.append(User.email == email)
    if db.scalar(select(User).where(or_(*checks))):
        raise HTTPException(status_code=409, detail="An account with this phone or email already exists")

    user = User(
        full_name=data.full_name.strip(),
        phone=phone,
        email=email,
        password_hash=hash_password(data.password),
        role=data.role,
        district=data.district.strip(),
        sector=data.sector.strip() if data.sector else None,
        preferred_language=data.preferred_language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.get("/users", response_model=list[UserOut])
def list_users(
    role: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    users = db.scalars(query.order_by(User.created_at.desc()).limit(500)).all()
    return [UserOut.model_validate(u) for u in users]


@router.patch("/users/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin")),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
    user.active = False
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)


@router.patch("/users/{user_id}/activate", response_model=UserOut)
def activate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.active = True
    db.commit()
    db.refresh(user)
    return UserOut.model_validate(user)
