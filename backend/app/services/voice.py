from enum import Enum
from typing import Any

from fastapi import UploadFile

from app.core.config import settings
from app.services import aethex, yarngpt


class VoiceProvider(str, Enum):
    auto = "auto"
    aethex = "aethex"
    yarngpt = "yarngpt"


def _normalize_language(language: str) -> str:
    if not language:
        return "english"

    normalized = language.strip().lower()
    if normalized in {"en", "en-us", "en-gb", "english"}:
        return "english"
    return normalized


def _resolve_provider(provider: VoiceProvider, language: str) -> VoiceProvider:
    language = _normalize_language(language)
    if provider == VoiceProvider.auto:
        if language == "english" and settings.aethex_api_key and settings.aethex_endpoint:
            return VoiceProvider.aethex
        return VoiceProvider.yarngpt
    return provider


async def transcribe_audio(audio: UploadFile, language: str, provider: VoiceProvider) -> dict[str, Any]:
    provider = _resolve_provider(provider, language)
    if provider == VoiceProvider.aethex:
        return await aethex.transcribe_audio(audio, language)
    return await yarngpt.transcribe_audio(audio, language)


async def synthesize_speech(
    text: str,
    language: str,
    voice: str | None = None,
    provider: VoiceProvider = VoiceProvider.auto,
) -> dict[str, Any]:
    provider = _resolve_provider(provider, language)
    if provider == VoiceProvider.aethex:
        return await aethex.synthesize_speech(text, language, voice)
    return await yarngpt.synthesize_speech(text, language, voice)
