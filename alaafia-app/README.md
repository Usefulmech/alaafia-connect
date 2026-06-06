# Alaafia Connect

Alaafia Connect is a healthcare access prototype for Nigerian patients and doctors. The frontend is a Vite React app. A lightweight FastAPI backend scaffold now exists in `../backend`, with Appwrite planned for auth, database, storage, and realtime features.

The product direction is:

- Cencori powers the LLM symptom-intake and clinical-assistant flows.
- YARNGPT powers voice input/output and speech-friendly patient interactions.
- GTranslate provides app-wide website translation after the user chooses a language.
- Appwrite stores users, language preference, triage cases, consultations, practitioner records, facility data, and future verification/payment records.
- FastAPI protects server-side secrets and exposes the application API consumed by the React frontend.

## Current Status

The React app currently includes these migrated pages:

- Patient symptom intake: `src/pages/SymptomIntake.jsx`
- Doctor onboarding: `src/pages/DoctorOnboarding.jsx`
- Doctor portal: `src/pages/DoctorPortal.jsx`
- Doctor consultation chat: `src/pages/DoctorChat.jsx`

Standalone HTML prototypes still exist one directory above `alaafia-app`. They are useful references for remaining screens, but they are not part of the running React app yet.

## Project Structure

```text
alaafiaconnect/
  alaafia-app/                 # Vite React frontend
    src/
      App.jsx                  # App routes
      main.jsx                 # React entry
      pages/                   # Migrated app screens
    public/                    # Public static assets
    package.json
  index.html                   # Original prototype references
  home.html
  symptom-intake.html
  care-pathway.html
  consultation.html
  patient-pass.html
  doctor-onboarding.html
  doctor-portal.html
```

Backend scaffold:

```text
backend/
  app/
    main.py
    core/
      config.py
    services/
      appwrite.py
      cencori.py
      yarngpt.py
    routers/
      auth.py
      users.py
      triage.py
      consultations.py
      practitioners.py
      facilities.py
      payments.py
      verification.py
    schemas/
  requirements.txt
  .env.example
```

## Requirements

- Node.js 20 LTS or newer is recommended.
- npm 10 or newer.
- Python 3.11 or newer for the planned FastAPI backend.
- Appwrite project and API key.
- Cencori API key.
- YARNGPT API credentials or SDK details.
- GTranslate widget/site configuration.

## Frontend Setup

From this folder:

```bash
cd "C:\Users\USER\Documents\Python Project\alaafiaconnect\alaafia-app"
npm install
npm run dev
```

Then open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

Useful frontend commands:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

If `npm run build` fails with a Rolldown native-binding error, reinstall dependencies:

```bash
cd "C:\Users\USER\Documents\Python Project\alaafiaconnect\alaafia-app"
rd /s /q node_modules
npm install
npm run build
```

On PowerShell, if `npm.ps1 cannot be loaded` appears, use:

```bash
cmd /c npm run dev
cmd /c npm run build
```

## Environment Variables

Do not put production API keys in the browser or in `localStorage`. The frontend should call FastAPI, and FastAPI should call Cencori, YARNGPT, Appwrite, payment providers, and verification services.

Suggested frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_GTRANSLATE_DEFAULT_LANGUAGE=en
```

The new `/facilities` page calls the backend endpoint at `GET /api/facilities` and supports search by state, facility type, and facility name.

Suggested backend `.env`:

```env
APP_ENV=development
APP_ORIGIN=http://localhost:5173
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_server_api_key
APPWRITE_DATABASE_ID=alaafia
CENCORI_API_KEY=your_cencori_key
YARNGPT_API_KEY=your_yarngpt_key
GTRANSLATE_DEFAULT_LANGUAGE=en
```

## Cencori LLM Flow

The symptom-intake page currently contains client-side Cencori logic. Before production, move that logic into FastAPI:

```text
React -> POST /api/triage/chat -> FastAPI -> Cencori -> FastAPI -> React
```

This keeps the Cencori key off the client and lets the backend store triage sessions in Appwrite.

Recommended endpoints:

```text
POST /api/triage/sessions
POST /api/triage/sessions/{session_id}/messages
POST /api/triage/sessions/{session_id}/complete
GET  /api/triage/sessions/{session_id}
```

## YARNGPT Voice Flow

Use YARNGPT for voice-first interactions:

```text
Patient microphone -> React audio capture -> FastAPI /api/voice/transcribe -> YARNGPT
YARNGPT result -> Cencori triage prompt -> stored triage case
Doctor/patient response -> FastAPI /api/voice/speak -> YARNGPT audio output
```

Recommended endpoints:

```text
POST /api/voice/transcribe
POST /api/voice/speak
POST /api/voice/sessions
```

Store the original audio only when there is consent. Store transcript, detected language, and triage summary in Appwrite.

## GTranslate Language Preference

The onboarding flow should save a language code, for example:

```text
en, yo, ha, ig, pcm
```

Recommended behavior:

1. Save the selected language in `localStorage` for instant reuse.
2. Save the selected language in Appwrite under the user profile.
3. Load GTranslate once in the app shell.
4. On app startup, read the saved language and apply it globally.

Important: clinical records should still keep a canonical English summary plus the original patient transcript/language where possible.

## Appwrite Data Model

Suggested collections:

```text
users
patients
practitioners
practitioner_verifications
dependents
language_preferences
triage_sessions
triage_messages
consultations
consultation_messages
patient_passes
facilities
facility_reports
payments
nin_verifications
```

Suggested realtime channels:

```text
consultations
consultation_messages
triage_sessions
practitioner_queue
```

## Future Feature Notes

Payment:

- Add a backend payment router before integrating OPay, Paystack, Flutterwave, or another provider.
- Store provider reference, amount, currency, status, user id, consultation id, and timestamps.
- Confirm payment using provider webhooks, not frontend success messages.

Doctor NIN verification:

- Keep verification provider keys on FastAPI only.
- Store NIN verification status, provider reference, verified name match score, and timestamp.
- Do not store raw NIN unless legally necessary. Prefer encrypted reference metadata.

Doctor MDCN verification:

- Add a practitioner verification state: `pending`, `verified`, `rejected`, `needs_review`.
- Keep uploaded documents in Appwrite Storage with restricted permissions.

## Immediate Next Tasks

1. Finish migrating the remaining HTML screens into React pages.
2. Connect the frontend to `../backend` using `VITE_API_BASE_URL`.
3. Replace the Cencori placeholder service with the real provider call.
4. Replace the YARNGPT placeholder service with real STT/TTS calls.
5. Add Appwrite config and collection bootstrap script.
6. Add GTranslate app-shell integration.
7. Add payment and NIN verification as backend-first integrations.

## Security Rules

- Never commit API keys.
- Never store LLM, voice, payment, or verification secrets in frontend code.
- Use `.env` for local development and deployment secrets for production.
- Use Appwrite permissions per user, practitioner, and admin role.
- Treat medical content as sensitive data.



