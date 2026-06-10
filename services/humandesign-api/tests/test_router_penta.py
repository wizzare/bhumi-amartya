from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token
import pytest

# Override dependency to bypass auth
app.dependency_overrides[verify_token] = lambda: True

client = TestClient(app)

def test_analyze_penta_endpoint_v2_structure():
    """Verify endpoint is reachable and returns V2 structure."""
    payload = {
        "participants": {
            "person1": {
                "place": "Europe/Berlin",
                "year": 1985,
                "month": 6,
                "day": 15,
                "hour": 14,
                "minute": 30
            },
            "person2": {
                "place": "Europe/Vienna",
                "year": 1988,
                "month": 11,
                "day": 22,
                "hour": 9,
                "minute": 15
            },
            "person3": {
                "place": "Europe/London",
                "year": 1990,
                "month": 12,
                "day": 5,
                "hour": 18,
                "minute": 45
            }
        },
        "group_type": "family"
    }
    
    # This should fail if the router is not implemented/mounted
    response = client.post("/analyze/penta", json=payload)
    
    if response.status_code != 200:
        print(f"Test Failed with status {response.status_code}")
        print(f"Response Body: {response.text}")
        
    assert response.status_code == 200
    data = response.json()
    
    # Validation against Schema
    assert "meta" in data
    assert "penta_anatomy" in data
    assert "upper_penta" in data["penta_anatomy"]
    assert "lower_penta" in data["penta_anatomy"]
    assert "analytical_metrics" in data
