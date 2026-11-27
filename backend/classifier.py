"""Image classifier service (Image classifier).

Loads the EfficientNet-B0 plant-disease model trained in the IHUTE notebook and
runs inference on uploaded images. Preprocessing is identical to the notebook's
``val_test_transform``: Resize((224, 224)) -> ToTensor -> ImageNet Normalize.

Configuration (environment variables, see .env.example):
    CLASSIFIER_MODEL_PATH           path to the .pth state_dict
    CLASSIFIER_CLASS_MAPPING_PATH   path to class_mapping.json ({"0": "<label>", ...})
    CLASSIFIER_CONFIDENCE_THRESHOLD predictions below this are reported as uncertain
    MAX_UPLOAD_MB                   maximum accepted upload size

The number of output classes is taken from the mapping file, so swapping in the
future 9-class model only needs a new .pth + mapping, not a code change.
"""
from __future__ import annotations

import io
import json
import logging
import os
import threading
from pathlib import Path

from PIL import Image, UnidentifiedImageError

logger = logging.getLogger("ihute.classifier")

_BACKEND_DIR = Path(__file__).resolve().parent

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


class ClassifierError(Exception):
    """An error that is safe to show to the frontend (no paths / stack traces)."""

    def __init__(self, status_code: int, code: str, detail: str):
        super().__init__(detail)
        self.status_code = status_code
        self.code = code
        self.detail = detail


# --------------------------------------------------------------------------- config
def _model_path() -> Path:
    return Path(os.getenv("CLASSIFIER_MODEL_PATH", _BACKEND_DIR / "models" / "efficientnet_b0_best.pth"))


def _mapping_path() -> Path:
    return Path(os.getenv("CLASSIFIER_CLASS_MAPPING_PATH", _BACKEND_DIR / "class_mapping.json"))


def confidence_threshold() -> float:
    return float(os.getenv("CLASSIFIER_CONFIDENCE_THRESHOLD", "0.6"))


def max_upload_bytes() -> int:
    return int(float(os.getenv("MAX_UPLOAD_MB", "5")) * 1024 * 1024)


# ------------------------------------------------------------------ label handling
def parse_label(raw: str) -> tuple[str, str]:
    """Turn a notebook class name into (crop, human-readable prediction).

    "Corn_(maize)___Common_rust_"  -> ("maize", "Common rust")
    "Potato___healthy"             -> ("potato", "Healthy")
    "Maize Streak Virus"           -> ("maize", "Maize Streak Virus")
    """
    if "___" in raw:
        crop_part, disease_part = raw.split("___", 1)
        crop_part = crop_part.lower()
        crop = "maize" if ("maize" in crop_part or "corn" in crop_part) else crop_part.replace("_", " ").strip()
        disease = " ".join(disease_part.replace("_", " ").split())
        if disease.lower() == "healthy":
            disease = "Healthy"
        return crop, disease
    crop = "maize" if "maize" in raw.lower() else "unknown"
    return crop, " ".join(raw.replace("_", " ").split())


# ------------------------------------------------------------------------ service
class ImageClassifier:
    def __init__(self) -> None:
        self._model = None
        self._labels: list[tuple[str, str]] = []
        self._transform = None
        self._lock = threading.Lock()

    @property
    def loaded(self) -> bool:
        return self._model is not None

    def load(self) -> None:
        """Load weights + class mapping once. Raises ClassifierError(503) on failure."""
        if self.loaded:
            return
        with self._lock:
            if self.loaded:
                return
            try:
                import torch
                import torch.nn as nn
                from torchvision import models, transforms

                mapping_file, weights_file = _mapping_path(), _model_path()
                with open(mapping_file, "r", encoding="utf-8") as fh:
                    mapping = json.load(fh)
                labels = [parse_label(mapping[str(i)]) for i in range(len(mapping))]

                model = models.efficientnet_b0(weights=None)  # no download; we load our own weights
                model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(labels))
                state = torch.load(weights_file, map_location="cpu", weights_only=True)
                model.load_state_dict(state)
                model.eval()

                self._transform = transforms.Compose(
                    [
                        transforms.Resize((224, 224)),
                        transforms.ToTensor(),
                        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
                    ]
                )
                self._labels, self._model = labels, model
                logger.info("Classifier loaded (%d classes) from %s", len(labels), weights_file)
            except Exception:
                # Full details go to the server log only; the client gets a safe message.
                logger.exception("Could not load the image classifier")
                raise ClassifierError(
                    503, "MODEL_UNAVAILABLE", "The image model is not available right now. Please try again later."
                ) from None

    def predict(self, image_bytes: bytes) -> dict:
        """Return {"crop", "prediction", "confidence"} for one image's raw bytes."""
        image = self._decode(image_bytes)
        self.load()
        import torch

        tensor = self._transform(image).unsqueeze(0)
        with torch.inference_mode():
            probs = torch.softmax(self._model(tensor), dim=1)[0]
        confidence, index = probs.max(dim=0)
        confidence = float(confidence)

        if confidence < confidence_threshold():
            raise ClassifierError(
                422,
                "UNCERTAIN_PREDICTION",
                "The model could not identify this image with enough confidence. "
                "Please upload a clear, close-up photo of a single maize or potato leaf.",
            )
        crop, disease = self._labels[int(index)]
        return {"crop": crop, "prediction": disease, "confidence": round(confidence, 4)}

    @staticmethod
    def _decode(image_bytes: bytes) -> Image.Image:
        if not image_bytes:
            raise ClassifierError(400, "INVALID_IMAGE", "The uploaded file is empty.")
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                img.load()
                return img.convert("RGB")
        except (UnidentifiedImageError, OSError, Image.DecompressionBombError, ValueError):
            raise ClassifierError(
                400, "INVALID_IMAGE", "The uploaded file is not a valid image (use JPEG or PNG)."
            ) from None


_classifier = ImageClassifier()


def get_classifier() -> ImageClassifier:
    return _classifier


def preload() -> None:
    """Optional: call from the app startup (lifespan) to load the model before the first request."""
    _classifier.load()
