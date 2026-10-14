import pytest
from fastapi.testclient import TestClient

from app.main import app

BASE = dict(phq1=0, phq2=0, phq3=0, phq4=0, phq5=0, phq6=0, phq7=0, phq8=0, phq9=0,
            age=21, sex="F", semester=5, sleep_hours=7.5, weekly_study_hours=15,
            works_part_time=False, lives_with_family=True)


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"


def test_predict_low_and_high(client):
    low = client.post("/predict", json=BASE).json()
    assert low["risk_level"] == "low"
    assert abs(sum(low["probabilities"].values()) - 1) < 0.01
    high = client.post("/predict", json={**BASE, **{f"phq{i}": 3 for i in range(1, 10)}}).json()
    assert high["risk_level"] == "high"


def test_rejects_out_of_range_item(client):
    assert client.post("/predict", json={**BASE, "phq3": 4}).status_code == 422


def test_rejects_missing_field(client):
    body = {k: v for k, v in BASE.items() if k != "age"}
    assert client.post("/predict", json=body).status_code == 422
