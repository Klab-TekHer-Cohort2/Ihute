# IHUTE RAG service: API contract (v1.0)

The RAG service runs in Colab (`rag/src/api.py`, notebook Section 20) and is reached
through a public Cloudflare URL such as `https://xxxx.trycloudflare.com`.
The URL changes every time Section 20.2 runs, so keep it in a setting (`IHUTE_RAG_URL`).

**Timeouts:** a live answer takes 10-60 s on a T4 GPU (longer with Kinyarwanda
translation). Use a timeout of at least **120 s**. Cached answers return in about a second.

**Auth:** if the Colab Secret `IHUTE_API_KEY` is set, send it as header `X-API-Key`.
`/health` is always open.

## `GET /health`

```json
{"status": "ready", "api_version": "1.0", "mode": "live", "error": null,
 "graph_connected": false, "rw_answer_mode": "machine_translation",
 "demo_cache_answers": 10, "demo_cache_file": "..."}
```

`status` is `loading`, `ready`, `failed` or `cache_only`. While `loading` or `failed`,
only questions with a saved answer work.

## `POST /ask`

Request (send `question`, `disease_label`, or both):

| Field | Type | Notes |
|---|---|---|
| `question` | string, max 1000 | Farmer question in English or Kinyarwanda |
| `reply_language` | `"en"` \| `"rw"` \| omitted | Omitted: same language as the question |
| `disease_label` | string | Image-classifier label, e.g. `Cassava___Mosaic_Disease`, `CMD`, `Potato___Late_blight` |
| `confidence` | number 0-1 | Classifier confidence. Below 0.6: general advice for the crop and `diagnosis_uncertain: true` |
| `crop` | string | `maize`, `beans`, `cassava`, `irish_potatoes`. Only needed when the label has no crop name |

When `disease_label` is sent, IHUTE builds the question from the label. A farmer
`question` sent with it only decides the reply language (unless `reply_language` is set).

Response `200`:

```json
{
  "question_used": "What is cassava mosaic disease, what are its symptoms, and how do I control it?",
  "user_question": null,
  "answer": "[Machine translation from English - draft, not yet reviewed by a Kinyarwanda speaker]\n\n...\n\nInkomoko:\n[S1] cassava.pdf, p. 125 (cassava)",
  "answer_en": "Cassava mosaic disease causes ... [S1]",
  "answer_mode": "machine_translation",
  "machine_translated": true,
  "translation_model": "mbazaNLP/Nllb_finetuned_general_en_kin",
  "language": "en",
  "reply_language": "rw",
  "crop": "cassava",
  "intent": "symptoms",
  "route": "vector",
  "sufficient": true,
  "sources": [{"ref": "S1", "document": "cassava.pdf", "page": 125, "crop": "cassava"}],
  "classifier": {"label": "Cassava___Mosaic_Disease", "confidence": 0.91, "question": "...",
                 "crop": "cassava", "disease": "cassava mosaic disease",
                 "diagnosis_uncertain": false, "note": ""},
  "trace": ["language=en reply=rw", "..."],
  "served_from": "live",
  "seconds": 23.4
}
```

- `answer` is ready to display (keep line breaks; it already ends with the source list).
- `answer_mode`: `english`, `english_notice` (Kinyarwanda question, English answer with a
  Kinyarwanda notice), `machine_translation` (unreviewed draft: show `answer_en` too, e.g.
  as "Show English"), or `fixed_message` (not enough information / no reliable answer).
- `sufficient: false` means IHUTE refused (crop not covered, or not enough evidence).
- `served_from`: `live` or `cache` (saved answer from an earlier run).

Errors: `401` wrong/missing `X-API-Key`; `422` invalid request; `503` model not available
and no saved answer for this question (`detail` explains why).

## Calling it from the FastAPI backend

```python
import os
import httpx
from fastapi import HTTPException

IHUTE_RAG_URL = os.environ["IHUTE_RAG_URL"]           # the trycloudflare.com URL
IHUTE_API_KEY = os.getenv("IHUTE_API_KEY", "")


async def ask_ihute(question=None, disease_label=None, confidence=None, reply_language=None):
    payload = {k: v for k, v in {"question": question, "disease_label": disease_label,
                                 "confidence": confidence, "reply_language": reply_language}.items()
               if v is not None}
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(f"{IHUTE_RAG_URL}/ask", json=payload,
                                  headers={"X-API-Key": IHUTE_API_KEY})
    except httpx.HTTPError:
        raise HTTPException(502, "The IHUTE assistant cannot be reached right now.")
    if r.status_code == 503:
        raise HTTPException(503, "The IHUTE assistant is starting up. Please try again in a minute.")
    r.raise_for_status()
    return r.json()
```

Classifier flow: after the image model predicts, call
`ask_ihute(disease_label=label, confidence=score, reply_language=user_language)`.
