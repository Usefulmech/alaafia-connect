from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "facilities.json"


def _load_data() -> List[Dict[str, Any]]:
    with DATA_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_facilities() -> List[Dict[str, Any]]:
    return _load_data()


def search_facilities(
    query: Optional[str] = None,
    state: Optional[str] = None,
    facility_type: Optional[str] = None,
    public_private: Optional[str] = None,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    facilities = load_facilities()

    if query:
        query_lower = query.strip().lower()
        facilities = [
            f
            for f in facilities
            if query_lower in f["name"].lower()
            or query_lower in f["address"].lower()
            or query_lower in f["city"].lower()
            or query_lower in f["state"].lower()
            or query_lower in f["facility_type"].lower()
        ]

    if state:
        state_lower = state.strip().lower()
        facilities = [f for f in facilities if f["state"].lower() == state_lower]

    if facility_type:
        type_lower = facility_type.strip().lower()
        facilities = [f for f in facilities if type_lower in f["facility_type"].lower()]

    if public_private:
        kind_lower = public_private.strip().lower()
        facilities = [f for f in facilities if f["public_private"].lower() == kind_lower]

    return facilities[:limit]


def get_facility_by_id(facility_id: str) -> Optional[Dict[str, Any]]:
    facilities = load_facilities()
    for facility in facilities:
        if facility.get("id") == facility_id:
            return facility
    return None
