from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, Scan, Alert, IncidentCase, ThreatActor

router = APIRouter()

@router.get("/")
def get_executive_summary(db: Session = Depends(get_db)):
    total_threats = db.query(Scan).count()
    critical_alerts = db.query(Alert).filter(Alert.risk_score > 80, Alert.is_dismissed == False).count()
    open_cases = db.query(IncidentCase).filter(IncidentCase.status == "Open").count()
    total_actors = db.query(ThreatActor).count()
    
    return {
        "total_threats": total_threats,
        "critical_alerts": critical_alerts,
        "open_cases": open_cases,
        "total_threat_actors": total_actors,
        "risk_trend": "increasing",
        "remediation_progress": 65 # Mock percentage
    }
