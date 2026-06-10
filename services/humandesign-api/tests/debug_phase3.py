from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token
import json

app.dependency_overrides[verify_token] = lambda: True
client = TestClient(app)

PAYLOAD = {
    "year": 2024,
    "month": 1,
    "day": 1,
    "hour": 12,
    "minute": 0,
    "place": "London, UK"
}

try:
    print("Sending payload to /v2/calculate...")
    response = client.post("/v2/calculate", json=PAYLOAD)
    print(f"Status: {response.status_code}")
    if response.status_code != 200:
        print("Response Body (Error Details):")
        print(response.text)
    else:
        print("Success!")
        print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Exception: {type(e).__name__}: {e}")
