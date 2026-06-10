from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token
import json

app.dependency_overrides[verify_token] = lambda: True
client = TestClient(app)

PAYLOAD = {
  "year": 1968,
  "month": 2,
  "day": 21,
  "hour": 11,
  "minute": 0,
  "second": 0,
  "place": "Kirikkale, Turkey",
  "gender": "male",
  "islive": True,
  "latitude": 0,
  "longitude": 0,
  "include": [
    "string"
  ],
  "exclude": [
    "string"
  ]
}

try:
    print("Sending payload to /v2/calculate...")
    response = client.post("/v2/post-calculate", json=PAYLOAD) # Wait, is it /v2/calculate or /v2/post-calculate? 
    # Checking prev tools... it's /v2/calculate
    response = client.post("/v2/calculate", json=PAYLOAD)
    print(f"Status: {response.status_code}")
    print("Response Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Exception: {type(e).__name__}: {e}")
