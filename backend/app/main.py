from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers import facilities, health, triage, voice, payment, verification

app = FastAPI(title="Alaafia Connect API", version="0.1.0")

# Serve generated/temporary media files (TTS output)
app.mount("/media", StaticFiles(directory="tmp"), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(triage.router, prefix="/api/triage", tags=["triage"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(facilities.router, prefix="/api/facilities", tags=["facilities"])
app.include_router(payment.router, prefix="/api/payment", tags=["payment"])
app.include_router(verification.router, prefix="/api/verification", tags=["verification"])
