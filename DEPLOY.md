# Deployment

Frontend (Netlify)

- Connect the repository to Netlify and set the deploy root to the `alaafia-app` folder (or pick the `alaafia-app` subdirectory in the UI).
- Build command: `npm run build`
- Publish directory: `dist`
- Netlify uses `alaafia-app/netlify.toml` and `alaafia-app/public/_redirects` for SPA routing.

Commands to test locally:

```bash
# from alaafia-app
npm install
npm run build
npm run preview
```

Backend (Render)

- Render will read `render.yaml` at the repo root and create a Python web service using the `backend` folder.
- Build command (as in `render.yaml`): `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- A `Dockerfile` is provided at `backend/Dockerfile` for alternative container deployments.

Commands to test locally:

```bash
# create a virtualenv, activate it, then:
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Notes

- If you want the backend to read environment-specific values (like `settings.app_origin`), set env vars in Render or Netlify accordingly.
- If you'd like I can also create a Render `Dockerfile`-based service configuration or CI workflows to automate deploys.
 - Preferred: set `YARNGPT_ENDPOINT` to the service base URL (e.g., `https://yarngpt.ai/api/v1`) — the code will add `/tts` or `/transcribe` as needed. Both full-path and base-url forms are supported.
 - Troubleshooting: a diagnostic endpoint is available at `GET /api/voice/diagnose/yarngpt` which returns the computed TTS and transcribe URLs and performs light checks. Use it to verify your `YARNGPT_ENDPOINT` and API key.
