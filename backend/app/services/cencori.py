import os
from typing import Any, Dict, List

from app.services.cencori_client import chat, TRIAGE_MODEL
from app.core.config import settings


async def create_triage_response(
    message: str | None,
    language: str,
    session_id: str | None = None,
    temperature: float | None = None,
    messages: list[Dict[str, str]] | None = None,
) -> dict[str, Any]:
    if not (settings.cencori_api_key or os.getenv('CENCORI_API_KEY')):
        
        raise RuntimeError("CENCORI_API_KEY must be configured in .env or environment to use Cencori")

    system_prompt = (
        f"Language: {language}. You are Àlàáfíà AI, a concise and empathetic Nigerian healthcare assistant on the Àlàáfíà Connect platform. "
        f"Important: Try to respond in {language}. If you are not fluent in {language}, you may use simple English while incorporating {language} greetings. "
        "Your job is to conduct a focused symptom-assessment interview to gather facts and determine urgency. "
        "IMPORTANT: In your very first reply, you MUST ask for the patient's age and biological sex if they haven't provided it, before asking further about symptoms. "
        "Ask ONE clear, focused question at a time; wait for the user's reply before asking the next. "
        "After 3-5 user exchanges, append a single-line TRIAGE verdict in this exact format at the end of your message: "
        "TRIAGE: [EMERGENCY|SEE_DOCTOR_TODAY|MONITOR_AT_HOME] — [brief reason]. "
        "Keep the main response concise (1-4 short sentences) and do not provide definitive diagnoses — only possible causes and recommended next steps. "
        "If TRIAGE is EMERGENCY: clearly instruct the user to call local emergency services immediately."
    )

    if messages is None:
        if not message:
            raise RuntimeError("No message content provided for triage response")
        final_messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ]
    else:
        # Filter out any system prompts the frontend might have sent so we don't duplicate
        filtered_messages = [m for m in messages if m.get("role") != "system"]
        final_messages = [{"role": "system", "content": system_prompt}] + filtered_messages

    # Use non-streaming chat for triage responses with rate limit handling
    try:
        resp = await chat(final_messages, model=TRIAGE_MODEL, stream=False, temperature=temperature)
    except Exception as e:
        import httpx
        if isinstance(e, httpx.HTTPStatusError):
            if e.response.status_code == 429:
                return {
                    "session_id": session_id or "local-dev-session",
                    "language": language,
                    "reply": "I am receiving too many requests at the moment and need a short break. Please wait a few seconds and try sending your message again.",
                    "triage": None,
                    "received": message,
                    "raw": {}
                }
            elif e.response.status_code >= 500:
                return {
                    "session_id": session_id or "local-dev-session",
                    "language": language,
                    "reply": "My connection to the medical database is temporarily unavailable. Please try again in a moment.",
                    "triage": None,
                    "received": message,
                    "raw": {}
                }
        raise e

    # Normalize expected response shapes (SDK/native may differ)
    reply = ""
    triage = None
    session = session_id or "local-dev-session"

    if isinstance(resp, dict):
        # Prefer convenience fields
        reply = resp.get("content") or resp.get("reply") or resp.get("choices", [{}])[0].get("message", {}).get("content")
        triage = resp.get("triage")
        session = resp.get("session_id") or session

    return {
        "session_id": session,
        "language": language,
        "reply": reply,
        "triage": triage,
        "received": message,
        "raw": resp,
    }
