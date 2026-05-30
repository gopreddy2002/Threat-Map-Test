from sqlalchemy.orm import Session
from backend.models.database import Scan
import ipaddress


def get_correlated_iocs(scan: Scan, db: Session) -> dict:
    """
    Find related IOCs from the database using:
    - /24 subnet matching for IPs
    - Domain suffix matching for domains/URLs
    - Shared ASN matching
    """
    results = {
        "subnet_matches": [],
        "domain_matches": [],
        "asn_matches": [],
    }

    raw = scan.raw_data or {}
    indicator = scan.indicator

    if scan.type == "ip":
        # /24 subnet correlation
        try:
            ip_obj = ipaddress.IPv4Address(indicator)
            subnet_prefix = ".".join(str(ip_obj).split(".")[:3])

            related_scans = (
                db.query(Scan)
                .filter(Scan.type == "ip", Scan.id != scan.id)
                .all()
            )
            for s in related_scans:
                if s.indicator.startswith(subnet_prefix + "."):
                    results["subnet_matches"].append({
                        "scan_id": s.id,
                        "indicator": s.indicator,
                        "risk_score": s.risk_score,
                        "risk_level": s.risk_level,
                        "created_at": s.created_at.isoformat() if s.created_at else None,
                    })
        except Exception:
            pass

        # ASN correlation
        current_org = raw.get("ipinfo", {}).get("org", "")
        if current_org:
            all_ip_scans = db.query(Scan).filter(Scan.type == "ip", Scan.id != scan.id).all()
            for s in all_ip_scans:
                s_raw = s.raw_data or {}
                s_org = s_raw.get("ipinfo", {}).get("org", "")
                if s_org and s_org == current_org:
                    results["asn_matches"].append({
                        "scan_id": s.id,
                        "indicator": s.indicator,
                        "risk_score": s.risk_score,
                        "risk_level": s.risk_level,
                        "org": s_org,
                    })

    elif scan.type in ("domain", "url"):
        # Extract root domain
        domain = indicator
        if scan.type == "url":
            try:
                from urllib.parse import urlparse
                domain = urlparse(indicator).hostname or indicator
            except Exception:
                pass

        # Get TLD+1 for fuzzy matching
        parts = domain.split(".")
        root = ".".join(parts[-2:]) if len(parts) >= 2 else domain

        related = (
            db.query(Scan)
            .filter(Scan.type.in_(["domain", "url"]), Scan.id != scan.id)
            .all()
        )
        for s in related:
            s_domain = s.indicator
            if s.type == "url":
                try:
                    from urllib.parse import urlparse
                    s_domain = urlparse(s.indicator).hostname or s.indicator
                except Exception:
                    pass
            if root in s_domain and s_domain != domain:
                results["domain_matches"].append({
                    "scan_id": s.id,
                    "indicator": s.indicator,
                    "risk_score": s.risk_score,
                    "risk_level": s.risk_level,
                })

    return results
