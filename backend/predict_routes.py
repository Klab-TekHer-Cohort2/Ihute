"""POST /api/v1/predict (Image classifier). Register in main.py: app.include_router(predict_routes.router)"""
import logging

from fastapi import APIRouter, File, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse

from pydantic import BaseModel, Field

from classifier import ClassifierError, get_classifier, max_upload_bytes

logger = logging.getLogger("ihute.predict")


class PredictResponse(BaseModel):
    crop: str = Field(..., examples=["maize"])
    prediction: str = Field(..., examples=["Common rust"])
    confidence: float = Field(..., ge=0.0, le=1.0, examples=[0.92])


class ErrorResponse(BaseModel):
    detail: str
    code: str

router = APIRouter(prefix="/api/v1", tags=["predict"])


def _error(status: int, code: str, detail: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"detail": detail, "code": code})


@router.post(
    "/predict",
    response_model=PredictResponse,
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
async def predict(image: UploadFile | None = File(default=None)):
    if image is None:
        return _error(422, "VALIDATION_ERROR", "Missing required form field 'image'.")

    limit = max_upload_bytes()
    data = await image.read(limit + 1)  # never read more than limit + 1 bytes
    if len(data) > limit:
        return _error(413, "FILE_TOO_LARGE", f"Image is too large (maximum {limit // (1024 * 1024)} MB).")

    try:
        return await run_in_threadpool(get_classifier().predict, data)
    except ClassifierError as exc:
        return _error(exc.status_code, exc.code, exc.detail)
    except Exception:
        logger.exception("Unexpected error during prediction")
        return _error(500, "INTERNAL_ERROR", "Something went wrong while analysing the image.")
