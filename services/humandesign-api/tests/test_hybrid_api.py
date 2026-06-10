from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token
import pytest

client = TestClient(app)

# Bypass Auth
def override_verify_token():
    return True

app.dependency_overrides[verify_token] = override_verify_token

def test_hybrid_analysis_endpoint_valid():
    """Test successful POST /analyze/maia-penta."""
    payload = {
        "participants": {
            "p1": {"place": "London", "year": 1980, "month": 1, "day": 1, "hour": 12, "minute": 0, "latitude": 51.5074, "longitude": -0.1278},
            "p2": {"place": "New York", "year": 1985, "month": 5, "day": 5, "hour": 10, "minute": 30, "latitude": 40.7128, "longitude": -74.0060},
             # Include a 3rd to trigger Penta
            "p3": {"place": "Tokyo", "year": 1990, "month": 10, "day": 10, "hour": 15, "minute": 45, "latitude": 35.6895, "longitude": 139.6917}
        },
        "group_type": "family",
        "verbosity": "all"
    }

    # We expect this to fail initially (404 Not Found) because endpoint isn't registered
    response = client.post("/analyze/maia-penta", json=payload)
    
    # In Red phase, we expect 404. Once implemented, 200.
    # But strictly speaking, a "failing test" for TDD means asserting 200 and failing.
    assert response.status_code == 200
    data = response.json()
    assert "penta_dynamics" in data
    assert "dyad_matrix" in data
    assert len(data["dyad_matrix"]) == 3

def test_hybrid_analysis_endpoint_validation_error():
    """Test validation failure (e.g. missing participants)."""
    payload = {
        "participants": {
            "p1": {"place": "London", "year": 1980, "month": 1, "day": 1, "hour": 12, "minute": 0}
        }
    }
    # Should fail due to <2 participants check in service
    response = client.post("/analyze/maia-penta", json=payload)
    # Service raises ValueError, Router should catch or bubble as 500/400.
    # If implemented correctly, router catches ValueError or lets it bubble.
    # For now, we assume we will handle it.
    assert response.status_code in [400, 422, 500] 
