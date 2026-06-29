from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, Scan

router = APIRouter(prefix="/phishing", tags=["Phishing"])

@router.post("/analyze")
def analyze_phishing_url(url: str, db: Session = Depends(get_db)):
    # Look for existing scan of the url
    scan = db.query(Scan).filter(Scan.indicator == url, Scan.type == "url").first()
    
    # Simple heuristic analysis if no scan data
    is_phishing = False
    reasons = []
    
    if "login" in url or "secure" in url or "account" in url:
        reasons.append("URL contains suspicious keywords (login, secure, account).")
        is_phishing = True
        
    if scan and scan.risk_score > 50:
        reasons.append(f"OSINT Risk score is high ({scan.risk_score}).")
        is_phishing = True
        
    if not is_phishing and not reasons:
        reasons.append("No immediate threats detected by basic heuristics.")
        
    return {
        "url": url,
        "is_phishing": is_phishing,
        "reasons": reasons,
        "risk_score": scan.risk_score if scan else (85 if is_phishing else 10)
    }
