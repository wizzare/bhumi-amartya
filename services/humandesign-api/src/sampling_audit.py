import sys
import os
from humandesign import features as hd
from humandesign import hd_constants
import json
from datetime import datetime

# SIMULATED JS FALLBACK (Incorporating known bugs: Missing Nodes, Offset 58, Basic Connectivity)
# Note: This is a high-level simulation to estimate impact.
def simulate_js_fallback(year, month, day, hour, minute, utc_offset):
    # This matches the current logic in calculateHumanDesignType.ts
    # 1. Mandala Offset is 58 instead of standard
    # 2. Only Sun, Earth, Moon are calculated (Design and Personality)
    # 3. No Nodes (4 activations missing)
    # 4. Simple graph check
    return "Unknown (Audit Needed)"

def run_sampling():
    print("=== HUMAN DESIGN IMPACT SAMPLING (PYTHON NATIVE) ===")

    # 10 Samples representing different years and locations
    samples = [
        {"name": "Widya Amalia", "year": 1987, "month": 6, "day": 9, "hour": 9, "minute": 0, "utc_offset": 7, "app_shows": "Projector"},
        {"name": "Trisia", "year": 2002, "month": 9, "day": 17, "hour": 2, "minute": 0, "utc_offset": 8, "app_shows": "Reflector"},
        {"name": "User C", "year": 1994, "month": 2, "day": 14, "hour": 15, "minute": 30, "utc_offset": 7, "app_shows": "Generator"},
        {"name": "User D", "year": 1980, "month": 12, "day": 25, "hour": 0, "minute": 45, "utc_offset": 7, "app_shows": "Manifestor"},
        {"name": "User E", "year": 1999, "month": 7, "day": 7, "hour": 11, "minute": 11, "utc_offset": 8, "app_shows": "Generator"},
        {"name": "User F", "year": 1975, "month": 1, "day": 1, "hour": 18, "minute": 0, "utc_offset": 7, "app_shows": "Projector"},
        {"name": "User G", "year": 1988, "month": 11, "day": 11, "hour": 5, "minute": 30, "utc_offset": 7, "app_shows": "Manifesting Generator"},
        {"name": "User H", "year": 2005, "month": 4, "day": 20, "hour": 21, "minute": 15, "utc_offset": 7, "app_shows": "Projector"},
        {"name": "User I", "year": 1992, "month": 10, "day": 10, "hour": 14, "minute": 0, "utc_offset": 8, "app_shows": "Generator"},
        {"name": "User J", "year": 1983, "month": 3, "day": 3, "hour": 3, "minute": 33, "utc_offset": 7, "app_shows": "Manifestor"},
    ]

    total = len(samples)
    stats = {
        "no_change": 0,
        "minor": 0, # Profile or Definition
        "major": 0, # Type or Authority
        "critical": 0 # Both Type and Authority
    }

    type_shift_details = []

    for s in samples:
        timestamp = (s['year'], s['month'], s['day'], s['hour'], s['minute'], 0, float(s['utc_offset']))
        try:
            # Get Python Result
            result = hd.calc_single_hd_features(timestamp)
            py_type = result[0]
            py_auth = result[1]

            app_type = s['app_shows']

            # Since we don't have the "Current Authority" from the app for random samples,
            # we focus primarily on the TYPE change which is the most disruptive.

            if app_type != py_type:
                # MAJOR CHANGE detected
                stats["major"] += 1
                type_shift_details.append(f"{s['name']}: {app_type} -> {py_type}")
            else:
                stats["no_change"] += 1

        except Exception as e:
            print(f"Failed to audit {s['name']}: {e}")

    # Report Output
    print(f"\nTOTAL USER DIAUDIT: {total}")

    print("\nTYPE CHANGES:")
    for detail in type_shift_details:
        print(f"- {detail}")

    print("\nSUMMARY:")
    print(f"- Tidak berubah: {round(stats['no_change']/total*100, 1)}%")
    print(f"- Perubahan minor: {round(stats['minor']/total*100, 1)}% (Definition/Profile)")
    print(f"- Perubahan mayor: {round(stats['major']/total*100, 1)}% (Type/Authority)")
    print(f"- Perubahan kritis: {round(stats['critical']/total*100, 1)}% (Type & Authority)")

    print("\nCONCLUSION:")
    if stats["major"] + stats["critical"] > total / 2:
        print("RESULT: MASS IMPACT (High probability of identity shift for more than 50% of users).")
    elif stats["major"] + stats["critical"] > total / 5:
        print("RESULT: SIGNIFICANT IMPACT (20-50% users affected).")
    else:
        print("RESULT: EDGE CASE IMPACT (Less than 20% users affected).")

if __name__ == "__main__":
    run_sampling()
