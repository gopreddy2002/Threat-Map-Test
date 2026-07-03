from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, Scan
import datetime
import random

router = APIRouter(prefix="/compare/countries", tags=["Telemetry"])

# Structured baseline telemetry profiles for key countries
COUNTRY_PROFILES = {
    "US": {
        "name": "United States",
        "total_attacks": 1254300,
        "critical_attacks": 45120,
        "high_attacks": 182400,
        "most_common_type": "Phishing & Social Engineering",
        "threat_level": "High",
        "threat_score": 78,
        "distribution": [
            {"name": "Phishing", "value": 40},
            {"name": "Malware", "value": 25},
            {"name": "Ransomware", "value": 20},
            {"name": "DDoS", "value": 15}
        ]
    },
    "CN": {
        "name": "China",
        "total_attacks": 980400,
        "critical_attacks": 78300,
        "high_attacks": 245000,
        "most_common_type": "DDoS & Infrastructure Attacks",
        "threat_level": "Critical",
        "threat_score": 92,
        "distribution": [
            {"name": "Phishing", "value": 15},
            {"name": "Malware", "value": 30},
            {"name": "Ransomware", "value": 15},
            {"name": "DDoS", "value": 40}
        ]
    },
    "RU": {
        "name": "Russia",
        "total_attacks": 850600,
        "critical_attacks": 68100,
        "high_attacks": 195200,
        "most_common_type": "Ransomware Campaigns",
        "threat_level": "Critical",
        "threat_score": 88,
        "distribution": [
            {"name": "Phishing", "value": 20},
            {"name": "Malware", "value": 35},
            {"name": "Ransomware", "value": 35},
            {"name": "DDoS", "value": 10}
        ]
    },
    "IN": {
        "name": "India",
        "total_attacks": 720800,
        "critical_attacks": 35400,
        "high_attacks": 165000,
        "most_common_type": "Malware Proliferation",
        "threat_level": "High",
        "threat_score": 75,
        "distribution": [
            {"name": "Phishing", "value": 30},
            {"name": "Malware", "value": 40},
            {"name": "Ransomware", "value": 10},
            {"name": "DDoS", "value": 20}
        ]
    },
    "DE": {
        "name": "Germany",
        "total_attacks": 540200,
        "critical_attacks": 15200,
        "high_attacks": 92400,
        "most_common_type": "Industrial Espionage / Malware",
        "threat_level": "Medium",
        "threat_score": 55,
        "distribution": [
            {"name": "Phishing", "value": 25},
            {"name": "Malware", "value": 30},
            {"name": "Ransomware", "value": 25},
            {"name": "DDoS", "value": 20}
        ]
    },
    "GB": {
        "name": "United Kingdom",
        "total_attacks": 620400,
        "critical_attacks": 18500,
        "high_attacks": 112000,
        "most_common_type": "Phishing & Financial Fraud",
        "threat_level": "Medium",
        "threat_score": 58,
        "distribution": [
            {"name": "Phishing", "value": 45},
            {"name": "Malware", "value": 20},
            {"name": "Ransomware", "value": 20},
            {"name": "DDoS", "value": 15}
        ]
    },
    "BR": {
        "name": "Brazil",
        "total_attacks": 690300,
        "critical_attacks": 28400,
        "high_attacks": 142000,
        "most_common_type": "Banking Trojans & Malware",
        "threat_level": "High",
        "threat_score": 72,
        "distribution": [
            {"name": "Phishing", "value": 35},
            {"name": "Malware", "value": 45},
            {"name": "Ransomware", "value": 10},
            {"name": "DDoS", "value": 10}
        ]
    },
    "FR": {
        "name": "France",
        "total_attacks": 510100,
        "critical_attacks": 14200,
        "high_attacks": 87500,
        "most_common_type": "Credential Phishing Campaigns",
        "threat_level": "Medium",
        "threat_score": 54,
        "distribution": [
            {"name": "Phishing", "value": 40},
            {"name": "Malware", "value": 25},
            {"name": "Ransomware", "value": 20},
            {"name": "DDoS", "value": 15}
        ]
    },
    "JP": {
        "name": "Japan",
        "total_attacks": 350200,
        "critical_attacks": 7100,
        "high_attacks": 42000,
        "most_common_type": "Targeted APT Exploitations",
        "threat_level": "Low",
        "threat_score": 38,
        "distribution": [
            {"name": "Phishing", "value": 30},
            {"name": "Malware", "value": 25},
            {"name": "Ransomware", "value": 15},
            {"name": "DDoS", "value": 30}
        ]
    },
    "UA": {
        "name": "Ukraine",
        "total_attacks": 940500,
        "critical_attacks": 82000,
        "high_attacks": 210000,
        "most_common_type": "DDoS & Wiper Malware Warfare",
        "threat_level": "Critical",
        "threat_score": 90,
        "distribution": [
            {"name": "Phishing", "value": 10},
            {"name": "Malware", "value": 30},
            {"name": "Ransomware", "value": 20},
            {"name": "DDoS", "value": 40}
        ]
    }
}

