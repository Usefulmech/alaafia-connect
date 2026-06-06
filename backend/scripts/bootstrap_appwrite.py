"""Bootstrap Appwrite collections for Alaafia Connect.

Run this from the backend folder after setting the Appwrite environment variables:

  pip install httpx
  python scripts/bootstrap_appwrite.py

This script creates the essential collections and optionally seeds the facilities collection.
"""
from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from typing import Any, Dict, List

import httpx


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    with path.open("r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and value is not None:
                os.environ.setdefault(key, value)


load_env_file(Path(__file__).resolve().parents[1] / ".env")

APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1").rstrip("/")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")
APPWRITE_DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID", "alaafia")
DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "facilities.json"

HEADERS = {
    "X-Appwrite-Project": APPWRITE_PROJECT_ID or "",
    "X-Appwrite-Key": APPWRITE_API_KEY or "",
}


def assert_configured() -> None:
    if not APPWRITE_PROJECT_ID or not APPWRITE_API_KEY:
        raise RuntimeError("APPWRITE_PROJECT_ID and APPWRITE_API_KEY must be set in the environment")


async def create_collection(client: httpx.AsyncClient, collection_id: str, name: str) -> Dict[str, Any]:
    url = f"{APPWRITE_ENDPOINT}/databases/{APPWRITE_DATABASE_ID}/collections"
    data = {
        "collectionId": collection_id,
        "name": name,
        "read": ["role:all"],
        "write": ["role:all"],
        "enabled": True,
        "documentSecurity": False,
    }
    resp = await client.post(url, json=data, headers=HEADERS)
    if resp.status_code == 409:
        return {"message": "Collection already exists", "collectionId": collection_id}
    resp.raise_for_status()
    return resp.json()


async def create_attribute(client: httpx.AsyncClient, collection_id: str, attr_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    url = f"{APPWRITE_ENDPOINT}/databases/{APPWRITE_DATABASE_ID}/collections/{collection_id}/attributes/{attr_type}"
    resp = await client.post(url, json=payload, headers=HEADERS)
    return resp.json()


async def create_string(client: httpx.AsyncClient, collection_id: str, key: str, size: int = 255, required: bool = False) -> None:
    await create_attribute(client, collection_id, "string", {"key": key, "size": size, "required": required})


async def create_enum(client: httpx.AsyncClient, collection_id: str, key: str, choices: List[str], required: bool = False) -> None:
    await create_attribute(client, collection_id, "enum", {"key": key, "elements": choices, "required": required})


async def create_float(client: httpx.AsyncClient, collection_id: str, key: str, required: bool = False) -> None:
    await create_attribute(client, collection_id, "float", {"key": key, "required": required})


async def create_boolean(client: httpx.AsyncClient, collection_id: str, key: str, required: bool = False, default: bool = False) -> None:
    await create_attribute(client, collection_id, "boolean", {"key": key, "required": required, "default": default})


async def create_facilities_collection(client: httpx.AsyncClient) -> None:
    print("Creating facilities collection...")
    await create_collection(client, "facilities", "Facilities")
    await create_string(client, "facilities", "name", required=True)
    await create_string(client, "facilities", "facility_type", required=True)
    await create_enum(client, "facilities", "public_private", ["Public", "Private"], required=True)
    await create_string(client, "facilities", "category", required=True)
    await create_string(client, "facilities", "address", size=512, required=True)
    await create_string(client, "facilities", "city", required=True)
    await create_string(client, "facilities", "state", required=True)
    await create_string(client, "facilities", "phone", required=False)
    await create_string(client, "facilities", "email", required=False)
    await create_string(client, "facilities", "website", required=False)
    await create_float(client, "facilities", "latitude", required=False)
    await create_float(client, "facilities", "longitude", required=False)
    await create_string(client, "facilities", "services", size=1024, required=False)
    await create_boolean(client, "facilities", "open_24_7", required=False, default=False)
    print("Facilities collection and attributes created.")


async def create_users_collection(client: httpx.AsyncClient) -> None:
    print("Creating users collection...")
    await create_collection(client, "users", "Users")
    await create_string(client, "users", "display_name", required=True)
    await create_string(client, "users", "email", required=True)
    await create_string(client, "users", "phone", required=False)
    await create_string(client, "users", "role", size=50, required=True)
    await create_string(client, "users", "status", size=50, required=True)
    await create_string(client, "users", "provider", size=50, required=False)
    await create_string(client, "users", "photo_url", required=False)
    print("Users collection and attributes created.")


async def create_triage_sessions_collection(client: httpx.AsyncClient) -> None:
    print("Creating triage_sessions collection...")
    await create_collection(client, "triage_sessions", "Triage Sessions")
    await create_string(client, "triage_sessions", "user_id", required=True)
    await create_string(client, "triage_sessions", "language", size=10, required=True)
    await create_string(client, "triage_sessions", "status", size=50, required=True)
    await create_string(client, "triage_sessions", "triage_result", size=50, required=False)
    await create_string(client, "triage_sessions", "summary", size=1024, required=False)
    await create_string(client, "triage_sessions", "raw_response", size=4096, required=False)
    print("Triage sessions collection and attributes created.")


async def create_consultations_collection(client: httpx.AsyncClient) -> None:
    print("Creating consultations collection...")
    await create_collection(client, "consultations", "Consultations")
    await create_string(client, "consultations", "user_id", required=True)
    await create_string(client, "consultations", "practitioner_id", required=True)
    await create_string(client, "consultations", "status", size=50, required=True)
    await create_string(client, "consultations", "notes", size=4096, required=False)
    await create_string(client, "consultations", "outcome", size=1024, required=False)
    await create_string(client, "consultations", "record_url", required=False)
    print("Consultations collection and attributes created.")


async def seed_facilities(client: httpx.AsyncClient) -> None:
    print("Seeding facilities...")
    with DATA_PATH.open("r", encoding="utf-8") as handle:
        facilities = json.load(handle)

    for facility in facilities:
        url = f"{APPWRITE_ENDPOINT}/databases/{APPWRITE_DATABASE_ID}/collections/facilities/documents"
        resp = await client.post(url, json={"data": facility}, headers=HEADERS)
        if resp.status_code >= 400:
            print(f"Warning: failed to create document {facility.get('id')}: {resp.status_code} {resp.text}")
    print("Facility seed complete.")


async def main() -> None:
    assert_configured()
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            await create_facilities_collection(client)
            await create_users_collection(client)
            await create_triage_sessions_collection(client)
            await create_consultations_collection(client)
        except httpx.HTTPStatusError as exc:
            print("Create collection failure:", exc.response.text)
        await seed_facilities(client)


if __name__ == "__main__":
    asyncio.run(main())
