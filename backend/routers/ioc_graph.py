from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, Scan

router = APIRouter(prefix="/ioc-graph", tags=["IOC Graph"])

@router.get("/{indicator}")
def get_ioc_graph(indicator: str, db: Session = Depends(get_db)):
    # Mocking graph data for the frontend based on the indicator
    scan = db.query(Scan).filter(Scan.indicator == indicator).first()
    
    nodes = [
        {"id": indicator, "label": indicator, "type": scan.type if scan else "domain", "risk": scan.risk_score if scan else 0}
    ]
    edges = []
    
    if scan and scan.raw_data:
        # Example of pulling related IPs
        if "ips" in scan.raw_data:
            for i, ip in enumerate(scan.raw_data["ips"]):
                ip_id = f"ip_{i}"
                nodes.append({"id": ip_id, "label": ip, "type": "ip", "risk": 50})
                edges.append({"source": indicator, "target": ip_id, "relation": "resolves_to"})
                
    # If no real data, provide safe fallback demo data
    if len(nodes) == 1:
        nodes.extend([
            {"id": "demo_ip_1", "label": "192.168.1.1", "type": "ip", "risk": 80},
            {"id": "demo_hash_1", "label": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "type": "hash", "risk": 100}
        ])
        edges.extend([
            {"source": indicator, "target": "demo_ip_1", "relation": "connected_to"},
            {"source": "demo_ip_1", "target": "demo_hash_1", "relation": "dropped_by"}
        ])

    return {"nodes": nodes, "edges": edges}
