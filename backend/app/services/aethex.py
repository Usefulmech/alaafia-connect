from typing import Any

import os
import uuid
import httpx

from fastapi import UploadFile

from app.core.config import settings
from app.services.appwrite import appwrite_service


def _require_aethex_config() -> None:
    if not (settings.aethex_api_key and settings.aethex_endpoint):
        raise RuntimeError("AETHEX_API_KEY and AETHEX_ENDPOINT must be configured in .env")


def _normalize_language(language: str) -> str:
    if not language:
        return "english"
    normalized = language.strip().lower()
    if normalized in {"en", "en-us", "en-gb", "english"}:
        return "english"
    return normalized


async def transcribe_audio(audio: UploadFile, language: str) -> dict[str, Any]:
    _require_aethex_config()
    language = _normalize_language(language)

    content = await audio.read()
    files = {
        "file": (
            audio.filename or "audio.wav",
            content,
            audio.content_type or "audio/wav",
        )
    }
    params = {"language": language}
    headers = {"X-API-Key": settings.aethex_api_key}
    url = settings.aethex_endpoint.rstrip("/") + "/transcribe"

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, files=files, params=params, headers=headers)

    if resp.status_code >= 400:
        raise RuntimeError(f"AETHEX transcribe failed: {resp.status_code} {resp.text}")

    data = resp.json()
    return {
        "language": data.get("language") or language,
        "filename": audio.filename,
        "transcript": data.get("text") or data.get("transcript") or "",
        "raw": data,
    }


async def synthesize_speech(text: str, language: str, voice: str | None = None) -> dict[str, Any]:
    _require_aethex_config()
    language = _normalize_language(language)

    payload: dict[str, Any] = {"text": text, "language": language}
    if voice:
        payload["voice_id"] = voice

    headers = {"X-API-Key": settings.aethex_api_key, "Content-Type": "application/json"}
    url = settings.aethex_endpoint.rstrip("/") + "/tts"

    os.makedirs("tmp", exist_ok=True)
    filename = f"aethex_{uuid.uuid4().hex}.wav"
    out_path = os.path.join("tmp", filename)

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", url, json=payload, headers=headers) as resp:
            if resp.status_code >= 400:
                try:
                    detail = await resp.aread()
                except Exception:
                    detail = b""
                raise RuntimeError(f"AETHEX TTS failed: {resp.status_code} {detail}")

            with open(out_path, "wb") as fh:
                async for chunk in resp.aiter_bytes():
                    if chunk:
                        fh.write(chunk)

    result: dict[str, str] = {"filename": filename, "media_path": f"/media/{filename}"}

    try:
        if appwrite_service.is_configured():
            with open(out_path, "rb") as fh:
                file_bytes = fh.read()

            upload = await appwrite_service.upload_file(file_bytes, filename)
            if upload.get("view_url"):
                result["appwrite_url"] = upload["view_url"]
    except Exception:
        pass

    return result
