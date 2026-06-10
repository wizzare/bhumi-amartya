from fastapi.testclient import TestClient
import pytest
from humandesign.api import app

client = TestClient(app)

# These endpoints are slated for removal in v3.0.0
DEACTIVATED_ENDPOINTS = [
    "/analyze/compmatrix",
    "/analyze/maiamatrix",
]

# These endpoints must remain active
ACTIVE_ENDPOINTS = [
    "/analyze/composite",
    "/analyze/maia-penta",
]

@pytest.mark.parametrize("endpoint", DEACTIVATED_ENDPOINTS)
def test_deactivated_endpoints_404(endpoint):
    # We expect 404 for these endpoints in v3.0.0
    response = client.post(endpoint, json={})
    assert response.status_code == 404, f"Endpoint {endpoint} should be deactivated (404)"

def test_active_endpoints_remain(endpoint="/analyze/composite"):
    # This is just a sanity check that the router still exists
    # We expect a 422 (Unprocessable Entity) or 401 (Unauthorized) 
    # but NOT a 404 (Not Found)
    response = client.post(endpoint, json={})
    assert response.status_code != 404, f"Active endpoint {endpoint} should NOT returned 404"
