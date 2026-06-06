from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services.facilities import get_facility_by_id, search_facilities

router = APIRouter()


@router.get("/")
async def list_facilities(
    query: Optional[str] = Query(None, description="Search text for hospital/clinic name, city, or state"),
    state: Optional[str] = Query(None, description="Filter by Nigerian state"),
    facility_type: Optional[str] = Query(None, alias="type", description="Filter by facility type"),
    public_private: Optional[str] = Query(None, description="Filter by public or private facility"),
    limit: int = Query(50, ge=1, le=200),
):
    facilities = search_facilities(query=query, state=state, facility_type=facility_type, public_private=public_private, limit=limit)
    return {"count": len(facilities), "facilities": facilities}


@router.get("/{facility_id}")
async def get_facility(facility_id: str):
    facility = get_facility_by_id(facility_id)
    if facility is None:
        raise HTTPException(status_code=404, detail="Facility not found")
    return facility
