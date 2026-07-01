from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter()

class EmailHeaderRequest(BaseModel):
    headers: str

class EmailAnalysisResponse(BaseModel):
    spf_status: str
    dkim_status: str
    dmarc_status: str
    sender_ip: str
    suspicious_indicators: list[str]

@router.post("/analyze", response_model=EmailAnalysisResponse)
def analyze_headers(request: EmailHeaderRequest):
    # Dummy parsing logic
    text = request.headers.lower()
    
    spf = "Pass" if "spf=pass" in text else "Fail"
    dkim = "Pass" if "dkim=pass" in text else "Fail"
    dmarc = "Pass" if "dmarc=pass" in text else "Fail"
    
    indicators = []
    if spf == "Fail": indicators.append("SPF validation failed (Spoofing risk).")
    if dkim == "Fail": indicators.append("DKIM signature missing or invalid.")
    if dmarc == "Fail": indicators.append("DMARC policy failed.")
    if not indicators: indicators.append("No immediate threats found in headers.")
        
    return EmailAnalysisResponse(
        spf_status=spf,
        dkim_status=dkim,
        dmarc_status=dmarc,
        sender_ip="192.168.1.100", # Mock IP
        suspicious_indicators=indicators
    )
