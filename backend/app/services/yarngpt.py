from typing import Any

import os
import uuid
import httpx

from fastapi import UploadFile

from app.core.config import settings
from app.services.appwrite import appwrite_service


def _normalize_language(language: str) -> str:
    # Map common frontend labels / ISO codes to Yarngpt's expected language keys
    if not language:
        return "english"
    normalized = language.strip().lower()

    LANG_MAP = {
        "en": "english",
        "en-us": "english",
        "en-gb": "english",
        "english": "english",
        "pidgin": "pidgin",
        "nigerian pidgin": "pidgin",
        "yoruba": "yoruba",
        "yo": "yoruba",
        "yo-ng": "yoruba",
        "hausa": "hausa",
        "ha": "hausa",
        "igbo": "igbo",
        "ig": "igbo",
    }

    # direct map
    if normalized in LANG_MAP:
        return LANG_MAP[normalized]

    # try splitting locale like 'en-NG' -> 'en'
    if '-' in normalized:
        part = normalized.split('-', 1)[0]
        if part in LANG_MAP:
            return LANG_MAP[part]

    # fallback to normalized string (provider may accept it)
    return normalized


async def transcribe_audio(audio: UploadFile, language: str) -> dict[str, Any]:
    if not (settings.yarngpt_api_key and settings.yarngpt_endpoint):
        raise RuntimeError("YARNGPT_API_KEY and YARNGPT_ENDPOINT must be configured in .env")

    language = _normalize_language(language)
    content = await audio.read()

    files = {"file": (audio.filename or "audio.wav", content)}
    params = {"language": language}
    headers = {"Authorization": f"Bearer {settings.yarngpt_api_key}"}

    base = settings.yarngpt_endpoint.rstrip("/")
    if base.endswith("/transcribe"):
        transcribe_url = base
    elif base.endswith("/tts"):
        transcribe_url = base.rsplit('/', 1)[0] + "/transcribe"
    else:
        transcribe_url = base + "/transcribe"

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(transcribe_url, files=files, params=params, headers=headers)

    if resp.status_code >= 400:
        raise RuntimeError(f"YARNGPT transcribe failed: {resp.status_code} {resp.text}")

    data = resp.json()

    return {
        "language": language,
        "filename": audio.filename,
        "transcript": data.get("transcript") or data.get("text") or "",
        "raw": data,
    }


async def synthesize_speech(text: str, language: str, voice: str | None = None) -> dict[str, Any]:
    if not (settings.yarngpt_api_key and settings.yarngpt_endpoint):
        raise RuntimeError("YARNGPT_API_KEY and YARNGPT_ENDPOINT must be configured in .env")

    language = _normalize_language(language)
    base = settings.yarngpt_endpoint.rstrip("/")
    if base.endswith("/tts"):
        tts_url = base
    elif base.endswith("/transcribe"):
        tts_url = base.rsplit('/', 1)[0] + "/tts"
    else:
        tts_url = base + "/tts"

    payload = {"text": text, "language": language}
    if voice:
        payload["voice"] = voice
    headers = {"Authorization": f"Bearer {settings.yarngpt_api_key}", "Content-Type": "application/json"}

    os.makedirs("tmp", exist_ok=True)
    filename = f"yarngpt_{uuid.uuid4().hex}.mp3"
    out_path = os.path.join("tmp", filename)

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", tts_url, json=payload, headers=headers) as resp:
            if resp.status_code >= 400:
                try:
                    detail = await resp.aread()
                except Exception:
                    detail = b""
                raise RuntimeError(f"YARNGPT TTS failed: {resp.status_code} {detail}")

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
