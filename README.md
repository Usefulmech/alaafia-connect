# Àlàáfíà Connect

Àlàáfíà Connect is a unified, hyper-localized telemedicine platform bridging the gap between patients and healthcare providers in Nigeria and sub-Saharan Africa. 

## 🌍 The Product & Vision
Healthcare in many regions is challenged by low doctor-to-patient ratios, severe delays in primary care, and language barriers. Most health-tech platforms are strictly English-first, alienating a large segment of the population. Furthermore, counterfeit drugs remain a massive threat to public health.

**Àlàáfíà Connect** solves this by providing accessible, affordable, and immediate medical triage. It offers end-to-end care, from AI-driven symptom intake to secure online doctor consultations, all while supporting multiple local dialects natively.

## 🎯 Target Audience
- **The Patient:** Individuals seeking accessible and immediate medical triage. They value frictionless user experiences, linguistic inclusivity (English, Yorùbá, Hausa, Igbo, Nigerian Pidgin), and the ability to verify their medications instantly.
- **The Doctor / Practitioner:** Healthcare professionals looking for an organized, digital-first platform to manage their schedules, access structured patient histories, and conduct remote consultations without administrative overload.

## 💡 The Solution
- **Intelligent Triage & Care Pathways:** Patients can describe symptoms via text or voice, and the AI categorizes the urgency, guiding them to local facility finders or online doctors.
- **Linguistic Inclusivity:** Designed to ensure no patient is left behind by offering healthcare that speaks their language.
- **Frictionless Onboarding:** Password-less OTP logins and clean, card-based interfaces designed for mobile-first users.
- **Medication Authentication:** Live integration with pharmacological databases (e.g., OpenFDA) allowing users to verify drug authenticity instantly on their dashboard.
- **Seamless Payments:** Integrated, localized payment gateways (Card, Bank Transfer, USSD) offering maximum flexibility.

## 🤖 The AI Component
Our AI integrations act as a massive workforce multiplier, allowing doctors to focus purely on diagnosis and care:
- **AI Symptom Check (Triage):** Operates 24/7 as the first point of contact, analyzing text or voice inputs in real-time.
- **Clinical Summarization (The Patient Pass):** The AI parses unstructured, emotional human inputs into a structured clinical summary. This drastically reduces the time doctors spend on initial fact-finding.
- **Voice Intelligence:** Handled by advanced LLMs to support voice-based symptom descriptions, ensuring accessibility for demographics that struggle with text.

## 🏗️ Architecture & Tech Stack
The platform is built with a modern, decoupled architecture:
- **Frontend:** React, Vite, Tailwind CSS (Mobile-first UI)
- **Backend:** FastAPI (Python)
- **Database / Auth / Realtime:** Appwrite
- **AI Text & Triage:** Cencori AI (Integrated via FastAPI)
- **AI Voice Processing:** Aethex + YARNGPT (Integrated via FastAPI)
- **Localization:** GTranslate for real-time UI translation with saved user preferences.

## 🚀 Getting Started

### Start Frontend
```bash
cd alaafia-app
npm install
npm run dev
```

### Start Backend
```bash
cd backend
python -m venv .venv
# On Windows use: .venv\Scripts\activate
# On Mac/Linux use: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

---
> **Security Note:** Keep all provider keys on the backend only. Do not place Cencori, YARNGPT, payment, NIN, or Appwrite server API keys in the frontend codebase.
