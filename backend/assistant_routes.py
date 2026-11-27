"""Agricultural assistant: proxies the IHUTE RAG service so the frontend never calls Colab directly.

No login required for now: the frontend sign-in is still demo-only (no backend token).
"""
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ihute_client import ask_ihute, ihute_health

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

Lang = Literal["en", "rw"]

# Our crop keys -> IHUTE crop names (only used when the label has no crop name in it)
IHUTE_CROPS = {"maize": "maize", "beans": "beans", "cassava": "cassava", "potato": "irish_potatoes"}


class AskIn(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    reply_language: Lang | None = None


class DiagnoseIn(BaseModel):
    disease_label: str = Field(min_length=1, max_length=200)
    confidence: float | None = Field(None, ge=0, le=1)
    reply_language: Lang | None = None
    crop: str | None = None  # maize | beans | cassava | potato


class AssistantOut(BaseModel):
    answer: str
    answer_en: str | None = None
    answer_mode: str | None = None
    machine_translated: bool = False
    sources: list[dict] = []
    sufficient: bool | None = None
    served_from: str | None = None
    classifier: dict | None = None
    question_used: str | None = None
    seconds: float | None = None


def to_out(data: dict) -> AssistantOut:
    return AssistantOut(**{k: data.get(k) for k in AssistantOut.model_fields if data.get(k) is not None})


@router.post("/ask", response_model=AssistantOut)
async def ask(body: AskIn):
    data = await ask_ihute(question=body.question.strip(), reply_language=body.reply_language)
    return to_out(data)


@router.post("/diagnose", response_model=AssistantOut)
async def diagnose(body: DiagnoseIn):
    """Called after the image classifier predicts: IHUTE builds the question from the label."""
    crop = IHUTE_CROPS.get((body.crop or "").strip().lower())
    data = await ask_ihute(disease_label=body.disease_label.strip(), confidence=body.confidence,
                           reply_language=body.reply_language, crop=crop)
    return to_out(data)


@router.get("/health")
async def health():
    """Proxies IHUTE /health. status: loading | ready | failed | cache_only."""
    data = await ihute_health()
    return {k: data.get(k) for k in ("status", "mode", "rw_answer_mode", "demo_cache_answers", "error")}
