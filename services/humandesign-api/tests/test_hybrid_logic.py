import pytest
from unittest.mock import MagicMock, patch
from humandesign.services.composite import process_hybrid_analysis
from humandesign.schemas.input_models import PersonInput

@pytest.fixture
def sample_participants():
    return {
        "p1": PersonInput(place="London", year=1980, month=1, day=1, hour=12, minute=0),
        "p2": PersonInput(place="New York", year=1985, month=5, day=5, hour=10, minute=30),
        "p3": PersonInput(place="Tokyo", year=1990, month=10, day=10, hour=15, minute=45)
    }

@patch("humandesign.services.composite.process_person_data")
@patch("humandesign.features.get_composite_combinations")
@patch("humandesign.services.composite.get_penta_dynamics")
def test_process_hybrid_analysis_orchestration(mock_penta, mock_combinations, mock_process_person, sample_participants):
    """
    Test that process_hybrid_analysis correctly orchestrates:
    1. Processing person data
    2. Calculating Penta dynamics (if group >= 3)
    3. Calculating Dyad Matrix
    """
    # Mock setups
    mock_process_person.side_effect = lambda name, data: (
        (2000, 1, 1, 12, 0, 0, 0), # Mock timestamp
        {"name": name, "energy_type": "Generator", "defined_centers": [], "profile": "1/3"} # Mock details
    )
    
    # Mock Penta response
    mock_penta.return_value = {
        "active_skills": ["Skill A"],
        "penta_gaps": ["Gap B"],
        "is_functional": True
    }
    
    # Mock Pandas DataFrame for combinations
    mock_combinations.return_value = MagicMock()
    mock_combinations.return_value.to_dict.return_value = [
        {"id": "p1", "other_person": "p2", "new_chakra": [], "chakra_count": 5},
        {"id": "p1", "other_person": "p3", "new_chakra": [], "chakra_count": 6},
        {"id": "p2", "other_person": "p3", "new_chakra": [], "chakra_count": 7},
    ]

    result = process_hybrid_analysis(
        participants=sample_participants,
        group_type="family",
        verbosity="all"
    )

    # Verify generic structure (returned as dict/schema-ready)
    assert "penta_dynamics" in result
    assert "dyad_matrix" in result
    
    # Verify logic flow
    assert mock_process_person.call_count == 3
    assert mock_penta.called
    assert mock_combinations.called
    
    # Check content
    assert result["penta_dynamics"]["active_skills"] == ["Skill A"]
    assert len(result["dyad_matrix"]) == 3

@patch("humandesign.services.composite.process_person_data")
def test_process_hybrid_analysis_insufficient_participants(mock_process_person):
    """Test error handling for < 2 participants."""
    participants = {
        "p1": PersonInput(place="London", year=1980, month=1, day=1, hour=12, minute=0)
    }
    
    with pytest.raises(ValueError) as exc:
        process_hybrid_analysis(participants, "family", "all")
    assert "At least 2 participants" in str(exc.value)
