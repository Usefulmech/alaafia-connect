from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import random
import time

router = APIRouter()

# In-memory OTP store for demo. Replace with Redis / DB for production.
_OTP_STORE: dict[str, dict] = {}
_OTP_TTL = 600  # seconds


class SendOtpRequest(BaseModel):
    phone: str


class SendOtpResponse(BaseModel):
    status: str
    message: str
    demo_code: str = ""


class VerifyOtpRequest(BaseModel):
    phone: str
    code: str


class VerifyOtpResponse(BaseModel):
    status: str
    name: str
    message: str


@router.post("/send-otp", response_model=SendOtpResponse)
async def send_otp(request: SendOtpRequest):
    phone = request.phone.strip()
    if not phone.startswith('+234') or len(phone) < 13:
        raise HTTPException(status_code=400, detail="Invalid phone. Expected e164 format (+2348012345678).")

    code = f"{random.randint(0, 9999):04d}"
    _OTP_STORE[phone] = {
        "code": code,
        "expires_at": time.time() + _OTP_TTL,
    }

    # NOTE: integrate with a real SMS provider (Twilio, Termii, Africa's Talking, etc.) here.
    # For now, return the demo code for local testing.
    return SendOtpResponse(
        status="sent",
        message="OTP sent successfully.",
        demo_code=code,
    )


@router.post("/verify-otp", response_model=VerifyOtpResponse)
async def verify_otp(request: VerifyOtpRequest):
    phone = request.phone.strip()
    code = request.code.strip()
    entry = _OTP_STORE.get(phone)
    if not entry:
        raise HTTPException(status_code=400, detail="No OTP found. Please request a new one.")
    if time.time() > entry["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")
    if entry["code"] != code:
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    name = "Verified Patient"
    return VerifyOtpResponse(
        status="verified",
        name=name,
        message="Phone verified successfully.",
    )
