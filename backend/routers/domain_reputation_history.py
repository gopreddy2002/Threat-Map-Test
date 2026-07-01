from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, DomainReputationHistory
from models.schemas import DomainReputationHistoryResponse, DomainReputationHistoryBase
from typing import List

router = APIRouter()

@router.post("/", response_model=DomainReputationHistoryResponse)
def create_history(data: DomainReputationHistoryBase, db: Session = Depends(get_db)):
    db_item = DomainReputationHistory(**data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/{domain}", response_model=List[DomainReputationHistoryResponse])
def get_domain_history(domain: str, db: Session = Depends(get_db)):
    return db.query(DomainReputationHistory).filter(DomainReputationHistory.domain == domain).order_by(DomainReputationHistory.scan_date.desc()).all()
