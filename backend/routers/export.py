import io
import csv
import json
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.models.database import get_db, Scan

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/export", tags=["Export Reports"])


@router.get("/{scan_id}")
def export_report(
    scan_id: str,
    format: str = Query(..., description="Export format: json, csv, or pdf"),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    format = format.lower()
    
    if format == "json":
        return _export_json(scan)
    elif format == "csv":
        return _export_csv(scan)
    elif format == "pdf":
        return _export_pdf(scan)
    else:
        raise HTTPException(status_code=400, detail="Invalid format specified.")


# Keep the old endpoints for backward compatibility with existing frontend code if needed
@router.get("/json/{scan_id}")
def export_json_old(scan_id: str, db: Session = Depends(get_db)):
    return export_report(scan_id, format="json", db=db)

@router.get("/csv/{scan_id}")
def export_csv_old(scan_id: str, db: Session = Depends(get_db)):
    return export_report(scan_id, format="csv", db=db)

@router.get("/pdf/{scan_id}")
def export_pdf_old(scan_id: str, db: Session = Depends(get_db)):
    return export_report(scan_id, format="pdf", db=db)


def _export_json(scan: Scan):
    data = {
        "id": scan.id,
        "indicator": scan.indicator,
        "type": scan.type,
        "risk_score": scan.risk_score,
        "risk_level": scan.risk_level,
        "summary": scan.summary,
        "created_at": scan.created_at.isoformat(),
        "raw_data": scan.raw_data
    }
    json_bytes = json.dumps(data, indent=2).encode("utf-8")
    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=threatmap_scan_{scan.indicator}.json"}
    )


def _export_csv(scan: Scan):
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Field", "Value"])
    writer.writerow(["ID", scan.id])
    writer.writerow(["Indicator", scan.indicator])
    writer.writerow(["Type", scan.type])
    writer.writerow(["Risk Score", scan.risk_score])
    writer.writerow(["Risk Level", scan.risk_level])
    writer.writerow(["Created At", scan.created_at.isoformat()])
    writer.writerow(["Summary", scan.summary])
    
    raw_data = scan.raw_data or {}
    vt = raw_data.get("virustotal", {})
    writer.writerow(["VirusTotal Malicious", vt.get("malicious", 0)])
    writer.writerow(["VirusTotal Harmless", vt.get("harmless", 0)])
    
    if scan.type == "ip":
        abuse = raw_data.get("abuseipdb", {})
        writer.writerow(["AbuseIPDB Score", abuse.get("abuseConfidenceScore", 0)])
        writer.writerow(["AbuseIPDB Reports", abuse.get("totalReports", 0)])
        gn = raw_data.get("greynoise", {})
        writer.writerow(["GreyNoise Classification", gn.get("classification", "unknown")])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.read().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=threatmap_scan_{scan.indicator}.csv"}
    )


