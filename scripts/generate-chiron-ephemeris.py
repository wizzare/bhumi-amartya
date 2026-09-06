#!/usr/bin/env python3
"""
CDI-108-01 — Chiron ephemeris table + reference fixtures generator.

Produces, from the Swiss Ephemeris (pyswisseph + bundled seas_18.se1):

  1. lib/astrology/data/chironEphemeris.json
       A dense sampled table of Chiron's geocentric apparent tropical ecliptic
       longitude (mean equinox of date). The client interpolates this table
       (Catmull-Rom) instead of the old linear approximation. This IS real
       ephemeris data — not a fitted model.

  2. tests/fixtures/build108-cdi01-chiron-reference.json
       Authoritative per-fixture expectations (longitude / sign / degree /
       Placidus house / Whole Sign house / ascendant / midheaven) for the
       deterministic unit test, plus the exact value the OLD linear model
       produced for the same instant.

  3. stdout — the CDI-108-01 fixture comparison report
       (CHIRON_LONGITUDE / SIGN / DEGREE / HOUSE / HOUSE_SYSTEM / EXPECTED /
        ACTUAL(old linear) / ACTUAL(new table) / MATCH).

Read-only w.r.t. production: it only writes repo files. It performs NO network
call and NO Firestore access.

Run:  python scripts/generate-chiron-ephemeris.py
Requires: pyswisseph (installed) + node_modules/swisseph/ephe/seas_18.se1 (present).
"""
from __future__ import annotations
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import swisseph as swe

try:
    from timezonefinder import TimezoneFinder
    _TF = TimezoneFinder()
except Exception:  # pragma: no cover
    _TF = None

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
EPHE = os.path.join(REPO, "node_modules", "swisseph", "ephe")
swe.set_ephe_path(EPHE)

SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]

# J2000.0 = 2000-01-01 12:00 TT ~= JD 2451545.0 (the anchor the OLD TS model used).
J2000_JD = 2451545.0
# OLD production model (lib/astrology/calculateNatalBasics.ts, pre-CDI-108-01):
#   normalizeLongitude(251.35 + days * 0.019777), days = (t - J2000)/86400000
OLD_ANCHOR_DEG = 251.35
OLD_RATE_DEG_PER_DAY = 0.019777

# ---- Table parameters -------------------------------------------------------
TABLE_START = (1900, 1, 1)     # inclusive, 00:00 UT
TABLE_END = (2100, 1, 8)       # generate through here so 2100-01-01 is bracketed
STEP_DAYS = 7                  # Chiron |speed| <= ~0.12 deg/day; 7d + cubic << 0.01 deg

def jd_ut(y, m, d, ut_hour=0.0):
    return swe.julday(y, m, d, ut_hour, swe.GREG_CAL)

def chiron_lon(jd):
    xx, _ = swe.calc_ut(jd, swe.CHIRON, swe.FLG_SWIEPH | swe.FLG_SPEED)
    return xx[0] % 360.0

