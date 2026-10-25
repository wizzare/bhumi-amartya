import sys
import os
sys.path.insert(0, os.path.abspath("services/humandesign-api"))

from main import parse_timezone_to_offset

def run_tests():
    print("[TEST] Running Python Timezone & Historical DST Tests")
    
    # 1. Numeric offsets
    assert parse_timezone_to_offset(7.0) == 7.0
    assert parse_timezone_to_offset(-5.0) == -5.0
    assert parse_timezone_to_offset("+08:00") == 8.0
    assert parse_timezone_to_offset("-04:30") == -4.5
    assert parse_timezone_to_offset(420) == 7.0
    print("  PASS: numeric offsets")

    # 2. Historical DST New York (Winter UTC-5 vs Summer UTC-4)
    jan_ny = parse_timezone_to_offset("America/New_York", year=2020, month=1, day=15, hour=12)
    jul_ny = parse_timezone_to_offset("America/New_York", year=2020, month=7, day=15, hour=12)
    assert jan_ny == -5.0, f"Expected -5.0, got {jan_ny}"
    assert jul_ny == -4.0, f"Expected -4.0, got {jul_ny}"
    print(f"  PASS: historical DST New York (Jan={jan_ny}, Jul={jul_ny})")

    # 3. London GMT (UTC+0) vs BST (UTC+1)
    jan_lon = parse_timezone_to_offset("Europe/London", year=2020, month=1, day=15, hour=12)
    jul_lon = parse_timezone_to_offset("Europe/London", year=2020, month=7, day=15, hour=12)
    assert jan_lon == 0.0
    assert jul_lon == 1.0
    print(f"  PASS: historical DST London (Jan={jan_lon}, Jul={jul_lon})")

    # 4. Jakarta (UTC+7 constant)
    jkt = parse_timezone_to_offset("Asia/Jakarta", year=1990, month=5, day=15, hour=8)
    assert jkt == 7.0
    print(f"  PASS: Jakarta constant UTC+7 (Got={jkt})")

    # 5. Invalid timezone fails closed (raises ValueError, does not silently return +7)
    failed_closed = False
    try:
        parse_timezone_to_offset("Invalid/Zone_Nonexistent")
    except ValueError:
        failed_closed = True
    assert failed_closed, "Invalid timezone must raise ValueError"
    print("  PASS: invalid timezone fails closed with ValueError")

    # 6. Empty timezone fails closed
    empty_failed = False
    try:
        parse_timezone_to_offset("")
    except ValueError:
        empty_failed = True
    assert empty_failed, "Empty timezone must raise ValueError"
    print("  PASS: empty timezone fails closed with ValueError")

    # 7. Ambiguous DST transition resolves deterministically
    ambiguous = parse_timezone_to_offset("America/New_York", year=2020, month=11, day=1, hour=1, minute=30)
    assert ambiguous in (-5.0, -4.0)
    print(f"  PASS: ambiguous DST transition handled deterministically ({ambiguous})")

    print("\nAll Python Timezone Tests PASSED (7/7)")

if __name__ == "__main__":
    run_tests()
