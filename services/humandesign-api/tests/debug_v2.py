from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token
import json

app.dependency_overrides[verify_token] = lambda: True
client = TestClient(app)

TEST_BODY = {
    "year": 1968,
    "month": 2,
    "day": 21,
    "hour": 11,
    "minute": 0,
    "place": "Europe/Istanbul",
    "gender": "male"
}

try:
    print("Calling /v2/calculate...")
    response = client.post("/v2/calculate", json=TEST_BODY)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Caught Exception: {type(e).__name__}")
    print(str(e))
