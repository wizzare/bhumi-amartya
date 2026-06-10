import os
import json
import pytest
from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token

# Bypass token verification for regression testing
app.dependency_overrides[verify_token] = lambda: True
client = TestClient(app)

SNAPSHOT_DIR = "tests/regression/snapshots/v1"

# Test Data (Person 1)
TEST_PERSON = {
    "year": 1968,
    "month": 2,
    "day": 21,
    "hour": 11,
    "minute": 0,
    "place": "Europe/Istanbul"
}

def test_calculate_v1_regression():
    """Ensure /calculate output matches the V1 baseline snapshot."""
    params = TEST_PERSON.copy()
    params.update({"gender": "male", "islive": True})
    
    response = client.get("/calculate", params=params)
    assert response.status_code == 200
    current_data = response.json()
    
    snapshot_path = os.path.join(SNAPSHOT_DIR, "calculate.json")
    with open(snapshot_path, "r") as f:
        snapshot_data = json.load(f)
    
    # We compare the data structure. Some timestamps might vary by milliseconds, 
    # but the core HD data should be identical.
    # If there are varying fields like "create_date", we might need to mask them.
    assert current_data["general"]["energy_type"] == snapshot_data["general"]["energy_type"]
    assert current_data["general"]["profile"] == snapshot_data["general"]["profile"]
    assert current_data["gates"] == snapshot_data["gates"]
    assert current_data["channels"] == snapshot_data["channels"]

def test_transits_v1_regression():
    """Ensure /transits/daily output matches the V1 baseline snapshot."""
    params = TEST_PERSON.copy()
    params.update({
        "transit_year": 2026,
        "transit_month": 1,
        "transit_day": 18,
        "transit_hour": 12,
        "transit_minute": 0
    })
    
    response = client.get("/transits/daily", params=params)
    assert response.status_code == 200
    current_data = response.json()
    
    snapshot_path = os.path.join(SNAPSHOT_DIR, "transits_daily.json")
    with open(snapshot_path, "r") as f:
        snapshot_data = json.load(f)
    
    assert current_data["meta"]["energy_type"] == snapshot_data["meta"]["energy_type"]
    assert current_data["composite_changes"] == snapshot_data["composite_changes"]
    assert current_data["planetary_transits"] == snapshot_data["planetary_transits"]

def test_bodygraph_v1_regression():
    """Ensure /bodygraph output matches the V1 baseline snapshot (pixel-perfect not guaranteed, but check for extreme variance)."""
    params = TEST_PERSON.copy()
    params.update({"fmt": "png"})
    
    response = client.get("/bodygraph", params=params)
    assert response.status_code == 200
    current_content = response.content
    
    snapshot_path = os.path.join(SNAPSHOT_DIR, "bodygraph.png")
    with open(snapshot_path, "rb") as f:
        snapshot_content = f.read()
    
    # We expect exact match for now as long as we're on the same environment
    assert current_content == snapshot_content
