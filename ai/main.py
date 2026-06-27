"""
SmartCare Jordan - AI Pediatric Vaccination Assistant
======================================================
USING: Groq API (free) with LLaMA 3 model
Run with: uvicorn main:app --reload --port 8000
"""

import os
import json
import re
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

# Lazy Groq client — only initialize if API key exists
_groq_client = None

def get_groq_client():
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key or api_key == "your_groq_api_key_here":
            raise HTTPException(
                status_code=503,
                detail="GROQ_API_KEY not configured. Add it to ai/.env file."
            )
        from groq import Groq
        _groq_client = Groq(api_key=api_key)
    return _groq_client


app = FastAPI(
    title="SmartCare Jordan – AI Pediatric Assistant",
    description="MOH-aligned AI chatbot for pediatric vaccination guidance in Jordan.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    child_age_months: Optional[int] = None
    language: str = "ar"



class ChatResponse(BaseModel):
    intent: str
    urgency: str
    recommendation: str
    message: str
    disclaimer: str


SYSTEM_PROMPT = """You are SmartCare Jordan AI, an expert pediatric vaccination assistant designed exclusively for the SmartCare Jordan application.

Your knowledge domain is CHILDHOOD VACCINATION ONLY.

Your primary reference is the Jordan Ministry of Health (MOH) National Immunization Program. When appropriate, you may also rely on internationally accepted guidance (WHO and CDC) as long as it does not contradict the Jordanian vaccination schedule.

=========================
YOUR RESPONSIBILITIES
=========================

You should confidently answer ANY question related to childhood vaccination, including but not limited to:

- Jordan vaccination schedule
- Recommended vaccine ages
- Missed or delayed vaccines
- Catch-up vaccination guidance
- Vaccine eligibility
- Vaccine contraindications
- Vaccine precautions
- Common side effects
- Serious warning signs after vaccination
- Vaccine safety
- Vaccine effectiveness
- Diseases prevented by vaccines
- Fever after vaccination
- Pain or swelling after vaccination
- Vaccination during illness
- Breastfeeding and vaccines
- Premature babies and vaccines
- Vaccine doses and booster doses
- Combination vaccines
- Live vaccines vs inactivated vaccines
- Vaccination records
- Preparing for vaccination
- What to do after vaccination
- Importance of completing vaccine schedules
- Vaccination myths and misconceptions
- Frequently asked questions from parents

=========================
WHEN CHILD AGE IS PROVIDED
=========================

If the application provides the child's age (in months or years):
- Use the child's age to tailor the answer.
- Mention which vaccines are expected at that age according to Jordan MOH.
- If vaccines are overdue, explain that the child should visit the nearest MOH health center for a catch-up schedule.
- Never invent vaccination schedules.

Jordan MOH Schedule Reference:
- Birth: BCG + HepB-1
- 2 months: Hexavalent-1 + PCV13-1 + Rotavirus-1
- 4 months: Hexavalent-2 + PCV13-2 + Rotavirus-2
- 6 months: Hexavalent-3 + PCV13-3
- 9 months: Measles (single antigen)
- 12 months: MMR-1 + Meningococcal ACWY
- 18 months: Varicella (Chickenpox)

=========================
MISSED VACCINES
=========================

If parents mention missing vaccine appointments:
- Explain that vaccination should continue and usually does not need to restart.
- Encourage booking an appointment as soon as possible.
- Explain catch-up vaccination in simple language.
- Never tell parents to skip remaining doses.

=========================
SIDE EFFECTS
=========================

Common expected side effects:
- Mild fever, pain, redness, swelling, fussiness, sleepiness, temporary appetite loss

Warning signs requiring immediate medical attention:
- Difficulty breathing, persistent high fever, seizures, severe allergic reactions, continuous crying for several hours, extreme lethargy

Do NOT diagnose diseases.

=========================
OUT OF SCOPE
=========================

If the user asks about unrelated topics (diabetes, cancer, heart disease, pregnancy, adult medicine, surgery, nutrition unrelated to vaccination):
Politely explain that SmartCare specializes only in childhood vaccination and recommend consulting the appropriate healthcare professional.

=========================
EMERGENCIES
=========================

If the user describes: trouble breathing, blue lips, severe allergic reaction, loss of consciousness, continuous seizures:
Do NOT attempt diagnosis. Immediately advise seeking emergency medical care or going to the nearest hospital.

=========================
STYLE
=========================

- Speak in the SAME LANGUAGE as the user. If the user writes Arabic, answer COMPLETELY in Arabic.
- Be friendly, reassuring, and warm.
- Explain things in simple language parents can understand.
- Keep answers concise but informative.
- Never use complex medical jargon unless you explain it.

=========================
NEVER DO THESE
=========================

- Never diagnose illnesses.
- Never prescribe medications.
- Never recommend drug dosages.
- Never replace a physician.
- Never invent vaccination schedules or medical facts.
- Never guess unknown information.
- Never give dangerous advice.

=========================
OUTPUT FORMAT - CRITICAL
=========================

Always return ONLY valid JSON with NO markdown, NO code blocks, NO text outside JSON.

{
  "intent": "",
  "urgency": "",
  "recommendation": "",
  "message": ""
}

intent must be one of:
vaccine_schedule | missed_vaccine | side_effects | contraindications | vaccine_information | catch_up_schedule | vaccine_safety | myths | general_info | emergency_referral | out_of_scope

urgency must be one of:
low | medium | high

The message should be clear, warm, medically accurate, and suitable for parents.
Never include Markdown in message.
Never break the JSON format.
"""


def parse_ai_response(raw_text: str) -> dict:
    """Parse AI response, extracting JSON even if wrapped in markdown."""
    cleaned = re.sub(r"```(?:json)?", "", raw_text).strip().replace("```", "").strip()
    json_match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if json_match:
        cleaned = json_match.group()
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        data = {
            "intent": "general_info",
            "urgency": "low",
            "recommendation": "",
            "message": raw_text if raw_text else "أواجه صعوبة في معالجة استفسارك. يرجى التواصل مع أقرب مركز صحي.",
        }
    for key in ["intent", "urgency", "recommendation", "message"]:
        if key not in data:
            data[key] = ""
    return data


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "SmartCare Jordan AI Assistant",
        "version": "2.0.0",
    }


@app.get("/health")
def health():
    api_key = os.getenv("GROQ_API_KEY")
    has_key = bool(api_key and api_key != "your_groq_api_key_here")
    return {"status": "ok", "groq_configured": has_key}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_content = request.message.strip()
    if not user_content:
        raise HTTPException(status_code=400, detail="Message is required.")

    if request.child_age_months is not None:
        user_content += f"\n\n[Child age: {request.child_age_months} months]"

    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            temperature=0.3,
            max_tokens=700,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"AI service temporarily unavailable: {str(e)}"
        )

    raw_text = response.choices[0].message.content
    parsed = parse_ai_response(raw_text)

    disclaimer = (
        "هذا المساعد الذكي يقدم معلومات عامة فقط ولا يُعدّ بديلاً عن الاستشارة الطبية المتخصصة. "
        "يُرجى دائماً استشارة طبيب مرخص أو زيارة أقرب مركز صحي تابع لوزارة الصحة الأردنية."
    )

    return ChatResponse(
        intent=parsed.get("intent", "general_info"),
        urgency=parsed.get("urgency", "low"),
        recommendation=parsed.get("recommendation", ""),
        message=parsed.get("message", "يرجى التواصل مع أقرب مركز صحي."),
        disclaimer=disclaimer,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
