from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, IOCTracker
from models.schemas import IOCTrackerResponse, IOCTrackerBase
from typing import List

router = APIRouter()

@router.get("/", response_model=List[IOCTrackerResponse])
def get_tracked_iocs(db: Session = Depends(get_db)):
    return db.query(IOCTracker).order_by(IOCTracker.confidence_score.desc()).all()

@router.post("/", response_model=IOCTrackerResponse)
def create_tracked_ioc(data: IOCTrackerBase, db: Session = Depends(get_db)):
    db_item = IOCTracker(**data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
