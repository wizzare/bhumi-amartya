import sys
import os
from humandesign import features as hd
from humandesign import hd_constants
import json

def run_direct():
    print("=== PYTHON ENGINE FORENSIC (DIRECT MODULE) ===")

    cases = [
        {
            "name": "Widya Amalia",
            "year": 1987, "month": 6, "day": 9, "hour": 9, "minute": 0, "utc_offset": 7
        },
        {
            "name": "Trisia",
            "year": 2002, "month": 9, "day": 17, "hour": 2, "minute": 0, "utc_offset": 8
        }
    ]

    for c in cases:
        print(f"\nTesting: {c['name']}")
        timestamp = (c['year'], c['month'], c['day'], c['hour'], c['minute'], 0, float(c['utc_offset']))

        try:
            result = hd.calc_single_hd_features(timestamp)

            energy_type = result[0]
            authority = result[1]
            profile = tuple(result[4])
            active_chakras = list(result[7])
            active_channels = result[8]

            print(f"PYTHON RESULT for {c['name']}:")
            print(f"- Type:      {energy_type}")
            print(f"- Authority: {authority}")
            print(f"- Profile:   {profile}")
            print(f"- Centers:   {active_chakras}")

            # Print channel labels without json.dumps to avoid ndarray issue
            labels = active_channels.get('label', [])
            print(f"- Channels: {labels}")

        except Exception as e:
            print(f"Calculation failed: {e}")

if __name__ == "__main__":
    run_direct()
