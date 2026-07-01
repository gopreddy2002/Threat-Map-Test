from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db, IncidentCase
from models.schemas import IncidentCaseCreate, IncidentCaseResponse

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("/", response_model=List[IncidentCaseResponse])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(IncidentCase).all()

@router.post("/", response_model=IncidentCaseResponse)
def create_incident(incident: IncidentCaseCreate, db: Session = Depends(get_db)):
    db_incident = IncidentCase(**incident.model_dump())
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

@router.put("/{incident_id}", response_model=IncidentCaseResponse)
def update_incident(incident_id: int, incident: IncidentCaseCreate, db: Session = Depends(get_db)):
    db_incident = db.query(IncidentCase).filter(IncidentCase.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    for key, value in incident.model_dump().items():
        setattr(db_incident, key, value)
        
    db.commit()
    db.refresh(db_incident)
    return db_incident

@router.delete("/{incident_id}")
def delete_incident(incident_id: int, db: Session = Depends(get_db)):
    db_incident = db.query(IncidentCase).filter(IncidentCase.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db.delete(db_incident)
    db.commit()
    return {"message": "Incident deleted"}
