import os
import json
import pytest
from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token

# Bypass token verification for baseline generation
app.dependency_overrides[verify_token] = lambda: True
client = TestClient(app)

SNAPSHOT_DIR = "tests/regression/snapshots/v1"
os.makedirs(SNAPSHOT_DIR, exist_ok=True)

# Test Data (Person 1)
TEST_PERSON = {
    "year": 1968,
    "month": 2,
    "day": 21,
    "hour": 11,
    "minute": 0,
    "place": "Europe/Istanbul"
}

def generate_calculate_snapshot():
    print("Generating /calculate snapshot...")
    params = TEST_PERSON.copy()
    params.update({"gender": "male", "islive": True})
    response = client.get("/calculate", params=params)
    assert response.status_code == 200
    
    with open(os.path.join(SNAPSHOT_DIR, "calculate.json"), "w") as f:
        json.dump(response.json(), f, indent=2)

def generate_transits_snapshot():
    print("Generating /transits/daily snapshot...")
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
    
    with open(os.path.join(SNAPSHOT_DIR, "transits_daily.json"), "w") as f:
        json.dump(response.json(), f, indent=2)

def generate_bodygraph_snapshot():
    print("Generating /bodygraph snapshot...")
    params = TEST_PERSON.copy()
    params.update({"fmt": "png"})
    response = client.get("/bodygraph", params=params)
    assert response.status_code == 200
    
    with open(os.path.join(SNAPSHOT_DIR, "bodygraph.png"), "wb") as f:
        f.write(response.content)

if __name__ == "__main__":
    generate_calculate_snapshot()
    generate_transits_snapshot()
    generate_bodygraph_snapshot()
    print(f"\n✅ Snapshots generated successfully in {SNAPSHOT_DIR}")
