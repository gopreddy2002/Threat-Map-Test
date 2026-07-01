from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, MitreTechnique
from models.schemas import MitreTechniqueResponse, MitreTechniqueBase
from typing import List

router = APIRouter()

@router.get("/", response_model=List[MitreTechniqueResponse])
def get_techniques(db: Session = Depends(get_db)):
    techs = db.query(MitreTechnique).all()
    if not techs:
        # Insert mock if empty
        mock = MitreTechnique(technique_id="T1566", name="Phishing", tactics=["Initial Access"], severity="High", description="Adversaries may send phishing messages to gain access to victim systems.", mitigation="User Training")
        db.add(mock)
        db.commit()
        db.refresh(mock)
        return [mock]
    return techs

@router.post("/", response_model=MitreTechniqueResponse)
def create_technique(data: MitreTechniqueBase, db: Session = Depends(get_db)):
    db_item = MitreTechnique(**data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
