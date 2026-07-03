from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.database import get_db, Scan
import collections

router = APIRouter(prefix="/dashboard/prediction", tags=["Telemetry"])

# Mapping of country codes to regions/names
COUNTRY_MAP = {
    "US": "North America (United States)",
    "CN": "East Asia (China)",
    "RU": "Eastern Europe (Russia)",
    "IN": "South Asia (India)",
    "DE": "Western Europe (Germany)",
    "GB": "Western Europe (United Kingdom)",
    "BR": "South America (Brazil)",
    "FR": "Western Europe (France)",
    "JP": "East Asia (Japan)",
    "UA": "Eastern Europe (Ukraine)",
}

@router.get("/")
def get_attack_prediction(db: Session = Depends(get_db)):
    """
    Generate a rule-based cyber attack prediction based on currently available scan data in the database.
    """
    total_scans = db.query(Scan).count()
    
    if total_scans == 0:
        return {
            "predicted_attack_type": "Phishing Campaigns",
            "predicted_target_region": "Global Infrastructure",
            "confidence_level": "Low",
            "estimated_time": "Next 24-48 Hours",
            "explanation": "No local telemetry scans available. Generative models forecast elevated phishing activities targeting enterprise endpoints based on global baseline data."
        }
        
    # Analyze scan types
    scan_types = db.query(Scan.type, func.count(Scan.id)).group_by(Scan.type).all()
    type_counts = {t: count for t, count in scan_types}
    
    # Calculate high-risk scans count (score >= 70)
    high_risk_scans = db.query(Scan).filter(Scan.risk_score >= 70).count()
    
    # Extract geolocations from IP scans
    ip_scans = db.query(Scan).filter(Scan.type == "ip").all()
    countries = []
    for scan in ip_scans:
        if scan.raw_data and isinstance(scan.raw_data, dict):
            ipinfo = scan.raw_data.get("ipinfo")
            if isinstance(ipinfo, dict):
                country_code = ipinfo.get("country")
                if country_code:
                    countries.append(country_code)
                    
    # Determine the most common target region
    if countries:
        most_common_cc = collections.Counter(countries).most_common(1)[0][0]
        predicted_region = COUNTRY_MAP.get(most_common_cc, f"Region ({most_common_cc})")
    else:
        predicted_region = "North America (United States)" # Fallback default
        
    # Determine predicted attack type based on dominant scan types and high risk severity
    ip_count = type_counts.get("ip", 0)
    hash_count = type_counts.get("hash", 0)
    domain_count = type_counts.get("domain", 0)
    url_count = type_counts.get("url", 0)
    
    web_assets_count = domain_count + url_count
    
    # Simple prediction rules
    if ip_count >= max(hash_count, web_assets_count, 1):
        if high_risk_scans > (total_scans * 0.4):
            predicted_attack_type = "Distributed Denial of Service (DDoS) / Botnet Activity"
            explanation_type = "a high ratio of critical IP scan vectors indicating botnet nodes and scanning behavior"
        else:
            predicted_attack_type = "Reconnaissance / Automated Port Scanning"
            explanation_type = "frequent scanning of IP indicators indicating automated vulnerability searches"
    elif hash_count >= max(ip_count, web_assets_count, 1):
        if high_risk_scans > (total_scans * 0.5):
            predicted_attack_type = "Targeted Ransomware Campaign"
            explanation_type = "an escalation of high-risk file hash registrations indicating active malicious payloads"
        else:
            predicted_attack_type = "Malware Proliferation"
            explanation_type = "increased file hash inspections registered in your evidence logs"
    else:
        predicted_attack_type = "Phishing / Social Engineering Surge"
        explanation_type = "a dominant density of domain and URL analysis queries targeting credential harvest templates"
        
    # Confidence rating
    if total_scans < 15:
        confidence = "Low"
    elif total_scans < 60:
        confidence = "Medium"
    else:
        confidence = "High"
        
    # Estimated time logic based on high-risk scanning speed
    if high_risk_scans > 20:
        estimated_time = "Next 6-12 Hours"
    elif high_risk_scans > 5:
        estimated_time = "Next 12-24 Hours"
    else:
        estimated_time = "Next 24-48 Hours"
        
    explanation = (
        f"Generated from analysis of {total_scans} active telemetry scans. "
        f"We detected {explanation_type}. "
        f"Geographic telemetry links {predicted_region} as the primary focal area."
    )
    
    return {
        "predicted_attack_type": predicted_attack_type,
        "predicted_target_region": predicted_region,
        "confidence_level": confidence,
        "estimated_time": estimated_time,
        "explanation": explanation
    }
