from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, Alert
from models.schemas import AlertResponse
from typing import List

router = APIRouter()

@router.get("/prioritized", response_model=List[AlertResponse])
def get_prioritized_alerts(db: Session = Depends(get_db)):
    # Simple prioritization: risk_score desc, un-dismissed
    alerts = db.query(Alert).filter(Alert.is_dismissed == False).order_by(Alert.risk_score.desc(), Alert.created_at.desc()).limit(50).all()
    return alerts