def _export_pdf(scan: Scan):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=letter,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=16
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=24
    )
    
    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=16,
        spaceAfter=8
    )
    
    normal_style = ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor("#334155"),
        spaceAfter=12,
        leading=14
    )
    
    elements = []
    
    # Header
    elements.append(Paragraph("<b>THREATMAP</b> INTELLIGENCE REPORT", title_style))
    elements.append(Paragraph(f"Automated OSINT Briefing • Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style))
    
    # Basic Info Table
    elements.append(Paragraph("Indicator Summary", heading_style))
    
    info_data = [
        ["Indicator Target:", scan.indicator],
        ["Indicator Type:", scan.type.upper()],
        ["Scan ID:", scan.id],
        ["Scan Date:", scan.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")],
        ["Risk Score:", f"{scan.risk_score} / 100"],
        ["Risk Level:", scan.risk_level]
    ]
    
    info_table = Table(info_data, colWidths=[120, 380])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#f8fafc")),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor("#475569")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0"))
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 16))
    
    # AI Analysis
    elements.append(Paragraph("AI Analyst Brief", heading_style))
    summary_text = scan.summary if scan.summary else "No AI analyst summary was generated for this scan."
    elements.append(Paragraph(summary_text.replace('\n', '<br/>'), normal_style))
    elements.append(Spacer(1, 12))
    
    # OSINT Telemetry
    elements.append(Paragraph("OSINT Vendor Telemetry", heading_style))
    
    raw = scan.raw_data or {}
    telemetry_data = [["Vendor / Source", "Finding / Result"]]
    
    vt = raw.get("virustotal", {})
    vt_malicious = vt.get("malicious", 0)
    vt_total = vt_malicious + vt.get("harmless", 0) + vt.get("suspicious", 0) + vt.get("undetected", 0)
    telemetry_data.append(["VirusTotal", f"{vt_malicious} engines detected as malicious (out of {vt_total})"])
    
    if scan.type == "ip":
        abuse = raw.get("abuseipdb", {})
        gn = raw.get("greynoise", {})
        ipinfo = raw.get("ipinfo", {})
        
        telemetry_data.append(["AbuseIPDB", f"{abuse.get('abuseConfidenceScore', 0)}% abuse confidence with {abuse.get('totalReports', 0)} reports"])
        telemetry_data.append(["GreyNoise", f"Classification: {gn.get('classification', 'unknown')}"])
        telemetry_data.append(["IPInfo (ASN)", f"Network: {ipinfo.get('org', 'Unknown')}"])
        
    elif scan.type == "domain":
        whois = raw.get("whois_records", {})
        telemetry_data.append(["WHOIS Registrar", whois.get('registrar', 'Unknown')])
        telemetry_data.append(["Creation Date", str(whois.get('creation_date', 'Unknown'))])
        
    tel_table = Table(telemetry_data, colWidths=[150, 350])
    tel_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0"))
    ]))
    
    elements.append(tel_table)
    
    # Footer Note
    elements.append(Spacer(1, 40))
    elements.append(Paragraph("<i>This report was automatically generated by ThreatMap. Findings are aggregated from third-party OSINT sources and should be manually verified by a security analyst.</i>", normal_style))
    
    doc.build(elements)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=threatmap_report_{scan.indicator}.pdf"}
    )


@router.get("/stix/{scan_id}")
def export_stix(scan_id: str, db: Session = Depends(get_db)):
    """Export scan data as STIX 2.1 bundle JSON."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    raw = scan.raw_data or {}
    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    # Build the STIX indicator pattern
    if scan.type == "ip":
        pattern = f"[ipv4-addr:value = '{scan.indicator}']"
        stix_type = "ipv4-addr"
    elif scan.type == "domain":
        pattern = f"[domain-name:value = '{scan.indicator}']"
        stix_type = "domain-name"
    elif scan.type == "url":
        pattern = f"[url:value = '{scan.indicator}']"
        stix_type = "url"
    elif scan.type == "hash":
        pattern = f"[file:hashes.SHA256 = '{scan.indicator}']"
        stix_type = "file"
    else:
        pattern = f"[artifact:payload_bin = '{scan.indicator}']"
        stix_type = "artifact"

    indicator_id = f"indicator--{scan.id}"
    report_id = f"report--{scan.id}"

    stix_bundle = {
        "type": "bundle",
        "id": f"bundle--{scan.id}",
        "spec_version": "2.1",
        "objects": [
            {
                "type": "indicator",
                "spec_version": "2.1",
                "id": indicator_id,
                "created": now,
                "modified": now,
                "name": f"ThreatMap IOC: {scan.indicator}",
                "description": scan.summary or f"Automated OSINT scan of {scan.indicator}",
                "indicator_types": ["malicious-activity"] if scan.risk_score >= 50 else ["anomalous-activity"],
                "pattern": pattern,
                "pattern_type": "stix",
                "valid_from": now,
                "confidence": min(100, scan.risk_score),
                "labels": [scan.risk_level.lower()],
            },
            {
                "type": "report",
                "spec_version": "2.1",
                "id": report_id,
                "created": now,
                "modified": now,
                "name": f"ThreatMap Scan Report: {scan.indicator}",
                "description": f"Automated OSINT intelligence report. Risk Score: {scan.risk_score}/100. Level: {scan.risk_level}.",
                "published": now,
                "report_types": ["threat-report"],
                "object_refs": [indicator_id],
                "external_references": [
                    {
                        "source_name": "ThreatMap",
                        "url": f"http://localhost:3000/results/{scan.id}",
                        "description": "ThreatMap scan result"
                    }
                ],
            }
        ]
    }

    stix_json = json.dumps(stix_bundle, indent=2).encode("utf-8")
    return Response(
        content=stix_json,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=threatmap_stix_{scan.indicator}.json"}
    )
