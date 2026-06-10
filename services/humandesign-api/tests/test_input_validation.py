from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token
import pytest

client = TestClient(app)

# Bypass Auth
def override_verify_token():
    return True

app.dependency_overrides[verify_token] = override_verify_token

def test_maia_penta_invalid_inputs():
    """
    Test Tier 1 10x Strict Validation:
    1. Invalid Latitude (>90)
    2. Invalid Longitude (>180)
    """
    base_payload = {
        "participants": {
            "p1": {"place": "Test", "year": 1980, "month": 1, "day": 1, "hour": 12, "minute": 0}
        },
        "group_type": "family",
        "verbosity": "all"
    }

    # Case 1: Invalid Latitude
    payload_lat = base_payload.copy()
    payload_lat["participants"]["p1"]["latitude"] = 91.0
    
    resp_lat = client.post("/analyze/maia-penta", json=payload_lat)
    assert resp_lat.status_code == 422
    assert "Latitude must be between -90 and 90" in resp_lat.text

    # Case 2: Invalid Longitude
    payload_lon = base_payload.copy()
    payload_lon["participants"]["p1"]["longitude"] = 181.0
    payload_lon["participants"]["p1"]["latitude"] = 0.0 # Reset valid lat
    
    resp_lon = client.post("/analyze/maia-penta", json=payload_lon)
    assert resp_lon.status_code == 422
    assert "Longitude must be between -180 and 180" in resp_lon.text