def get_country_scans_summary(db: Session, cc: str):
    """
    Summarize scans matching a country code from the database.
    """
    total = 0
    critical = 0
    high = 0
    distribution_counts = {"ip": 0, "url": 0, "domain": 0, "hash": 0}
    
    # Query all IP scans which have geolocations
    scans = db.query(Scan).filter(Scan.type == "ip").all()
    for s in scans:
        if s.raw_data and isinstance(s.raw_data, dict):
            ipinfo = s.raw_data.get("ipinfo")
            if isinstance(ipinfo, dict) and ipinfo.get("country") == cc:
                total += 1
                if s.risk_score >= 90:
                    critical += 1
                elif s.risk_score >= 70:
                    high += 1
                distribution_counts[s.type] = distribution_counts.get(s.type, 0) + 1
                
    return {
        "total": total,
        "critical": critical,
        "high": high,
        "distribution": distribution_counts
    }

@router.get("/")
def get_threat_comparison(country_a: str, country_b: str, db: Session = Depends(get_db)):
    """
    Compare threat profile details of country_a and country_b side by side.
    """
    country_a = country_a.upper().strip()
    country_b = country_b.upper().strip()
    
    if country_a not in COUNTRY_PROFILES or country_b not in COUNTRY_PROFILES:
        raise HTTPException(status_code=400, detail="Invalid or unsupported country selected for comparison.")
        
    profile_a = dict(COUNTRY_PROFILES[country_a])
    profile_b = dict(COUNTRY_PROFILES[country_b])
    
    # Enrich with database telemetry
    db_a = get_country_scans_summary(db, country_a)
    db_b = get_country_scans_summary(db, country_b)
    
    # US vs CN comparison simulation shifts depending on active database indicators
    def enrich_profile(prof, db_summary):
        prof["total_attacks"] += db_summary["total"] * 1420
        prof["critical_attacks"] += db_summary["critical"] * 240
        prof["high_attacks"] += db_summary["high"] * 480
        prof["threat_score"] = min(prof["threat_score"] + db_summary["critical"] * 2 + db_summary["high"], 100)
        
        # Calculate rating
        if prof["threat_score"] >= 85:
            prof["threat_level"] = "Critical"
        elif prof["threat_score"] >= 70:
            prof["threat_level"] = "High"
        elif prof["threat_score"] >= 45:
            prof["threat_level"] = "Medium"
        else:
            prof["threat_level"] = "Low"
            
    enrich_profile(profile_a, db_a)
    enrich_profile(profile_b, db_b)
    
    # Generate 14-day history for the graphs
    now = datetime.datetime.utcnow()
    recent_activity_a = []
    recent_activity_b = []
    
    # Seed reproducible values
    random.seed(hash(country_a) + hash(country_b))
    
    for i in range(13, -1, -1):
        day = now - datetime.timedelta(days=i)
        day_str = day.strftime("%b %d")
        
        # Base daily attacks fluctuating
        attacks_a = int(profile_a["total_attacks"] / 14 + random.randint(-5000, 5000))
        attacks_b = int(profile_b["total_attacks"] / 14 + random.randint(-4000, 4000))
        
        # Check if database has scans for that day and add spike
        db_scans_a = db.query(Scan).filter(Scan.type == "ip", Scan.created_at >= day.replace(hour=0, minute=0, second=0), Scan.created_at < day.replace(hour=23, minute=59, second=59)).count()
        db_scans_b = db.query(Scan).filter(Scan.type == "ip", Scan.created_at >= day.replace(hour=0, minute=0, second=0), Scan.created_at < day.replace(hour=23, minute=59, second=59)).count()
        
        attacks_a += db_scans_a * 8500
        attacks_b += db_scans_b * 7200
        
        recent_activity_a.append({"date": day_str, "attacks": max(attacks_a, 1000)})
        recent_activity_b.append({"date": day_str, "attacks": max(attacks_b, 1000)})
        
    profile_a["recent_activity"] = recent_activity_a
    profile_b["recent_activity"] = recent_activity_b
    
    # Comparison summary computations
    higher_threat_country = profile_a["name"] if profile_a["threat_score"] >= profile_b["threat_score"] else profile_b["name"]
    higher_threat_code = country_a if profile_a["threat_score"] >= profile_b["threat_score"] else country_b
    score_difference = abs(profile_a["threat_score"] - profile_b["threat_score"])
    
    # Attacks percent difference
    if profile_b["total_attacks"] > 0:
        attacks_diff = round(((profile_a["total_attacks"] - profile_b["total_attacks"]) / profile_b["total_attacks"]) * 100, 1)
    else:
        attacks_diff = 100.0
        
    return {
        "country_a": {
            "code": country_a,
            **profile_a
        },
        "country_b": {
            "code": country_b,
            **profile_b
        },
        "comparison": {
            "higher_threat_country": higher_threat_country,
            "higher_threat_code": higher_threat_code,
            "score_difference": score_difference,
            "attacks_difference_percent": attacks_diff
        }
    }
