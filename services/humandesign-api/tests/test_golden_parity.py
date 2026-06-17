from humandesign.features.core import calc_single_hd_features


AUTHORITY_NAMES = {
    "SP": "Emotional",
    "SL": "Sacral",
    "SN": "Splenic",
    "HT": "Ego-Manifested",
    "GC": "Self-Projected",
    "HT_GC": "Ego-Projected",
    "outer": "No Inner",
    "lunar": "Lunar",
}


GOLDEN_SAMPLES = {
    "Widhi": {
        "timestamp": (1985, 5, 3, 23, 45, 0, 7.0),
        "type": "Manifesting Generator",
        "authority": "Sacral",
        "profile": (6, 3),
        "personality_sun": (24, 6),
        "design_sun": (13, 3),
        "cross": ((24, 44), (13, 7)),
    },
    "Ning": {
        "timestamp": (1993, 10, 10, 4, 0, 0, 7.0),
        "type": "Manifesting Generator",
        "authority": "Sacral",
        "profile": (2, 4),
        "personality_sun": (57, 2),
        "design_sun": (53, 4),
        "cross": ((57, 51), (53, 54)),
    },
    "Widya": {
        "timestamp": (1987, 6, 9, 9, 0, 0, 7.0),
        "type": "Manifestor",
        "authority": "Emotional",
        "profile": (1, 3),
        "personality_sun": (45, 1),
        "design_sun": (22, 3),
        "cross": ((45, 26), (22, 47)),
    },
    "Amartya": {
        "timestamp": (2012, 6, 16, 13, 24, 0, 7.0),
        "type": "Manifesting Generator",
        "authority": "Sacral",
        "profile": (4, 6),
        "personality_sun": (12, 4),
        "design_sun": (36, 6),
        "cross": ((12, 11), (36, 6)),
    },
    "Eva Syana": {
        "timestamp": (1990, 9, 10, 0, 0, 0, 7.0),
        "type": "Projector",
    },
}


def _sun_gate_line(date_to_gate_dict, index):
    return date_to_gate_dict["gate"][index], date_to_gate_dict["line"][index]


def _authority_name(authority):
    return AUTHORITY_NAMES.get(authority, authority)


def test_human_design_golden_parity_samples():
    for name, expected in GOLDEN_SAMPLES.items():
        result = calc_single_hd_features(expected["timestamp"], report=False)
        energy_type = result[0]
        authority = result[1]
        incarnation_cross = result[2]
        profile = result[4]
        date_to_gate = result[6]
        design_start_index = len(date_to_gate["gate"]) // 2

        assert energy_type == expected["type"], name

        if "authority" in expected:
            assert _authority_name(authority) == expected["authority"], name
        if "profile" in expected:
            assert profile == expected["profile"], name
        if "personality_sun" in expected:
            assert _sun_gate_line(date_to_gate, 0) == expected["personality_sun"], name
        if "design_sun" in expected:
            assert _sun_gate_line(date_to_gate, design_start_index) == expected["design_sun"], name
        if "cross" in expected:
            expected_cross_prefix = f"{expected['cross']}-"
            assert incarnation_cross.startswith(expected_cross_prefix), name
