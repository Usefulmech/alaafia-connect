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

    if messages is None:
        if not message:
            raise RuntimeError("No message content provided for triage response")
        messages = [
            {
                "role": "system",
                "content": (
                    f"Language: {language}. You are Àlàáfíà AI, a concise and empathetic Nigerian healthcare assistant on the Àlàáfíà Connect platform. "
                    "Your job is to conduct a focused symptom-assessment interview to gather facts and determine urgency. "
                    "- Ask ONE clear, focused question at a time; wait for the user's reply before asking the next. "
                    "- Use warm, culturally aware phrasing; occasionally include a short Yoruba/Hausa/Pidgin greeting (one word or short phrase). "
                    "- After 3-5 user exchanges, append a single-line TRIAGE verdict in this exact format at the end of your message: "
                    "TRIAGE: [EMERGENCY|SEE_DOCTOR_TODAY|MONITOR_AT_HOME] — [brief reason]. "
                    "- Keep the main response concise (1-4 short sentences) and do not provide definitive diagnoses — only possible causes and recommended next steps. "
                    "- If TRIAGE is EMERGENCY: clearly instruct the user to call local emergency services immediately (e.g., call 112). "
                    "- Use plain language suitable for a general audience."
                ),
            },
            {"role": "user", "content": message},
        ]
    else:
        if messages and messages[0].get("role") == "system":
            messages[0]["content"] = f"Language: {language}. " + messages[0]["content"]
        else:
            messages = [
                {
                    "role": "system",
                    "content": (
                        f"Language: {language}. You are Àlàáfíà AI, an empathetic Nigerian clinical triage assistant. "
                        "Ask ONE focused question at a time. Gather symptoms clearly. After 3-5 exchanges, append a single-line verdict exactly like: "
                        "TRIAGE: [EMERGENCY|SEE_DOCTOR_TODAY|MONITOR_AT_HOME] — [reason]. "
                        "Do not provide definitive diagnoses. Use warm, culturally aware phrasing."
                    ),
                },
                *messages,
            ]

    # Use non-streaming chat for triage responses
    resp = await chat(messages, model=TRIAGE_MODEL, stream=False, temperature=temperature)

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
