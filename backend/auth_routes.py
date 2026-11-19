import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user
from models import User
from schemas import AuthResponse, LoginRequest, RegisterRequest, UserOut
from security import create_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

PHONE_RE = re.compile(r"(\+?250|0)7[2389]\d{7}")
EMAIL_RE = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]{2,}")


def normalize_phone(value: str) -> str:
    """07XXXXXXXX or +2507XXXXXXXX -> +2507XXXXXXXX"""
    compact = re.sub(r"[\s-]", "", value)
    if not PHONE_RE.fullmatch(compact):
        raise HTTPException(status_code=422, detail="Invalid Rwandan phone number")
    return "+250" + compact[-9:]


def normalize_email(value: str) -> str:
    email = value.strip().lower()
    if not EMAIL_RE.fullmatch(email):
        raise HTTPException(status_code=422, detail="Invalid email address")
    return email


def auth_response(user: User) -> AuthResponse:
    return AuthResponse(user=UserOut.model_validate(user), token=create_token(str(user.id), user.role))


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Self-registration always creates a FARMER. Officers and admins are created by an admin."""
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
        role="farmer",
        district=data.district.strip(),
        sector=data.sector.strip(),
        preferred_language=data.preferred_language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return auth_response(user)


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    identifier = data.identifier.strip()
    user = None
    if "@" in identifier:
        user = db.scalar(select(User).where(User.email == identifier.lower()))
    else:
        try:
            user = db.scalar(select(User).where(User.phone == normalize_phone(identifier)))
        except HTTPException:
            user = None

    # Same message for "no such user" and "wrong password", so nobody can probe which accounts exist.
    if user is None or not user.active or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid phone/email or password")
    return auth_response(user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
