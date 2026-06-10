from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token
import json

app.dependency_overrides[verify_token] = lambda: True
client = TestClient(app)

print("Calling /v2/calculate with empty body...")
response = client.post("/v2/calculate", json={})
data = response.json()
print(f"Birth Date: {data['general']['birth_date']}")
print(f"Sun Gate: {data['gates']['Sun']['gate']}")
print(json.dumps(data['gates']['Sun'], indent=2))
