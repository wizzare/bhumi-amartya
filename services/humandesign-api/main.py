import os
import re
from typing import Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from humandesign import features as hd
from humandesign import hd_constants

app = FastAPI()

allowed_origins = [
    "http://localhost:3000",
    "capacitor://localhost",
    "https://localhost",
    *[
        origin.strip()
        for origin in os.getenv("BHUMI_ALLOWED_ORIGINS", "").split(",")
        if origin.strip()
    ],
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

def parse_timezone_to_offset(timezone) -> float:
    if isinstance(timezone, (int, float)):
        if abs(timezone) > 14:
            return float(timezone) / 60.0
        return float(timezone)
        
    if isinstance(timezone, str):
        val = timezone.strip()
        if not val:
            return 7.0
            
        try:
            num = float(val)
            if abs(num) > 14:
                return num / 60.0
            return num
        except ValueError:
            pass
            
        match = re.match(r"^([+-])(\d{1,2})(?::?(\d{2}))?$", val)
        if match:
            sign = -1.0 if match.group(1) == "-" else 1.0
            hours = float(match.group(2))
            minutes = float(match.group(3) or "0")
            return sign * (hours + minutes / 60.0)
            
        try:
            from zoneinfo import ZoneInfo
            from datetime import datetime
            dt = datetime.now(ZoneInfo(val))
            return dt.utcoffset().total_seconds() / 3600.0
        except Exception:
            pass
            
        try:
            import pytz
            from datetime import datetime
            tz = pytz.timezone(val)
            dt = datetime.now(tz)
            return dt.utcoffset().total_seconds() / 3600.0
        except Exception:
            pass
            
    return 7.0

class HumanDesignInput(BaseModel):
    name: Optional[str] = Field(default=None, max_length=120)
    fullName: Optional[str] = Field(default=None, max_length=120)
    year: Optional[int] = Field(default=None, ge=1900, le=2100)
    month: Optional[int] = Field(default=None, ge=1, le=12)
    day: Optional[int] = Field(default=None, ge=1, le=31)
    hour: Optional[int] = Field(default=None, ge=0, le=23)
    minute: Optional[int] = Field(default=None, ge=0, le=59)
    second: int = Field(default=0, ge=0, le=59)
    utc_offset: Optional[float] = Field(default=None, ge=-14, le=14)
    
    # Client raw parameters
    birthDate: Optional[str] = Field(default=None)
    birthTime: Optional[str] = Field(default=None)
    timezone: Optional[Any] = Field(default=None)
    
    debug: bool = False


def gates_by_label(gates: dict, label: str) -> list[str]:
    labels = gates.get("label", [])
    gate_values = gates.get("gate", [])
    return [
        str(gate)
        for gate, gate_label in zip(gate_values, labels)
        if gate_label == label
    ]


def serializable_list(value) -> list:
    if hasattr(value, "tolist"):
        return value.tolist()
    return list(value)


def planet_gate_rows(gates: dict, label: str) -> list[dict]:
    return [
        {
            "planet": planet,
            "longitude": lon,
            "gate": gate,
            "line": line,
            "color": color,
            "tone": tone,
            "base": base,
            "ch_gate": ch_gate,
        }
        for gate_label, planet, lon, gate, line, color, tone, base, ch_gate in zip(
            gates.get("label", []),
            gates.get("planets", []),
            gates.get("lon", []),
            gates.get("gate", []),
            gates.get("line", []),
            gates.get("color", []),
            gates.get("tone", []),
            gates.get("base", []),
            gates.get("ch_gate", []),
        )
        if gate_label == label
    ]


def channel_rows(channels: dict) -> list[dict]:
    return [
        {
            "channel": f"{int(gate)}-{int(ch_gate)}",
            "gate": int(gate),
            "ch_gate": int(ch_gate),
            "label": label,
            "planet": planet,
            "gate_chakra": gate_chakra,
            "ch_gate_chakra": ch_gate_chakra,
            "gate_label": gate_label,
            "ch_gate_label": ch_gate_label,
        }
        for label, planet, gate, ch_gate, gate_chakra, ch_gate_chakra, gate_label, ch_gate_label in zip(
            serializable_list(channels.get("label", [])),
            serializable_list(channels.get("planets", [])),
            serializable_list(channels.get("gate", [])),
            serializable_list(channels.get("ch_gate", [])),
            serializable_list(channels.get("gate_chakra", [])),
            serializable_list(channels.get("ch_gate_chakra", [])),
            channels.get("gate_label", []),
            channels.get("ch_gate_label", []),
        )
    ]


@app.post("/calculate")
async def calculate_human_design(hd_input: HumanDesignInput):
    try:
        # Resolve name
        name_val = hd_input.fullName if hd_input.fullName else (hd_input.name if hd_input.name else "User")
        
        # Resolve date & time parameters
        year_val = hd_input.year
        month_val = hd_input.month
        day_val = hd_input.day
        hour_val = hd_input.hour
        minute_val = hd_input.minute
        
        if hd_input.birthDate and hd_input.birthTime:
            # Parse YYYY-MM-DD
            try:
                parts = hd_input.birthDate.split("-")
                year_val = int(parts[0])
                month_val = int(parts[1])
                day_val = int(parts[2])
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid birthDate format. Expected YYYY-MM-DD.")
                
            # Parse HH:MM[:SS]
            try:
                parts = hd_input.birthTime.split(":")
                hour_val = int(parts[0])
                minute_val = int(parts[1])
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid birthTime format. Expected HH:MM.")
        
        # Ensure we have all required parameters
        if None in (year_val, month_val, day_val, hour_val, minute_val):
            raise HTTPException(status_code=400, detail="Missing birth date/time values (either birthDate/birthTime or year/month/day/hour/minute are required).")
            
        # Resolve offset
        utc_offset_val = hd_input.utc_offset
        if utc_offset_val is None:
            if hd_input.timezone is not None:
                utc_offset_val = parse_timezone_to_offset(hd_input.timezone)
            else:
                utc_offset_val = 7.0
                
        result = hd.calc_single_hd_features(
            (
                year_val,
                month_val,
                day_val,
                hour_val,
                minute_val,
                hd_input.second,
                float(utc_offset_val),
            ),
            report=False,
            channel_meaning=False,
            day_chart_only=False,
        )
        energy_type = result[0]
        authority = result[1]
        inc_cross = result[2]
        profile = tuple(result[4])
        definition = result[5]
        gates = result[6]
        defined_centers = sorted(result[7])
        channels = result[8]
        open_centers = sorted(set(hd_constants.CHAKRA_LIST) - set(result[7]))
        type_details = hd_constants.TYPE_DETAILS_MAP.get(
            energy_type,
            hd_constants.TYPE_DETAILS_MAP["Unknown"],
        )

        response = {
            "type": energy_type,
            "profile": hd_constants.PROFILE_DB.get(profile, f"{profile[0]}/{profile[1]}"),
            "authority": hd_constants.INNER_AUTHORITY_NAMES_MAP.get(authority, authority),
            "strategy": type_details["strategy"],
            "notSelfTheme": type_details["not_self"],
            "signature": type_details["signature"],
            "inc_cross": inc_cross,
            "incarnationCross": inc_cross,
            "definition": definition,
            "channels": [
                row["channel"]
                for row in channel_rows(channels)
            ],
            "definedCenters": [
                hd_constants.CHAKRA_NAMES_MAP.get(center, center)
                for center in defined_centers
            ],
            "openCenters": [
                hd_constants.CHAKRA_NAMES_MAP.get(center, center)
                for center in open_centers
            ],
            "gatesPersonality": gates_by_label(gates, "prs"),
            "gatesDesign": gates_by_label(gates, "des"),
            "variables": result[11],
            "status": "ready",
            "source": "human-design-py"
        }
        if hd_input.debug or os.getenv("HD_DEBUG", "").lower() == "true":
            personality_gates = planet_gate_rows(gates, "prs")
            design_gates = planet_gate_rows(gates, "des")
            response["diagnostic"] = {
                "input": {
                    "name": name_val,
                    "year": year_val,
                    "month": month_val,
                    "day": day_val,
                    "hour": hour_val,
                    "minute": minute_val,
                    "second": hd_input.second,
                    "utc_offset": utc_offset_val,
                },
                "raw_personality_gates": personality_gates,
                "raw_design_gates": design_gates,
                "planet_positions": {
                    "personality": personality_gates,
                    "design": design_gates,
                },
                "personality_sun_gate": personality_gates[0]["gate"] if personality_gates else None,
                "personality_sun_line": personality_gates[0]["line"] if personality_gates else None,
                "design_sun_gate": design_gates[0]["gate"] if design_gates else None,
                "design_sun_line": design_gates[0]["line"] if design_gates else None,
                "channels": channel_rows(channels),
                "defined_centers": [
                    hd_constants.CHAKRA_NAMES_MAP.get(center, center)
                    for center in defined_centers
                ],
                "defined_centers_raw": defined_centers,
                "definition": definition,
                "type": energy_type,
                "authority": hd_constants.INNER_AUTHORITY_NAMES_MAP.get(authority, authority),
                "authority_raw": authority,
                "profile": hd_constants.PROFILE_DB.get(profile, f"{profile[0]}/{profile[1]}"),
                "profile_raw": list(profile),
            }

        return response
    except Exception:
        raise HTTPException(status_code=500, detail="Human Design calculation failed.")

class AstrologyInput(BaseModel):
    birthDate: str = Field(..., description="Format: YYYY-MM-DD")
    birthTime: str = Field(..., description="Format: HH:MM")
    timezone: Any = Field(..., description="Timezone offset or name")
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)
    debug: bool = False

