from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, RemediationPlaybook
from models.schemas import RemediationPlaybookResponse, RemediationPlaybookBase
from typing import List

router = APIRouter()

@router.get("/", response_model=List[RemediationPlaybookResponse])
def get_playbooks(db: Session = Depends(get_db)):
    return db.query(RemediationPlaybook).all()

@router.post("/", response_model=RemediationPlaybookResponse)
def create_playbook(data: RemediationPlaybookBase, db: Session = Depends(get_db)):
    db_item = RemediationPlaybook(**data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
