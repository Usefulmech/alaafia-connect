from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid

router = APIRouter()

class PaymentRequest(BaseModel):
    amount: int
    email: str
    purpose: str

class PaymentResponse(BaseModel):
    reference: str
    status: str
    message: str
    payment_url: str

@router.post("/initiate", response_model=PaymentResponse)
async def initiate_payment(request: PaymentRequest):
    # Mocking a payment initiation (e.g. via Paystack which supports OPay channels)
    reference = f"AC-{uuid.uuid4().hex[:8].upper()}"
    return PaymentResponse(
        reference=reference,
        status="success",
        message=f"Payment initialized successfully for {request.purpose}.",
        payment_url=f"https://mock-payment-gateway.alaafia.com/pay/{reference}"
    )

@router.post("/verify/{reference}")
async def verify_payment(reference: str):
    # Mocking payment verification (in a real app this would call Paystack/OPay API)
    return {"status": "verified", "amount_paid": 5000, "reference": reference}