def sign_of(lon):
    return SIGNS[int((lon % 360.0) // 30)]

def deg_in_sign(lon):
    return (lon % 360.0) % 30.0

def ang_diff(a, b):
    """smallest absolute angular separation, degrees"""
    d = abs((a - b) % 360.0)
    return min(d, 360.0 - d)

# ---- Catmull-Rom interpolation with local unwrap (mirrors the TS impl) ------
def catmull_rom(p0, p1, p2, p3, t):
    t2 = t * t
    t3 = t2 * t
    return 0.5 * ((2 * p1)
                  + (-p0 + p2) * t
                  + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
                  + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)

def unwrap_near(ref, val):
    while val - ref > 180.0:
        val -= 360.0
    while val - ref < -180.0:
        val += 360.0
    return val

def interp_table(samples_md, start_jd, step_days, jd):
    n = len(samples_md)
    x = (jd - start_jd) / step_days
    i = int(x // 1)
    if i < 1 or i > n - 3:
        return None  # fail closed outside safe interpolation range
    frac = x - i
    p1 = samples_md[i] / 1000.0
    p0 = unwrap_near(p1, samples_md[i - 1] / 1000.0)
    p2 = unwrap_near(p1, samples_md[i + 1] / 1000.0)
    p3 = unwrap_near(p1, samples_md[i + 2] / 1000.0)
    return catmull_rom(p0, p1, p2, p3, frac) % 360.0

def old_linear(jd):
    days = jd - J2000_JD
    return (OLD_ANCHOR_DEG + days * OLD_RATE_DEG_PER_DAY) % 360.0

# ---- Build the table ------------------------------------------------------
start_jd = jd_ut(*TABLE_START, 0.0)
end_jd = jd_ut(*TABLE_END, 0.0)
count = int(round((end_jd - start_jd) / STEP_DAYS)) + 1
samples_md = []
for k in range(count):
    jd = start_jd + k * STEP_DAYS
    lon = chiron_lon(jd)
    md = int(round(lon * 1000.0)) % 360000
    samples_md.append(md)

table = {
    "body": "Chiron",
    "frame": "geocentric-apparent-ecliptic-of-date",
    "zodiac": "tropical",
    "unit": "millidegree",
    "source": f"pyswisseph {swe.version} + seas_18.se1 (Swiss Ephemeris)",
    "generatedAtUtc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "startJdUt": start_jd,
    "stepDays": STEP_DAYS,
    "count": count,
    "coverageUtc": ["1900-01-15", "2099-12-25"],  # safe interpolation window (>= i>=1, <= n-3)
    "samples": samples_md,
}

# ---- Validate interpolation accuracy against direct swisseph --------------
worst = 0.0
worst_at = None
checks = 0
d = start_jd + 8 * STEP_DAYS
while d < end_jd - 8 * STEP_DAYS:
    got = interp_table(samples_md, start_jd, STEP_DAYS, d)
    if got is not None:
        exp = chiron_lon(d)
        e = ang_diff(got, exp)
        checks += 1
        if e > worst:
            worst, worst_at = e, d
    d += 1.0  # daily sweep across the whole 200-year span

# ---- Reference fixtures --------------------------------------------------
# (label, year, month, day, hour, minute, lat, lon, place). The IANA timezone
# is derived from the coordinates by timezonefinder at generation time — the
# same deterministic-polygon approach the app uses (tz-lookup) — so a fixture
# can never carry a hand-assigned wrong zone.
FIXTURES = [
    ("hindenburg_era_gemini",   1937,  5, 20,  7, 25,  40.7128,  -74.0060, "New York, USA"),
    ("post_war_aquarius",       1955,  3,  1, 23, 45,  -6.2088,  106.8456, "Jakarta, Indonesia (WIB)"),
    ("hd_snapshot_pisces",      1968,  2, 21,  9,  0,  41.0082,   28.9784, "Istanbul, Turkiye"),
    ("chiron_taurus_retro",     1977, 11, 15,  4, 30, -33.8688,  151.2093, "Sydney, Australia (DST)"),
    ("widhi_case_gemini",       1985,  5,  3, 23, 45,  -6.2088,  106.8456, "Jakarta, Indonesia (WIB)"),
    ("cancer_fast_arc",         1990,  6, 15, 14, 30,  19.0760,   72.8777, "Mumbai, India (+5:30)"),
    ("millennium_sagittarius",  2001,  9, 11,  8, 46,  34.0522, -118.2437, "Los Angeles, USA (PDT)"),
    ("chiron_pisces_station",   2013,  7,  4, 12,  0,  51.5074,   -0.1278, "London, UK (BST)"),
    ("recent_aries",            2024,  1,  1,  0,  1, -36.8485,  174.7633, "Auckland, New Zealand (NZDT)"),
    ("southern_no_dst",         1995,  8,  9, 18, 20,  -8.6500,  115.2167, "Denpasar, Bali, Indonesia (WITA, not WIB)"),
    ("kathmandu_fractional",    1979,  4, 12,  6, 15,  27.7172,   85.3240, "Kathmandu, Nepal (+5:45)"),
    ("indiana_border_zone",     1966, 10,  2,  3, 40,  39.7684,  -86.1581, "Indianapolis, USA (sub-national zone)"),
]

def resolve_tz(lat, lon):
    if _TF is None:
        raise RuntimeError("timezonefinder is required to derive fixture timezones")
    z = _TF.timezone_at(lat=lat, lng=lon)
    if not z:
        raise RuntimeError(f"no timezone for {lat},{lon}")
    return z

def utc_instant(y, m, d, hh, mm, tzname):
    local = datetime(y, m, d, hh, mm, tzinfo=ZoneInfo(tzname))
    u = local.astimezone(timezone.utc)
    off = local.utcoffset().total_seconds() / 3600.0
    return u, off

def placidus_house_of(jd, lat, lon, target_lon):
    cusps, ascmc = swe.houses_ex(jd, lat, lon, b"P")
    # pyswisseph returns cusps as a 12-tuple: cusps[0..11] == house 1..12
    c = [cusps[i] % 360.0 for i in range(12)]
    t = target_lon % 360.0
    for i in range(12):
        a = c[i]
        b = c[(i + 1) % 12]
        if a <= b:
            if a <= t < b:
                return i + 1, c, ascmc[0] % 360.0, ascmc[1] % 360.0
        else:
            if t >= a or t < b:
                return i + 1, c, ascmc[0] % 360.0, ascmc[1] % 360.0
    return None, c, ascmc[0] % 360.0, ascmc[1] % 360.0

ref = {"generatedAtUtc": table["generatedAtUtc"],
       "source": table["source"],
       "oldLinearModel": {"anchorDeg": OLD_ANCHOR_DEG, "rateDegPerDay": OLD_RATE_DEG_PER_DAY, "j2000Jd": J2000_JD},
       "fixtures": []}

rows = []
for (label, y, m, d, hh, mm, lat, lon, place) in FIXTURES:
    tzname = resolve_tz(lat, lon)
    u, off = utc_instant(y, m, d, hh, mm, tzname)
    jd = jd_ut(u.year, u.month, u.day, u.hour + u.minute / 60.0 + u.second / 3600.0)

    exp_lon = chiron_lon(jd)
    exp_sign = sign_of(exp_lon)
    exp_deg = deg_in_sign(exp_lon)

    ph, cusps, asc_lon, mc_lon = placidus_house_of(jd, lat, lon, exp_lon)
    asc_sign = sign_of(asc_lon)
    mc_sign = sign_of(mc_lon)
    asc_idx = SIGNS.index(asc_sign)
    ws_house = ((SIGNS.index(exp_sign) - asc_idx + 12) % 12) + 1

    old_lon = old_linear(jd)
    old_sign = sign_of(old_lon)
    old_deg = deg_in_sign(old_lon)
    old_err = ang_diff(old_lon, exp_lon)

    new_lon = interp_table(samples_md, start_jd, STEP_DAYS, jd)
    new_sign = sign_of(new_lon)
    new_deg = deg_in_sign(new_lon)
    new_err = ang_diff(new_lon, exp_lon)

    ref["fixtures"].append({
        "label": label,
        "birthLocal": f"{y:04d}-{m:02d}-{d:02d}T{hh:02d}:{mm:02d}",
        "timezone": tzname,
        "utcOffsetHours": round(off, 2),
        "birthUtc": u.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "jdUt": jd,
        "latitude": lat,
        "longitude": lon,
        "place": place,
        "expected": {
            "chironLongitude": round(exp_lon, 5),
            "chironSign": exp_sign,
            "chironDegree": round(exp_deg, 4),
            "chironHousePlacidus": ph,
            "chironHouseWholeSign": ws_house,
            "ascendantSign": asc_sign,
            "ascendantLongitude": round(asc_lon, 5),
            "midheavenSign": mc_sign,
            "midheavenLongitude": round(mc_lon, 5),
        },
        "oldLinear": {
            "chironLongitude": round(old_lon, 5),
            "chironSign": old_sign,
            "chironDegree": round(old_deg, 4),
            "errorDegrees": round(old_err, 4),
            "signMatch": old_sign == exp_sign,
        },
        "newTable": {
            "chironLongitude": round(new_lon, 5),
            "chironSign": new_sign,
            "chironDegree": round(new_deg, 4),
            "errorDegrees": round(new_err, 6),
            "signMatch": new_sign == exp_sign,
        },
    })
    rows.append((label, f"{y}-{m:02d}-{d:02d} {hh:02d}:{mm:02d} {tzname}", exp_lon, exp_sign,
                 exp_deg, ph, ws_house, old_sign, old_deg, old_err, new_sign, new_deg, new_err))

# ---- Write artifacts ----------------------------------------------------
tbl_path = os.path.join(REPO, "lib", "astrology", "data", "chironEphemeris.json")
os.makedirs(os.path.dirname(tbl_path), exist_ok=True)
with open(tbl_path, "w", encoding="utf-8", newline="\n") as f:
    json.dump(table, f, separators=(",", ":"))
    f.write("\n")

ref_path = os.path.join(REPO, "tests", "fixtures", "build108-cdi01-chiron-reference.json")
os.makedirs(os.path.dirname(ref_path), exist_ok=True)
with open(ref_path, "w", encoding="utf-8", newline="\n") as f:
    json.dump(ref, f, indent=2)
    f.write("\n")

# ---- Report ----------------------------------------------------------
print("=" * 100)
print("CDI-108-01  CHIRON EPHEMERIS TABLE")
print("=" * 100)
print(f"source                : {table['source']}")
print(f"range (UT)             : {TABLE_START[0]}-{TABLE_START[1]:02d}-{TABLE_START[2]:02d} .. {TABLE_END[0]}-{TABLE_END[1]:02d}-{TABLE_END[2]:02d}")
print(f"step / samples         : {STEP_DAYS} d / {count}")
print(f"safe interp window     : {table['coverageUtc'][0]} .. {table['coverageUtc'][1]}")
print(f"table file             : {os.path.relpath(tbl_path, REPO)}  ({os.path.getsize(tbl_path)/1024:.1f} KB)")
print(f"interpolation accuracy : max |err| = {worst:.6f} deg over {checks} daily checks (worst near JD {worst_at:.1f})")
print()
print("=" * 140)
print("CDI-108-01  FIXTURE COMPARISON  (EXPECTED = Swiss Ephemeris | OLD = pre-fix linear model | NEW = committed table + Catmull-Rom)")
print("=" * 140)
hdr = (f"{'FIXTURE':24s} {'BIRTH (local)':30s} "
       f"{'CHIRON_LON':>10s} {'SIGN':>11s} {'DEG':>7s} {'H(Plac)':>7s} {'H(WS)':>6s} {'HOUSE_SYSTEM':>13s}  "
       f"|| {'OLD sign':>11s} {'OLD deg':>7s} {'OLD err':>8s} {'MATCH':>5s}  "
       f"|| {'NEW sign':>11s} {'NEW deg':>7s} {'NEW err':>9s} {'MATCH':>5s}")
print(hdr)
print("-" * len(hdr))
old_sign_fail = 0
new_sign_ok = 0
big_err = 0
for (label, binfo, exp_lon, exp_sign, exp_deg, ph, ws, os_, od, oe, ns, nd, ne) in rows:
    if os_ != exp_sign:
        old_sign_fail += 1
    if oe > 5.0:
        big_err += 1
    if ns == exp_sign:
        new_sign_ok += 1
    print(f"{label:24s} {binfo:30s} "
          f"{exp_lon:10.4f} {exp_sign:>11s} {exp_deg:7.3f} {str(ph):>7s} {ws:6d} {'Placidus':>13s}  "
          f"|| {os_:>11s} {od:7.3f} {oe:7.3f}° {('YES' if os_==exp_sign else 'NO'):>5s}  "
          f"|| {ns:>11s} {nd:7.3f} {ne:8.5f}° {('YES' if ns==exp_sign else 'NO'):>5s}")
print("-" * len(hdr))
n = len(rows)
distinct_house = sum(1 for r in rows if r[5] is not None and r[5] != r[6])
print(f"OLD linear model  : {old_sign_fail}/{n} fixtures land in the WRONG sign; {big_err}/{n} exceed 5° longitude error "
      f"(max {max(r[9] for r in rows):.2f}°).")
print(f"NEW table model   : {new_sign_ok}/{n} fixtures in the correct sign; max longitude error {max(r[12] for r in rows):.5f}°.")
print(f"House systems     : {distinct_house}/{n} fixtures have Placidus house != Whole Sign house (systems are genuinely distinct).")
print()
print(f"reference fixtures : {os.path.relpath(ref_path, REPO)}")
if worst > 0.05:
    print("WARNING: interpolation error exceeds 0.05 deg — reduce STEP_DAYS and regenerate.", file=sys.stderr)
    sys.exit(1)
print("OK")
