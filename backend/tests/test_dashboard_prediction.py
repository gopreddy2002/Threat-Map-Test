import datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import main
from models.database import Base, Scan


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


main.app.dependency_overrides[main.get_db] = override_get_db
client = TestClient(main.app)


def clear_scans():
    db = TestingSessionLocal()
    try:
        db.query(Scan).delete()
        db.commit()
    finally:
        db.close()


def add_scan(scan_id: str, indicator: str, indicator_type: str, risk_level: str, risk_score: int):
    db = TestingSessionLocal()
    try:
        db.add(
            Scan(
                id=scan_id,
                indicator=indicator,
                type=indicator_type,
                risk_level=risk_level,
                risk_score=risk_score,
                created_at=datetime.datetime.utcnow(),
            )
        )
        db.commit()
    finally:
        db.close()


def test_attack_prediction_returns_baseline_when_no_telemetry():
    clear_scans()

    response = client.get("/api/v1/dashboard/prediction/")

    assert response.status_code == 200
    payload = response.json()
    assert payload["confidence_level"] == "Low"
    assert payload["estimated_time"] == "Insufficient telemetry"
    assert payload["predicted_attack_type"] == "Credential Stuffing / MFA Bypass"
    assert "No scan history" in payload["explanation"]


def test_attack_prediction_uses_scan_distribution():
    clear_scans()
    add_scan("scan-1", "203.0.113.10", "ip", "CRITICAL", 95)
    add_scan("scan-2", "198.51.100.42", "ip", "HIGH", 80)
    add_scan("scan-3", "example.com", "domain", "LOW", 20)

    response = client.get("/api/v1/dashboard/prediction/")

    assert response.status_code == 200
    payload = response.json()
    assert payload["confidence_level"] == "High"
    assert payload["estimated_time"] == "Next 12-24h"
    assert payload["predicted_attack_type"] == "Command-and-Control Beaconing"
    assert "2 of 3 scans" in payload["explanation"]
