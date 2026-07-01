from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, ThreatIntelBriefing
from models.schemas import ThreatIntelBriefingResponse, ThreatIntelBriefingBase
from typing import List

router = APIRouter()

@router.post("/", response_model=ThreatIntelBriefingResponse)
def create_briefing(briefing: ThreatIntelBriefingBase, db: Session = Depends(get_db)):
    db_item = ThreatIntelBriefing(**briefing.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[ThreatIntelBriefingResponse])
def get_briefings(db: Session = Depends(get_db)):
    return db.query(ThreatIntelBriefing).order_by(ThreatIntelBriefing.created_at.desc()).all()
