from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.services.cencori import create_triage_response
from app.services.cencori_client import TRIAGE_MODEL, PRIMARY_MEDICAL_MODEL, stream_chat

router = APIRouter()


class TriageMessageRequest(BaseModel):
    session_id: str | None = None
    message: str | None = None
    messages: list[dict[str, str]] | None = None
    language: str = "en"
    temperature: float | None = None


class ChatStreamRequest(BaseModel):
    messages: list[dict[str, str]]
    model: str | None = None
    temperature: float | None = None
    language: str = "en"


@router.post("/chat")
async def triage_chat(payload: TriageMessageRequest):
    try:
        if payload.messages:
            return await create_triage_response(
                message=None,
                language=payload.language,
                session_id=payload.session_id,
                temperature=payload.temperature,
                messages=payload.messages,
            )
        if not payload.message:
            raise HTTPException(status_code=422, detail="Either message or messages must be provided.")
        return await create_triage_response(
            payload.message,
            payload.language,
            payload.session_id,
            temperature=payload.temperature,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/stream")
async def triage_stream(payload: TriageMessageRequest):
    try:
        messages = [
            {"role": "system", "content": f"Language: {payload.language}. You are a clinical triage assistant."},
            {"role": "user", "content": payload.message},
        ]

        async def iter_chunks():
            async for chunk in stream_chat(messages, model=TRIAGE_MODEL, temperature=payload.temperature):
                yield chunk

        return StreamingResponse(iter_chunks(), media_type="text/event-stream")
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/chat-stream")
async def chat_stream(payload: ChatStreamRequest):
    try:
        model = payload.model or PRIMARY_MEDICAL_MODEL
        lang = payload.language or "en"
        
        system_msg = f"You are Dr. Adeoti Clinton. The patient prefers to speak in {lang}. "
        if lang.lower() in ["pidgin", "nigerian pidgin"]:
            system_msg += "You MUST respond purely in Nigerian Pidgin."
        else:
            system_msg += f"You MUST respond purely in {lang}."
            
        messages = [{"role": "system", "content": system_msg}] + payload.messages

        async def iter_chunks():
            async for chunk in stream_chat(messages, model=model, temperature=payload.temperature):
                yield chunk

        return StreamingResponse(iter_chunks(), media_type="text/event-stream")
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

