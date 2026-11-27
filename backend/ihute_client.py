"""Small client for the IHUTE RAG service (FastAPI in Colab, reached through a Cloudflare URL).

See docs/IHUTE_RAG_API.md. The URL changes every time Colab restarts, so it lives in .env.
"""
import os

import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

TIMEOUT_SECONDS = 120  # live answers take 10-60 s, longer with Kinyarwanda translation


def _base_url() -> str:
    # Read on every call, so a new Colab URL only needs a .env edit and a backend restart
    url = (os.getenv("IHUTE_RAG_URL") or "").strip().rstrip("/")
    if not url:
        raise HTTPException(503, "The assistant is not configured (IHUTE_RAG_URL is missing).")
    return url


def _headers() -> dict:
    key = (os.getenv("IHUTE_API_KEY") or "").strip()
    return {"X-API-Key": key} if key else {}


async def ask_ihute(question=None, disease_label=None, confidence=None, reply_language=None, crop=None) -> dict:
    payload = {k: v for k, v in {"question": question, "disease_label": disease_label,
                                 "confidence": confidence, "reply_language": reply_language,
                                 "crop": crop}.items()
               if v is not None}
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            r = await client.post(f"{_base_url()}/ask", json=payload, headers=_headers())
    except httpx.HTTPError:
        raise HTTPException(502, "The assistant cannot be reached right now.")
    if r.status_code == 503:
        raise HTTPException(503, "The assistant is starting up, please try again in a minute.")
    if r.status_code == 401:
        raise HTTPException(502, "The assistant rejected our API key (check IHUTE_API_KEY).")
    if r.status_code == 422:
        raise HTTPException(422, "The assistant could not understand this request.")
    if r.status_code >= 400:
        raise HTTPException(502, "The assistant cannot be reached right now.")
    return r.json()


async def ihute_health() -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(f"{_base_url()}/health")
        r.raise_for_status()
        return r.json()
    except (httpx.HTTPError, ValueError):
        raise HTTPException(502, "The assistant cannot be reached right now.")
