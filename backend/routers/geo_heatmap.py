from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, Scan
import json

router = APIRouter(prefix="/geo-heatmap", tags=["Geo Heatmap"])

@router.get("/")
def get_geo_heatmap(db: Session = Depends(get_db)):
    scans = db.query(Scan).filter(Scan.type == "ip").limit(100).all()
    
    heatmap_data = []
    
    for scan in scans:
        if scan.raw_data and "latitude" in scan.raw_data and "longitude" in scan.raw_data:
            heatmap_data.append({
                "ip": scan.indicator,
                "lat": scan.raw_data["latitude"],
                "lng": scan.raw_data["longitude"],
                "risk": scan.risk_score
            })
            
    # Mock data if empty
    if not heatmap_data:
        heatmap_data = [
            {"ip": "8.8.8.8", "lat": 37.386, "lng": -122.0838, "risk": 20},
            {"ip": "1.1.1.1", "lat": -33.494, "lng": 143.2104, "risk": 15},
            {"ip": "93.184.216.34", "lat": 42.2775, "lng": -83.7408, "risk": 80}
        ]
        
    return heatmap_data
