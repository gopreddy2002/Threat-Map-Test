from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, AttackPath
from models.schemas import AttackPathResponse, AttackPathBase
from typing import List

router = APIRouter()

@router.get("/", response_model=List[AttackPathResponse])
def get_attack_paths(db: Session = Depends(get_db)):
    paths = db.query(AttackPath).all()
    if not paths:
        mock = AttackPath(title="External to Internal Pivot", risk_level="Critical", steps={"nodes": [{"id": 1, "label": "External IP"}, {"id": 2, "label": "Web Server"}], "edges": [{"from": 1, "to": 2}]})
        db.add(mock)
        db.commit()
        db.refresh(mock)
        return [mock]
    return paths

@router.post("/", response_model=AttackPathResponse)
def create_attack_path(data: AttackPathBase, db: Session = Depends(get_db)):
    db_item = AttackPath(**data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
