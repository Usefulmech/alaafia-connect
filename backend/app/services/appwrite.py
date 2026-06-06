from typing import Any

import httpx

from app.core.config import settings


class AppwriteService:
    """Helper for minimal Appwrite server uploads using the REST API.

    This keeps the dependency surface small and avoids requiring the full
    Appwrite SDK for simple uploads. If you prefer the SDK, replace this
    implementation with the official client.
    """

    def is_configured(self) -> bool:
        return bool(settings.appwrite_project_id and settings.appwrite_api_key and settings.appwrite_bucket_id)

    async def upload_file(self, file_bytes: bytes, filename: str) -> dict[str, Any]:
        if not self.is_configured():
            raise RuntimeError("Appwrite storage is not fully configured (project, key, bucket required)")

        endpoint = settings.appwrite_endpoint.rstrip("/")
        upload_url = f"{endpoint}/storage/buckets/{settings.appwrite_bucket_id}/files"

        headers = {
            "X-Appwrite-Project": settings.appwrite_project_id,
            "X-Appwrite-Key": settings.appwrite_api_key,
        }

        files = {"file": (filename, file_bytes, "application/octet-stream")}

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(upload_url, headers=headers, files=files)

        if resp.status_code >= 400:
            raise RuntimeError(f"Appwrite upload failed: {resp.status_code} {resp.text}")

        data = resp.json()

        file_id = data.get("$id") or data.get("id")
        if not file_id:
            return {"raw": data}

        # Construct a public view URL. This URL requires the project param.
        view_url = f"{endpoint}/storage/buckets/{settings.appwrite_bucket_id}/files/{file_id}/view?project={settings.appwrite_project_id}"

        return {"file_id": file_id, "view_url": view_url, "raw": data}


appwrite_service = AppwriteService()
