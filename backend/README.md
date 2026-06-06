# Alaafia Connect Backend

FastAPI backend for Alaafia Connect.

## Setup

**1. Navigate to the backend directory:**
```bash
cd backend
```

**2. Create a virtual environment (one-time setup):**
```bash
python -m venv .venv
```

**3. Activate the virtual environment:**
- **Windows (Command Prompt):**
  ```cmd
  .venv\Scripts\activate
  ```
- **Windows (PowerShell):**
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
- **macOS/Linux:**
  ```bash
  source .venv/bin/activate
  ```

**4. Install dependencies:**
```bash
pip install -r requirements.txt
```

**5. Environment Variables:**
Copy the `.env.example` to `.env` and fill in your API keys (e.g., Cencori, Appwrite):
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

**6. Start the Server:**
Once the virtual environment is activated (you should see `(.venv)` in your terminal prompt), run:
```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

API health check:

```text
http://localhost:8000/api/health
```

## Provider Responsibilities

- Cencori: LLM triage and clinical assistant responses.
- Aethex: English voice transcription and TTS for the voice agent layer.
- YARNGPT: fallback speech-to-text and text-to-speech for non-English and legacy voice flows.
- Appwrite: auth, database, storage, realtime channels.
- Payment provider: add under `app/routers/payments.py` later.
- NIN/MDCN verification provider: add under `app/routers/verification.py` later.

Never expose provider keys to the frontend.

## Appwrite schema and facility seed

A new bootstrap script is available at `backend/scripts/bootstrap_appwrite.py`. It creates Appwrite collections and seeds the `facilities` collection with representative Nigerian public/private hospitals and clinics.

If Appwrite is not available, the backend still exposes a local facility lookup API from `backend/data/facilities.json`.

## Facilities API

A new route has been added for nearby healthcare discovery:

- `GET /api/facilities`
- `GET /api/facilities/{facility_id}`

Supported query filters:

- `query` — search by name, address, city, state, or services
- `state` — filter by Nigerian state
- `type` — filter by facility type like `Hospital` or `Clinic`
- `public_private` — filter by `Public` or `Private`

## .env example

This project expects a `.env` file in `backend/`. Create it from `.env.example` and set the following values (adjust endpoints to your provider):

```
# App settings
APP_ENV=development
APP_ORIGIN=http://localhost:5173

# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_server_api_key
APPWRITE_DATABASE_ID=alaafia

# Cencori (LLM)
CENCORI_ENDPOINT=https://api.cencori.example/v1/generate
CENCORI_API_KEY=sk-...

# YARNGPT (voice)
YARNGPT_ENDPOINT=https://api.yarngpt.example
YARNGPT_API_KEY=sk-...

# AETHEX (English voice agent)
AETHEX_ENDPOINT=https://api.aethexai.com/api/v1
AETHEX_API_KEY=sk-...

```

Notes:
- `CENCORI_ENDPOINT`, `YARNGPT_ENDPOINT`, and `AETHEX_ENDPOINT` are optional if you plan to keep using the placeholder implementations; set them to your provider URLs to enable real requests.
- Aethex requests use `X-API-Key` for authentication.
- Keep all keys server-side only.

## Voice API

The backend exposes a single voice surface under `/api/voice`.

- `POST /api/voice/transcribe`
  - Query params: `language` (default `en`), `provider` (optional; `auto`, `aethex`, `yarngpt`)
  - `auto` chooses Aethex for English when it is configured, otherwise it uses YARNGPT.
  - `provider=aethex` forces Aethex.
  - `provider=yarngpt` forces YARNGPT.

- `POST /api/voice/speak`
  - Request body: `text`, `language`, optional `voice`, optional `provider`
  - `provider` behaves the same as `/transcribe`.

If you force `provider=aethex` and Aethex is not configured, the backend returns a 503-style error.

## Implementing provider adapters

- `backend/app/services/cencori.py` now contains an `httpx`-based client that POSTS to `CENCORI_ENDPOINT` with `Authorization: Bearer <CENCORI_API_KEY>`; adapt the parsing logic to your provider's response schema.
- `backend/app/services/voice.py` dispatches calls to `backend/app/services/aethex.py` or `backend/app/services/yarngpt.py` based on the request `provider` or automatic English routing.
- `backend/app/services/aethex.py` exposes Aethex-specific transcribe and TTS adapters.
- `backend/app/services/yarngpt.py` exposes the legacy Yarngpt transcribe and TTS adapters.

If you'd like, I can implement exact request/response handling for the real provider APIs you use (please share their API docs or example requests).

## Serving generated audio

The backend mounts a static media route at `/media` and writes TTS output to `backend/tmp/`. When the backend runs locally (default `uvicorn` on port `8000`), generated audio will be available at:

```
http://localhost:8000/media/<filename.mp3>
```

Frontends should fetch the audio from the backend host (not the frontend origin) using that path.

## Persisting audio with Appwrite (optional)

If you want generated audio to be persisted and served from Appwrite storage instead of the local `tmp/` folder, set the following in your `.env`:

- `APPWRITE_PROJECT_ID` — your Appwrite project id
- `APPWRITE_API_KEY` — a server-side API key with storage permissions
- `APPWRITE_BUCKET_ID` — the storage bucket id where files should be uploaded

When configured, the backend will upload TTS audio files to Appwrite and return an `appwrite_url` in the TTS response. This URL follows Appwrite's storage view endpoint and can be used directly by frontends to stream or download the audio.

Make sure the Appwrite bucket has appropriate permissions for how you intend to access files (public access vs signed URLs). If you require signed URLs or CDN distribution, configure the bucket and access rules accordingly.

## Cencori smoke tests

Quick async usage (uses the backend client `app.services.cencori_client`):

```python
import asyncio
from app.services.cencori_client import chat, triage, PRIMARY_MEDICAL_MODEL, TRIAGE_MODEL

async def quick_chat():
	messages = [{"role": "user", "content": "Hello from Alaafia Connect"}]
	resp = await chat(messages, model=PRIMARY_MEDICAL_MODEL, stream=False)
	print(resp)

async def quick_triage():
	resp = await triage("I've had a fever and sore throat for 2 days", language="en")
	print(resp)

asyncio.run(quick_chat())
asyncio.run(quick_triage())
```

Quick curl examples (replace `$CENCORI_API_KEY` with your key):

Chat (medical model):

```bash
curl -X POST https://cencori.com/api/ai/chat \
  -H "Authorization: Bearer $CENCORI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-5-sonnet","messages":[{"role":"user","content":"Hello"}],"stream":false}'
```

Triage (fast, low-cost model):

```bash
curl -X POST https://cencori.com/api/ai/chat \
  -H "Authorization: Bearer $CENCORI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-2.5-flash","messages":[{"role":"system","content":"Language: en. You are a clinical triage assistant."},{"role":"user","content":"I have chest pain and shortness of breath."}],"stream":false}'
```

Simple Python (sync) smoke test using `httpx`:

```python
import os
import httpx

resp = httpx.post(
	"https://cencori.com/api/ai/chat",
	headers={"Authorization": f"Bearer {os.getenv('CENCORI_API_KEY')}", "Content-Type": "application/json"},
	json={"model": "claude-3-5-sonnet", "messages": [{"role": "user", "content": "Hello"}], "stream": False},
)
print(resp.json())
```
