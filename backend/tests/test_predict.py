from pathlib import Path

import pytest
import torch
from PIL import Image
from torchvision import transforms

import classifier as clf
from tests.conftest import make_image_bytes

SAMPLE = Path(__file__).parent / "sample_images" / "sample_leaf.jpg"


def post(client, data, name="leaf.jpg", ctype="image/jpeg"):
    return client.post("/api/v1/predict", files={"image": (name, data, ctype)})


def test_contract_shape_with_sample_image(client):
    r = post(client, SAMPLE.read_bytes())
    assert r.status_code == 200
    body = r.json()
    assert set(body) == {"crop", "prediction", "confidence"}
    assert body["crop"] in {"maize", "potato"}
    assert isinstance(body["prediction"], str) and body["prediction"]
    assert 0 <= body["confidence"] <= 1


def test_png_and_rgba_accepted(client):
    img = Image.new("RGBA", (64, 64), (10, 200, 30, 128))
    import io
    buf = io.BytesIO(); img.save(buf, "PNG")
    assert post(client, buf.getvalue(), "a.png", "image/png").status_code == 200


def test_matches_notebook_preprocessing(client):
    """Service output must equal a manual run of the notebook's val_test_transform."""
    data = SAMPLE.read_bytes()
    r = post(client, data).json()
    c = clf.get_classifier()
    tf = transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor(),
                             transforms.Normalize(clf.IMAGENET_MEAN, clf.IMAGENET_STD)])
    import io
    x = tf(Image.open(io.BytesIO(data)).convert("RGB")).unsqueeze(0)
    with torch.inference_mode():
        p = torch.softmax(c._model(x), 1)[0]
    assert r["confidence"] == pytest.approx(float(p.max()), abs=1e-4)
    assert (r["crop"], r["prediction"]) == c._labels[int(p.argmax())]


def test_low_confidence_is_error_not_diagnosis(client, monkeypatch):
    monkeypatch.setenv("CLASSIFIER_CONFIDENCE_THRESHOLD", "0.99")
    r = post(client, SAMPLE.read_bytes())
    assert r.status_code == 422
    assert r.json()["code"] == "UNCERTAIN_PREDICTION"


def test_not_an_image(client):
    r = post(client, b"this is not an image", "x.jpg")
    assert r.status_code == 400 and r.json()["code"] == "INVALID_IMAGE"


def test_empty_file(client):
    r = post(client, b"")
    assert r.status_code == 400 and r.json()["code"] == "INVALID_IMAGE"


def test_missing_field(client):
    r = client.post("/api/v1/predict", files={"wrong": ("a.jpg", b"x", "image/jpeg")})
    assert r.status_code == 422
    assert set(r.json()) == {"detail", "code"}


def test_too_large(client, monkeypatch):
    monkeypatch.setenv("MAX_UPLOAD_MB", "0.001")
    r = post(client, make_image_bytes(size=(600, 600)))
    assert r.status_code == 413 and r.json()["code"] == "FILE_TOO_LARGE"


def test_model_missing_is_503_and_leaks_nothing(client, monkeypatch):
    monkeypatch.setenv("CLASSIFIER_MODEL_PATH", "/nonexistent/secret/dir/model.pth")
    r = post(client, SAMPLE.read_bytes())
    assert r.status_code == 503 and r.json()["code"] == "MODEL_UNAVAILABLE"
    assert "nonexistent" not in r.text and "Traceback" not in r.text


@pytest.mark.parametrize("raw,expected", [
    ("Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", ("maize", "Cercospora leaf spot Gray leaf spot")),
    ("Corn_(maize)___Common_rust_", ("maize", "Common rust")),
    ("Corn_(maize)___healthy", ("maize", "Healthy")),
    ("Potato___Late_blight", ("potato", "Late blight")),
    ("Potato___healthy", ("potato", "Healthy")),
    ("Maize Streak Virus", ("maize", "Maize Streak Virus")),
])
def test_label_parsing(raw, expected):
    assert clf.parse_label(raw) == expected
