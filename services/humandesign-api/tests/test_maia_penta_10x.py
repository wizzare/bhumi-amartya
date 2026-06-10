from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token
import pytest

client = TestClient(app)

# Bypass Auth
def override_verify_token():
    return True

app.dependency_overrides[verify_token] = override_verify_token

def test_maia_penta_10x_tier1_structure():
    """
    Test Tier 1 10x improvements:
    1. Meta field with Swisseph provenance.
    2. Participants field with full high-fidelity data.
    3. Explicit Degrees (position) in activations.
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

    # 1. Meta Field
    assert "meta" in data
    assert "engine" in data["meta"]
    assert "ephemeris" in data["meta"]
    assert "timestamp" in data["meta"]
    assert "SwissEph" in data["meta"]["ephemeris"]

    # 2. Participants Field
    assert "participants" in data
    assert "p1" in data["participants"]
    
    # 3. Explicit Degrees in Activations
    p1 = data["participants"]["p1"]
    assert "activations" in p1
    sun_activation = p1["activations"].get("Sun")
    assert sun_activation is not None
    assert "position" in sun_activation
    # Check if position is a valid float or formatted string
    # We accept either, but preferably a string for precision or float
    assert isinstance(sun_activation["position"], (float, str)) 

