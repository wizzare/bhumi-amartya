import json
import requests
import sys

URL = "http://localhost:8000/calculate"

def run_test():
    try:
        with open("test_cases.json", "r") as f:
            cases = json.load(f)
    except Exception as e:
        print(f"Error loading test cases: {e}")
        return

    print("--- HUMAN DESIGN FORENSIC TEST ---")

    for case in cases:
        print(f"\nTesting: {case['name']}")
        payload = {
            "name": case['input']['fullName'],
            "year": int(case['input']['birthDate'].split("-")[0]),
            "month": int(case['input']['birthDate'].split("-")[1]),
            "day": int(case['input']['birthDate'].split("-")[2]),
            "hour": int(case['input']['birthTime'].split(":")[0]),
            "minute": int(case['input']['birthTime'].split(":")[1]),
            "second": 0,
            "utc_offset": case['input']['utc_offset']
        }

        print(f"Payload: {json.dumps(payload)}")

        try:
            response = requests.post(URL, json=payload)
            if response.status_code != 200:
                print(f"API Error: {response.status_code}")
                continue

            res = response.json()
            # print(f"Raw Response: {json.dumps(res, indent=2)}")

            print(f"RESULTS for {case['name']}:")

            actual_type = res.get('general', {}).get('energy_type')
            actual_auth = res.get('general', {}).get('inner_authority')
            actual_prof = res.get('general', {}).get('profile')

            print(f"- Type:      {actual_type} (Expected: {case['expected'].get('type')})")
            print(f"- Authority: {actual_auth} (Expected: {case['expected'].get('authority')})")
            if 'profile' in case['expected']:
                print(f"- Profile:   {actual_prof} (Expected: {case['expected'].get('profile')})")

            # Check for specific mismatch indicators
            if case['name'] == "Widya Amalia":
                if actual_type == "Projector":
                    print("!!! DETECTED BUG: Manifestor misidentified as Projector")
                    # Audit centers
                    defined = res.get('centers', {}).get('defined', [])
                    print(f"Defined Centers: {defined}")
                    if "SL" in defined:
                         print("DEBUG: Sacral (SL) is defined? Should NOT be for Manifestor.")

            if case['name'] == "Trisia":
                if actual_type == "Generator":
                    print("!!! DETECTED BUG: MG misidentified as Generator")
                    # Audit throat connection
                    defined = res.get('centers', {}).get('defined', [])
                    print(f"Defined Centers: {defined}")

        except Exception as e:
            print(f"Request failed: {e}")

if __name__ == "__main__":
    run_test()
