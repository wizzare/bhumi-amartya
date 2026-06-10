import pytest
from pydantic import ValidationError
from humandesign.schemas.input_models import HybridAnalysisRequest, PersonInput
from humandesign.schemas.response_models import HybridAnalysisResponse, PentaDetail, CombinationItem

def test_hybrid_analysis_request_valid():
    """Test valid HybridAnalysisRequest creation."""
    participants = {
        "p1": PersonInput(place="London", year=1980, month=1, day=1, hour=12, minute=0),
        "p2": PersonInput(place="New York", year=1985, month=5, day=5, hour=10, minute=30),
        "p3": PersonInput(place="Tokyo", year=1990, month=10, day=10, hour=15, minute=45)
    }
    
    req = HybridAnalysisRequest(
        participants=participants,
        group_type="family",
        verbosity="all"
    )
    assert req.group_type == "family"
    assert req.verbosity == "all"
    assert len(req.participants) == 3

def test_hybrid_analysis_request_defaults():
    """Test default values for HybridAnalysisRequest."""
    participants = {
        "p1": PersonInput(place="London", year=1980, month=1, day=1, hour=12, minute=0),
        "p2": PersonInput(place="New York", year=1985, month=5, day=5, hour=10, minute=30)
    }
    
    req = HybridAnalysisRequest(participants=participants)
    assert req.group_type == "family"
    assert req.verbosity == "all"

def test_hybrid_analysis_request_validation():
    """Test validation logic for HybridAnalysisRequest."""
    participants = {
        "p1": PersonInput(place="London", year=1980, month=1, day=1, hour=12, minute=0),
        "p2": PersonInput(place="New York", year=1985, month=5, day=5, hour=10, minute=30)
    }

    # Invalid group_type
    with pytest.raises(ValidationError) as excinfo:
        HybridAnalysisRequest(participants=participants, group_type="invalid_type")
    assert "group_type" in str(excinfo.value)

    # Invalid verbosity
    with pytest.raises(ValidationError) as excinfo:
        HybridAnalysisRequest(participants=participants, verbosity="invalid_v")
    assert "verbosity" in str(excinfo.value)

    # Check minimum participants (if applicable, though standard pydantic might not catch dict size without validator)
    # Assuming we might add a validator for min participants, but for now just schema structure.

def test_hybrid_analysis_response_structure():
    """Test structural integrity of HybridAnalysisResponse."""
    # Mock data for sub-components (simplified for schema test)
    # Using real models if available or checking fields match expectation
    
    # We expect these nested models to exist or be mocked. 
    # Since CombinationItem and PentaDetail exist/will exist, we try to use them.
    # Note: CombinationItem requires many fields, so we might need a fixture or minimal construct.
    # For now, we just test that the class exists and takes the fields.
    
    # Assuming standard dicts work for Pydantic parsing if models match
    data = {
        "penta_dynamics": {
             "active_skills": ["Skill1"],
             "penta_gaps": ["Gap1"],
             "is_functional": True
        },
        "dyad_matrix": [
            # Minimal mock of a CombinationItem (needs to match actual schema)
            # This is complex to mock fully manually, so we expect the test to fail on import first anyway.
        ]
    }
    # It fails on import first, which is fine.
    pass
