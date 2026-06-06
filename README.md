# Alaafia Connect Workspace

This workspace contains the Alaafia Connect frontend, a lightweight FastAPI backend scaffold, and original HTML prototypes.

## Start Frontend

```bash
cd alaafia-app
npm install
npm run dev
```

## Start Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Main documentation is in:

```text
alaafia-app/README.md
```

Backend documentation is in:

```text
backend/README.md
```

Current stack direction:

- Frontend: Vite, React, Tailwind
- Backend: FastAPI
- Database/auth/realtime/storage: Appwrite
- LLM: Cencori through FastAPI
- Voice: Aethex + YARNGPT through FastAPI (English voice uses Aethex when configured)
- Website translation: GTranslate with saved user language preference

Keep provider keys on the backend only. Do not place Cencori, YARNGPT, payment, NIN, or Appwrite server API keys in frontend code.
