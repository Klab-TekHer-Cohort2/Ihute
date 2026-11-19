import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

UPLOAD_DIR = Path(__file__).parent / "uploads"
for _sub in ("images", "voice"):
    (UPLOAD_DIR / _sub).mkdir(parents=True, exist_ok=True)

# Farmers' photos and voice notes must never be committed to GitHub.
_guard = UPLOAD_DIR / ".gitignore"
if not _guard.exists():
    _guard.write_text("*\n")

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_AUDIO_BYTES = 10 * 1024 * 1024

AUDIO_TYPES = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/mp4": "m4a",
    "audio/x-m4a": "m4a",
}


def sniff_image(data: bytes) -> str | None:
    """Look at the first bytes of the file, not at what the client claims it is."""
    if data[:3] == b"\xff\xd8\xff":
        return "jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


async def save_image(file: UploadFile) -> str:
    data = await file.read(MAX_IMAGE_BYTES + 1)
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Photo is too large (maximum 5 MB)")
    ext = sniff_image(data)
    if ext is None:
        raise HTTPException(status_code=415, detail="Photo must be a JPEG, PNG or WEBP image")
    name = f"{uuid.uuid4().hex}.{ext}"
    (UPLOAD_DIR / "images" / name).write_bytes(data)
    return f"images/{name}"


async def save_voice(file: UploadFile) -> str:
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    ext = AUDIO_TYPES.get(content_type)
    if ext is None:
        raise HTTPException(status_code=415, detail="Voice note must be webm, ogg, mp3, wav or m4a audio")
    data = await file.read(MAX_AUDIO_BYTES + 1)
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Voice note is too large (maximum 10 MB)")
    if not data:
        raise HTTPException(status_code=400, detail="Voice note is empty")
    name = f"{uuid.uuid4().hex}.{ext}"
    (UPLOAD_DIR / "voice" / name).write_bytes(data)
    return f"voice/{name}"