@app.post("/calculate-astrology")
async def calculate_astrology(astro_input: AstrologyInput):
    try:
        import swisseph as swe

        # 1. Parse date
        try:
            parts = astro_input.birthDate.split("-")
            year_val = int(parts[0])
            month_val = int(parts[1])
            day_val = int(parts[2])
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid birthDate format. Expected YYYY-MM-DD.")

        # Parse time
        try:
            parts = astro_input.birthTime.split(":")
            hour_val = int(parts[0])
            minute_val = int(parts[1])
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid birthTime format. Expected HH:MM.")

        # Resolve offset
        utc_offset_val = parse_timezone_to_offset(astro_input.timezone)

        # 2. Get Julian Day UT
        time_stamp = (year_val, month_val, day_val, hour_val, minute_val, 0, float(utc_offset_val))
        time_zone = swe.utc_time_zone(*time_stamp)
        jdut = swe.utc_to_jd(*time_zone)[1]

        # 3. Calculate planets
        planets_to_calc = {
            "Sun": swe.SUN,
            "Moon": swe.MOON,
            "Mercury": swe.MERCURY,
            "Venus": swe.VENUS,
            "Mars": swe.MARS,
            "Jupiter": swe.JUPITER,
            "Saturn": swe.SATURN,
            "Uranus": swe.URANUS,
            "Neptune": swe.NEPTUNE,
            "Pluto": swe.PLUTO,
            "NorthNode": swe.TRUE_NODE,
            "Chiron": swe.CHIRON,
        }

        zodiac_signs = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]

        def sign_from_longitude(longitude: float) -> str:
            normalized = longitude % 360
            return zodiac_signs[int(normalized // 30)]

        sign_meta = {
            "Aries": {"element": "Fire", "modality": "Cardinal", "polarity": "Yang"},
            "Taurus": {"element": "Earth", "modality": "Fixed", "polarity": "Yin"},
            "Gemini": {"element": "Air", "modality": "Mutable", "polarity": "Yang"},
            "Cancer": {"element": "Water", "modality": "Cardinal", "polarity": "Yin"},
            "Leo": {"element": "Fire", "modality": "Fixed", "polarity": "Yang"},
            "Virgo": {"element": "Earth", "modality": "Mutable", "polarity": "Yin"},
            "Libra": {"element": "Air", "modality": "Cardinal", "polarity": "Yang"},
            "Scorpio": {"element": "Water", "modality": "Fixed", "polarity": "Yin"},
            "Sagittarius": {"element": "Fire", "modality": "Mutable", "polarity": "Yang"},
            "Capricorn": {"element": "Earth", "modality": "Cardinal", "polarity": "Yin"},
            "Aquarius": {"element": "Air", "modality": "Fixed", "polarity": "Yang"},
            "Pisces": {"element": "Water", "modality": "Mutable", "polarity": "Yin"},
        }

        body_weights = {
            "Sun": 3,
            "Moon": 3,
            "Mercury": 2,
            "Venus": 2,
            "Mars": 2,
            "Jupiter": 1.5,
            "Saturn": 1.5,
            "Uranus": 1,
            "Neptune": 1,
            "Pluto": 1,
            "NorthNode": 1,
            "SouthNode": 1,
            "Chiron": 1,
        }

        def house_key(number: int) -> str:
            return f"house{number}"

        def normalize_longitude(value: float) -> float:
            return value % 360

        def house_from_cusps(longitude: float, houses: dict) -> int | None:
            normalized = normalize_longitude(longitude)
            cusps = [
                {"house": i, "longitude": normalize_longitude(houses[house_key(i)]["longitude"])}
                for i in range(1, 13)
                if house_key(i) in houses
            ]
            if len(cusps) < 12:
                return None
            for idx, current in enumerate(cusps):
                nxt = cusps[(idx + 1) % len(cusps)]
                if current["longitude"] <= nxt["longitude"]:
                    if normalized >= current["longitude"] and normalized < nxt["longitude"]:
                        return current["house"]
                elif normalized >= current["longitude"] or normalized < nxt["longitude"]:
                    return current["house"]
            return None

        def build_whole_sign_houses(ascendant_longitude: float) -> dict:
            asc_sign_index = int(normalize_longitude(ascendant_longitude) // 30)
            result = {}
            for index in range(12):
                lon = normalize_longitude((asc_sign_index + index) * 30)
                result[house_key(index + 1)] = {
                    "sign": sign_from_longitude(lon),
                    "degree": 0,
                    "longitude": round(lon, 4),
                }
            return result

        def calculate_aspects(planets: dict) -> list[dict]:
            definitions = [
                ("Conjunction", 0, 8),
                ("Sextile", 60, 5),
                ("Square", 90, 7),
                ("Trine", 120, 7),
                ("Opposition", 180, 8),
            ]
            names = list(planets.keys())
            aspects = []
            for i, p1 in enumerate(names):
                for p2 in names[i + 1:]:
                    diff = abs(planets[p1]["longitude"] - planets[p2]["longitude"])
                    diff = 360 - diff if diff > 180 else diff
                    for aspect_type, angle, orb_limit in definitions:
                        orb = abs(diff - angle)
                        if orb <= orb_limit:
                            aspects.append({"p1": p1, "p2": p2, "type": aspect_type, "orb": round(orb, 2)})
                            break
            return sorted(aspects, key=lambda item: item["orb"])

        def has_aspect(aspects: list[dict], p1: str, p2: str, aspect_type: str) -> bool:
            return any(
                aspect["type"] == aspect_type
                and ((aspect["p1"] == p1 and aspect["p2"] == p2) or (aspect["p1"] == p2 and aspect["p2"] == p1))
                for aspect in aspects
            )

        def angular_distance(a: float, b: float) -> float:
            diff = abs(normalize_longitude(a) - normalize_longitude(b))
            return 360 - diff if diff > 180 else diff

        def detect_patterns(planets: dict, aspects: list[dict]) -> list[dict]:
            patterns = []
            by_sign = {}
            by_house = {}
            for name, position in planets.items():
                by_sign.setdefault(position["sign"], []).append(name)
                house = position.get("placidusHouse") or position.get("house")
                if house:
                    by_house.setdefault(house, []).append(name)
            for sign, names in by_sign.items():
                if len(names) >= 3:
                    patterns.append({"type": "Stellium", "planets": names, "sign": sign})
            for house, names in by_house.items():
                if len(names) >= 3:
                    patterns.append({"type": "Stellium", "planets": names, "house": house})
            names = list(planets.keys())
            for i, first in enumerate(names):
                for j, second in enumerate(names[i + 1:], start=i + 1):
                    for third in names[j + 1:]:
                        trio = [first, second, third]
                        if all(has_aspect(aspects, a, b, "Trine") for idx, a in enumerate(trio) for b in trio[idx + 1:]):
                            patterns.append({"type": "Grand Trine", "planets": trio})
                        for a, b, apex in [(trio[0], trio[1], trio[2]), (trio[0], trio[2], trio[1]), (trio[1], trio[2], trio[0])]:
                            if has_aspect(aspects, a, b, "Opposition") and has_aspect(aspects, a, apex, "Square") and has_aspect(aspects, b, apex, "Square"):
                                patterns.append({"type": "T-Square", "planets": [a, b, apex]})
                        for apex in trio:
                            base = [name for name in trio if name != apex]
                            if has_aspect(aspects, base[0], base[1], "Sextile") and all(abs(angular_distance(planets[apex]["longitude"], planets[name]["longitude"]) - 150) <= 3 for name in base):
                                patterns.append({"type": "Yod", "planets": [apex, *base]})
            seen = set()
            unique = []
            for pattern in patterns:
                key = f'{pattern["type"]}:{"-".join(sorted(pattern["planets"]))}:{pattern.get("sign", "")}:{pattern.get("house", "")}'
                if key not in seen:
                    seen.add(key)
                    unique.append(pattern)
            return unique

        def balance_and_dominance(planets: dict) -> tuple[dict, dict, dict, dict]:
            elements = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
            modalities = {"Cardinal": 0, "Fixed": 0, "Mutable": 0}
            polarities = {"Yang": 0, "Yin": 0}
            planet_scores = {}
            sign_scores = {}
            house_scores = {}
            for name, position in planets.items():
                weight = body_weights.get(name, 1)
                meta = sign_meta.get(position["sign"])
                if meta:
                    elements[meta["element"]] += weight
                    modalities[meta["modality"]] += weight
                    polarities[meta["polarity"]] += weight
                planet_scores[name] = planet_scores.get(name, 0) + weight
                sign_scores[position["sign"]] = sign_scores.get(position["sign"], 0) + weight
                house = position.get("placidusHouse") or position.get("house")
                if house:
                    house_scores[house] = house_scores.get(house, 0) + weight
            dominance = {
                "dominantPlanet": max(planet_scores, key=planet_scores.get) if planet_scores else None,
                "dominantSign": max(sign_scores, key=sign_scores.get) if sign_scores else None,
                "dominantElement": max(elements, key=elements.get),
                "dominantModality": max(modalities, key=modalities.get),
                "dominantHouse": max(house_scores, key=house_scores.get) if house_scores else None,
            }
            return elements, modalities, polarities, dominance

        flag = swe.FLG_SPEED
        planets_data = {}

        placidus_houses = None
        whole_sign_houses = None
        ascendant = None
        midheaven = None
        if astro_input.latitude is not None and astro_input.longitude is not None:
            cusps, ascmc = swe.houses_ex(jdut, astro_input.latitude, astro_input.longitude, b"P")
            placidus_houses = {}
            for index, cusp in enumerate(cusps[:12]):
                placidus_houses[house_key(index + 1)] = {
                    "sign": sign_from_longitude(cusp),
                    "degree": round(cusp % 30, 4),
                    "longitude": round(cusp % 360, 4),
                }
            ascendant = sign_from_longitude(ascmc[0])
            midheaven = sign_from_longitude(ascmc[1])
            whole_sign_houses = build_whole_sign_houses(ascmc[0])

        for name, code in planets_to_calc.items():
            xx = swe.calc_ut(jdut, code, flag)
            longitude = xx[0][0]
            velocity = xx[0][3]

            # Sun and Moon are never retrograde
            is_retro = velocity < 0 if name not in ["Sun", "Moon"] else False

            sign = sign_from_longitude(longitude)
            degree = longitude % 30
            placidus_house = house_from_cusps(longitude, placidus_houses) if placidus_houses else None
            whole_sign_house = house_from_cusps(longitude, whole_sign_houses) if whole_sign_houses else None

            planets_data[name] = {
                "sign": sign,
                "degree": round(degree, 4),
                "longitude": round(longitude, 4),
                "retrograde": is_retro,
                "house": placidus_house,
                "placidusHouse": placidus_house,
                "wholeSignHouse": whole_sign_house,
            }

        south_node_longitude = (planets_data["NorthNode"]["longitude"] + 180) % 360
        south_node_placidus_house = house_from_cusps(south_node_longitude, placidus_houses) if placidus_houses else None
        south_node_whole_sign_house = house_from_cusps(south_node_longitude, whole_sign_houses) if whole_sign_houses else None
        planets_data["SouthNode"] = {
            "sign": sign_from_longitude(south_node_longitude),
            "degree": round(south_node_longitude % 30, 4),
            "longitude": round(south_node_longitude, 4),
            "retrograde": planets_data["NorthNode"]["retrograde"],
            "house": south_node_placidus_house,
            "placidusHouse": south_node_placidus_house,
            "wholeSignHouse": south_node_whole_sign_house,
        }

        aspects = calculate_aspects(planets_data)
        patterns = detect_patterns(planets_data, aspects)
        elements, modalities, polarities, dominance = balance_and_dominance(planets_data)

        response = {
            "planets": planets_data,
            "northNode": planets_data["NorthNode"]["sign"],
            "southNode": planets_data["SouthNode"]["sign"],
            "chiron": planets_data["Chiron"]["sign"],
            "ascendant": ascendant,
            "midheaven": midheaven,
            "houses": placidus_houses,
            "placidusHouses": placidus_houses,
            "wholeSignHouses": whole_sign_houses,
            "elements": elements,
            "modalities": modalities,
            "polarities": polarities,
            "aspects": aspects,
            "patterns": patterns,
            "dominance": dominance,
            "status": "ready",
            "source": "swiss-ephemeris"
        }

        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Astrology calculation failed: {str(e)}")
