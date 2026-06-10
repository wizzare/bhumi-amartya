from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token
import pytest

client = TestClient(app)

# Bypass Auth
def override_verify_token():
    return True

app.dependency_overrides[verify_token] = override_verify_token

def test_maia_penta_tier2_mechanics():
    """
    Test Tier 2 10x Improvements:
    1. Variables (PRL/DRR)
    2. Lunar Phase
    3. Global Cycle (Godhead - optional if implemented, focusing on Lunar first)
    """
    payload = {
        "participants": {
            "p1": {"place": "London", "year": 1980, "month": 1, "day": 1, "hour": 12, "minute": 0, "latitude": 51.5074, "longitude": -0.1278},
            "p2": {"place": "New York", "year": 1985, "month": 5, "day": 5, "hour": 10, "minute": 30, "latitude": 40.7128, "longitude": -74.0060}
        },
        "group_type": "family",
        "verbosity": "all"
    }

    response = client.post("/analyze/maia-penta", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    p1 = data["participants"]["p1"]

    # 1. Variables
    assert "variables" in p1
    vars = p1["variables"]
    assert vars is not None
    assert "short_code" in vars
    # Check strict format e.g. "PRL DRR" or "PLR DLR"
    assert "P" in vars["short_code"] and "D" in vars["short_code"]
    
    # 2. Lunar Phase
    assert "lunar_context" in p1
    assert p1["lunar_context"] is not None
    # Expect a string like "Full Moon" or "Waxing Gibbous"
    valid_phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"]
    assert p1["lunar_context"] in valid_phases
