"""
Async Cencori client (OpenAI-compatible endpoints).

Provides a small, opinionated wrapper using `httpx.AsyncClient` and
convenience helpers for chat, completion, and triage flows.

Defaults:
- Base URL: https://api.cencori.com
- API Key: read from environment `CENCORI_API_KEY`  
- Primary medical model: `claude-3-5-sonnet`
- Triage model: `gemini-2.5-flash`
"""
from __future__ import annotations

import os
import logging
from typing import Any, AsyncIterator, Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

DEFAULT_BASE_URL = "https://api.cencori.com"
PRIMARY_MEDICAL_MODEL = "claude-3-5-sonnet"
TRIAGE_MODEL = "gemini-2.5-flash"

CHAT_PATH = "chat/completions"
STT = "speech-to-text"


class CencoriClient:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, timeout: int = 30):
        self.api_key = api_key or settings.cencori_api_key or os.getenv("CENCORI_API_KEY")
        self.base_url = (
            base_url
            or settings.cencori_endpoint
            or os.getenv("CENCORI_ENDPOINT")
            or os.getenv("CENCORI_BASE_URL")
            or DEFAULT_BASE_URL
        )
        if not self.api_key:
            raise RuntimeError("CENCORI_API_KEY is not set in the environment")

        # Normalize base URL: strip trailing slashes but preserve any path segment
        # (e.g. https://api.cencori.com/v1 stays as-is, not stripped to https://api.cencori.com).
        raw = self.base_url.rstrip("/")
        self.base_url = raw

        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=timeout, headers=self._default_headers())
        logger.info("CencoriClient initialized: base_url=%s", self.base_url)

    def _default_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def close(self) -> None:
        await self._client.aclose()

    async def chat(self, messages: List[Dict[str, str]], model: str = PRIMARY_MEDICAL_MODEL, stream: bool = False, **kwargs) -> Any:
        """Send chat-style messages and return parsed JSON.

        Uses `POST /v1/chat/completions` matching the official Cencori OpenAI-compatible API.
        """
        payload: Dict[str, Any] = {"model": model, "messages": messages, "stream": stream}
        payload.update(kwargs)
        url = CHAT_PATH
        resp = await self._client.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()

    async def completion(self, prompt: str, model: str = PRIMARY_MEDICAL_MODEL, max_tokens: int = 512, temperature: float = 0.0, **kwargs) -> Any:
        """Send a single-text completion using an OpenAI-like `/v1/responses` payload."""
        payload: Dict[str, Any] = {"model": model, "input": prompt, "max_tokens": max_tokens, "temperature": temperature}
        payload.update(kwargs)
        url = "/v1/responses"
        resp = await self._client.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()

    async def triage(self, prompt: str, language: str = "en", **kwargs) -> Any:
        """Convenience method that runs a short triage prompt via the triage model."""
        messages = [
            {"role": "system", "content": f"Language: {language}. You are a clinical triage assistant."},
            {"role": "user", "content": prompt},
        ]
        return await self.chat(messages, model=TRIAGE_MODEL, stream=False, **kwargs)

    async def stream_chat(self, messages: List[Dict[str, str]], model: str = PRIMARY_MEDICAL_MODEL, **kwargs) -> AsyncIterator[bytes]:
        payload: Dict[str, Any] = {"model": model, "messages": messages, "stream": True}
        payload.update(kwargs)
        url = CHAT_PATH

        async with self._client.stream("POST", url, json=payload) as resp:
            resp.raise_for_status()
            async for chunk in resp.aiter_bytes():
                yield chunk


# Module-level convenience singleton + helpers
_CLIENT: Optional[CencoriClient] = None


def get_client(api_key: Optional[str] = None, base_url: Optional[str] = None, timeout: int = 30) -> CencoriClient:
    global _CLIENT
    if _CLIENT is None:
        _CLIENT = CencoriClient(api_key=api_key, base_url=base_url, timeout=timeout)
    return _CLIENT


async def chat(messages: List[Dict[str, str]], model: str = PRIMARY_MEDICAL_MODEL, stream: bool = False, **kwargs) -> Any:
    client = get_client()
    return await client.chat(messages, model=model, stream=stream, **kwargs)


async def stream_chat(messages: List[Dict[str, str]], model: str = PRIMARY_MEDICAL_MODEL, **kwargs) -> AsyncIterator[bytes]:
    client = get_client()
    async for chunk in client.stream_chat(messages, model=model, **kwargs):
        yield chunk


async def completion(prompt: str, model: str = PRIMARY_MEDICAL_MODEL, **kwargs) -> Any:
    client = get_client()
    return await client.completion(prompt, model=model, **kwargs)


async def triage(prompt: str, language: str = "en", **kwargs) -> Any:
    client = get_client()
    return await client.triage(prompt, language=language, **kwargs)


__all__ = ["CencoriClient", "get_client", "chat", "completion", "triage", "PRIMARY_MEDICAL_MODEL", "TRIAGE_MODEL"]
