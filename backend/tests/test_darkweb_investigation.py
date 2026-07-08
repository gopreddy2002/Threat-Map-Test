from fastapi import FastAPI
from fastapi.testclient import TestClient
from routers.osint_extra import router


app = FastAPI()
app.include_router(router, prefix="/api/v1")
client = TestClient(app)


def test_darkweb_investigation_endpoint_returns_structured_report():
    response = client.post(
        "/api/v1/osint/darkweb/investigate",
        json={"query": "russian phishing kit", "limit": 3}
    )

    assert response.status_code == 200
    payload = response.json()
    assert "query" in payload
    assert "summary" in payload
    assert "mentions" in payload
    assert isinstance(payload["mentions"], list)
