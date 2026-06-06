from fastapi import APIRouter, File, HTTPException, UploadFile
import httpx
from pydantic import BaseModel, Field

from app.services.voice import VoiceProvider, synthesize_speech, transcribe_audio

router = APIRouter()


class SpeakRequest(BaseModel):
    text: str = Field(min_length=1)
    language: str = "en"
    voice: str | None = None
    provider: VoiceProvider = VoiceProvider.auto


@router.post("/transcribe")
async def voice_transcribe(
    audio: UploadFile = File(...),
    language: str = "en",
    provider: VoiceProvider = VoiceProvider.auto,
):
    try:
        return await transcribe_audio(audio, language, provider)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/speak")
async def voice_speak(payload: SpeakRequest):
    try:
        return await synthesize_speech(payload.text, payload.language, payload.voice, payload.provider)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/diagnose/yarngpt")
async def diagnose_yarngpt():
    """Return computed tts/transcribe URLs and try light GET checks to help debug endpoint config."""
    from app.core.config import settings

    if not settings.yarngpt_endpoint:
        raise HTTPException(status_code=400, detail="YARNGPT_ENDPOINT is not configured")

    base = settings.yarngpt_endpoint.rstrip('/')
    if base.endswith('/tts'):
        tts_url = base
    elif base.endswith('/transcribe'):
        tts_url = base.rsplit('/', 1)[0] + '/tts'
    else:
        tts_url = base + '/tts'

    if base.endswith('/transcribe'):
        transcribe_url = base
    elif base.endswith('/tts'):
        transcribe_url = base.rsplit('/', 1)[0] + '/transcribe'
    else:
        transcribe_url = base + '/transcribe'

    headers = {}
    if settings.yarngpt_api_key:
        headers['Authorization'] = f"Bearer {settings.yarngpt_api_key}"

    results: dict = {}
    async with httpx.AsyncClient(timeout=10.0) as client:
        for name, url in (('tts', tts_url), ('transcribe', transcribe_url)):
            try:
                resp = await client.get(url, headers=headers)
                results[name] = {
                    'url': url,
                    'status': resp.status_code,
                    'ok': resp.status_code < 400,
                    'text_snippet': (resp.text[:500] if resp.text else ''),
                }
            except Exception as exc:
                results[name] = {'url': url, 'ok': False, 'error': str(exc)}

    return {'configured_endpoint': settings.yarngpt_endpoint, 'results': results}
