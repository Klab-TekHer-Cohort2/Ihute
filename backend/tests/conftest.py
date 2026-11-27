import io

import pytest
import torch
import torch.nn as nn
from fastapi import FastAPI
from fastapi.testclient import TestClient
from PIL import Image
from torchvision import models

import classifier as clf


@pytest.fixture(scope="session")
def fake_weights(tmp_path_factory):
    """A randomly initialised 7-class EfficientNet-B0 (same shape as the real checkpoint).
    Lets the tests run without the real .pth, which is not stored in Git."""
    torch.manual_seed(0)
    m = models.efficientnet_b0(weights=None)
    m.classifier[1] = nn.Linear(m.classifier[1].in_features, 7)
    path = tmp_path_factory.mktemp("w") / "fake.pth"
    torch.save(m.state_dict(), path)
    return path


@pytest.fixture
def client(fake_weights, monkeypatch):
    monkeypatch.setenv("CLASSIFIER_MODEL_PATH", str(fake_weights))
    monkeypatch.setenv("CLASSIFIER_CONFIDENCE_THRESHOLD", "0")  # random weights -> low confidence
    monkeypatch.setattr(clf, "_classifier", clf.ImageClassifier())
    import predict_routes as predict

    app = FastAPI()
    app.include_router(predict.router)
    return TestClient(app)


def make_image_bytes(fmt="JPEG", size=(300, 200), color=(40, 140, 60)):
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, fmt)
    return buf.getvalue()
