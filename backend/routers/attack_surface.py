from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db, AttackSurfaceAsset
from models.schemas import AttackSurfaceAssetCreate, AttackSurfaceAssetResponse

router = APIRouter(prefix="/attack-surface", tags=["Attack Surface"])

@router.get("/", response_model=List[AttackSurfaceAssetResponse])
def get_assets(db: Session = Depends(get_db)):
    return db.query(AttackSurfaceAsset).all()

@router.post("/", response_model=AttackSurfaceAssetResponse)
def create_asset(asset: AttackSurfaceAssetCreate, db: Session = Depends(get_db)):
    db_asset = AttackSurfaceAsset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset
