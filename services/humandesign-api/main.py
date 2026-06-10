import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from humandesign import features as hd
from humandesign import hd_constants

app = FastAPI()

allowed_origins = [
    "http://localhost:3000",
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

class HumanDesignInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    year: int = Field(ge=1900, le=2100)
    month: int = Field(ge=1, le=12)
    day: int = Field(ge=1, le=31)
    hour: int = Field(ge=0, le=23)
    minute: int = Field(ge=0, le=59)
    utc_offset: float = Field(ge=-14, le=14)


def gates_by_label(gates: dict, label: str) -> list[str]:
    labels = gates.get("label", [])
    gate_values = gates.get("gate", [])
    return [
        str(gate)
        for gate, gate_label in zip(gate_values, labels)
        if gate_label == label
    ]


@app.post("/calculate")
async def calculate_human_design(hd_input: HumanDesignInput):
    try:
        result = hd.calc_single_hd_features(
            (
                hd_input.year,
                hd_input.month,
                hd_input.day,
                hd_input.hour,
                hd_input.minute,
                0,
                float(hd_input.utc_offset),
            ),
            report=False,
            channel_meaning=False,
            day_chart_only=False,
        )
        energy_type = result[0]
        authority = result[1]
        profile = tuple(result[4])
        gates = result[6]
        defined_centers = sorted(result[7])
        open_centers = sorted(set(hd_constants.CHAKRA_LIST) - set(result[7]))
        type_details = hd_constants.TYPE_DETAILS_MAP.get(
            energy_type,
            hd_constants.TYPE_DETAILS_MAP["Unknown"],
        )

        return {
            "type": energy_type,
            "profile": hd_constants.PROFILE_DB.get(profile, f"{profile[0]}/{profile[1]}"),
            "authority": hd_constants.INNER_AUTHORITY_NAMES_MAP.get(authority, authority),
            "strategy": type_details["strategy"],
            "notSelfTheme": type_details["not_self"],
            "signature": type_details["signature"],
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
            "status": "ready",
            "source": "human-design-py"
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Human Design calculation failed.")
