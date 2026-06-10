import pytest
from fastapi.testclient import TestClient
from humandesign.api import app
from humandesign.dependencies import verify_token

# Bypass token verification
app.dependency_overrides[verify_token] = lambda: True

client = TestClient(app)

def test_transits_endpoint_integration():
    """
    Comprehensive integration test for /transits/daily.
    Verifies:
    1. Metadata structure (v1.8.1)
    2. Composite features (v1.8.0)
    3. Planetary transits (v1.8.0)
    4. Location-aware logic (v1.9.0)
    """
    params = {
        # Use known birth data (Europe/Istanbul)
        "place": "Europe/Istanbul", "year": 1968, "month": 2, "day": 21, "hour": 11, "minute": 0,
        # Use known transit date
        "transit_year": 2026, "transit_month": 1, "transit_day": 18,
        # v1.9.0 params
        "current_place": "America/New_York", "transit_hour": 12, "transit_minute": 0
    }
    
    response = client.get("/transits/daily", params=params)
    assert response.status_code == 200
    data = response.json()
    
    # --- 1. Top Level Structure ---
    assert "meta" in data
    assert "composite_changes" in data
    assert "planetary_transits" in data
    
    # --- 2. Metadata (v1.8.1 & v1.9.0) ---
    meta = data["meta"]
    # Bio
    assert meta["age"] in [57, 58] # Handle potential current date calculation boundaries
    assert meta["gender"] == "male"
    assert meta["islive"] is True
    # HD Core
    assert meta["energy_type"] == "Manifesting Generator"
    assert "Emotional" in meta["inner_authority"]
    # Locations
    assert "Istanbul" in meta["place"]
    assert "New_York" in meta["calculation_place"] # v1.9.0 check
    # Dates
    assert meta["transit_date_local"] == "2026-01-18 12:00"
    assert "transit_date_utc" in meta
    
    # --- 3. Composite Changes ---
    comp = data["composite_changes"]
    assert isinstance(comp["new_centers"], list)
    assert isinstance(comp["new_channels"], list)
    
    # --- 4. Location Shift Logic (v1.9.0) ---
    # Compare with default (Turkey) at same local time
    params_default = params.copy()
    del params_default["current_place"]
    
    resp_def = client.get("/transits/daily", params=params_default)
    data_def = resp_def.json()
    
    # Different locations -> Different UTC times for "12:00 Local"
    utc_ny = meta["transit_date_utc"]
    utc_def = data_def["meta"]["transit_date_utc"]
    
    assert utc_ny != utc_def, "Location shift should result in different UTC timestamps"

def test_solar_return_endpoint_parity():
    """
    Verify /transits/solar_return has parity with /transits/daily structure.
    """
    # Use explicit params to avoid network calls (default is Kirikkale)
    params = {
        "place": "Europe/Istanbul", "year": 1968, "month": 2, "day": 21, "hour": 11, "minute": 0
    }
    response = client.get("/transits/solar_return", params=params)
    assert response.status_code == 200
    data = response.json()
    
    # 1. Structure Parity
    assert "meta" in data
    assert "composite_changes" in data
    assert "planetary_transits" in data
    
    # 2. Metadata Content
    meta = data["meta"]
    assert meta["energy_type"] == "Manifesting Generator"
    assert "Emotional" in meta["inner_authority"]
    assert "Istanbul" in meta["place"]
    
    # 3. Context
    # With defaults, calculation place is same as birth place
    assert "Istanbul" in meta["calculation_place"]
    # Check zodiac
    assert "Pisces" in meta["zodiac_sign"]
    
    # 4. Solar Return Specifics
    # The endpoint calculates 1968 SR (offset 0). 
    assert "transit_date_utc" in meta
    assert data["planetary_transits"] # Should have planets
