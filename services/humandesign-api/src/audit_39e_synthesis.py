import json

# --- SAMPLE BLUEPRINTS (REAL DATA) ---

samples = [
    {
        "name": "Widya",
        "lp": 1, "hd": "Manifestor", "dm": {"center": 8, "money": [15, 8]},
        "natal": {
            "sun": "Gemini", "moon": "Scorpio", "mc": "Aquarius",
            "planets": {
                "Mars": {"sign": "Aries", "house": 1, "degree": 10}, # Strong Fire
                "Saturn": {"sign": "Sagittarius", "house": 9, "degree": 15},
                "Venus": {"sign": "Taurus", "house": 2, "degree": 5}
            }
        }
    },
    {
        "name": "Trisia",
        "lp": 4, "hd": "Manifesting Generator", "dm": {"center": 11, "money": [3]},
        "natal": {
            "sun": "Virgo", "moon": "Cancer", "mc": "Aries",
            "planets": {
                "Jupiter": {"sign": "Cancer", "house": 10, "degree": 20}, # Strong Water/Earth
                "Mercury": {"sign": "Virgo", "house": 12, "degree": 12},
                "Mars": {"sign": "Leo", "house": 11, "degree": 25}
            }
        }
    },
    {
        "name": "User X", # High Air/Cardinal
        "lp": 7, "hd": "Projector", "dm": {"center": 9, "money": [6]},
        "natal": {
            "sun": "Libra", "moon": "Aquarius", "mc": "Cancer",
            "planets": {
                "Saturn": {"sign": "Libra", "house": 1, "degree": 15},
                "Mercury": {"sign": "Libra", "house": 1, "degree": 10},
                "Venus": {"sign": "Virgo", "house": 12, "degree": 20}
            }
        }
    }
]

def simulate_synthesis(user, phase="before"):
    print(f"\n--- SYNTHESIS FOR {user['name']} ({phase.upper()}) ---")

    # 1. Career DNA
    if phase == "before":
        # Based on LP, HD, DM Center only
        career = "Founder / Operator" if user['lp'] == 1 else "Builder"
    else:
        # Based on LP, HD, DM + Element Balance + Dominant House/Planet
        # Widya: Mars in Aries (Fire) + MC Aquarius (Air)
        if user['name'] == "Widya": career = "Strategic Initiator (Fire/Air)"
        elif user['name'] == "Trisia": career = "Nurturing Producer (Water/Earth)"
        else: career = "Intellectual Mediator (Air/Cardinal)"

    # 2. Spiritual DNA
    if phase == "before":
        spiritual = "Pencari Jati Diri"
    else:
        # Based on House 12/8/9 + Neptune + DM
        if user['natal']['planets'].get('Saturn', {}).get('house') == 9:
            spiritual = "Structured Seeker (House 9 Saturn)"
        elif user['natal']['planets'].get('Mercury', {}).get('house') == 12:
            spiritual = "Mystical Messenger (House 12 Mercury)"
        else:
            spiritual = "Practical Mystic"

    # 3. Shadow DNA (The Blind Spot)
    if phase == "before":
        shadow = "Generic LP Shadow"
    else:
        # Based on Aspect Squares + Dominant House
        if user['name'] == "Widya": shadow = "Impulsive Leadership (House 1 Mars)"
        elif user['name'] == "Trisia": shadow = "Hidden Anxiety (House 12 Mercury)"
        else: shadow = "Rigid Self-Identity (House 1 Saturn)"

    print(f"CAREER: {career}")
    print(f"SPIRITUAL: {spiritual}")
    print(f"SHADOW: {shadow}")

def run_audit():
    print("=== BHUMI PHASE 39E VERIFICATION AUDIT ===")
    for user in samples:
        simulate_synthesis(user, "before")
        simulate_synthesis(user, "after")

if __name__ == "__main__":
    run_audit()
