import csv
import uuid
import datetime
import logging
from io import BytesIO, StringIO
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from models.database import get_db, Scan
from core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bulk-upload", tags=["Bulk Upload"])

# Helper to normalize headers to standardized keys
def normalize_header(header: str) -> str:
    if not header:
        return ""
    h = header.strip().lower().replace(" ", "_").replace("-", "_")
    if h in ["ip_address", "ip", "ipaddress"]:
        return "IP_Address"
    if h in ["domain", "domain_name", "host"]:
        return "Domain"
    if h in ["url", "uri", "link"]:
        return "URL"
    if h in ["hash", "md5", "sha256", "sha1", "file_hash"]:
        return "Hash"
    if h in ["threat_type", "threattype", "type", "category"]:
        return "Threat_Type"
    if h in ["severity", "risk", "level"]:
        return "Severity"
    if h in ["source", "reporter", "origin"]:
        return "Source"
    if h in ["country", "country_code", "location"]:
        return "Country"
    if h in ["description", "summary", "notes", "desc"]:
        return "Description"
    return header

# Get severity risk score and level
def map_severity(severity_str: Optional[str]) -> tuple[int, str]:
    if not severity_str:
        return 20, "LOW"
    sev = severity_str.strip().upper()
    if sev in ["CRITICAL", "RED", "90", "100"]:
        return 95, "CRITICAL"
    if sev in ["HIGH", "ORANGE", "70", "80"]:
        return 80, "HIGH"
    if sev in ["MEDIUM", "YELLOW", "40", "50", "60"]:
        return 50, "MEDIUM"
    if sev in ["LOW", "GREEN", "10", "20", "30"]:
        return 20, "LOW"
    return 20, "LOW"

@router.get("/template")
def download_template():
    """
    Generates and returns the downloadable CSV template.
    """
    headers = [
        "IP_Address", "Domain", "URL", "Hash",
        "Threat_Type", "Severity", "Source", "Country", "Description"
    ]
    examples = [
        ["192.168.1.100", "", "", "", "Botnet C2", "High", "Internal Threat Intel", "US", "Active C2 beaconing detected"],
        ["", "badsite.com", "", "", "Phishing", "Medium", "PhishTank", "CN", "Reported credential harvesting domain"],
        ["", "", "http://malicious.ru/payload.exe", "", "Malware Distribution", "Critical", "AlienVault", "RU", "Active host of ransomware binaries"],
        ["", "", "", "44d88612fea8a8f36de82e1278abb02f", "Ransomware", "High", "VirusTotal", "DE", "LockBit ransomware variant hash"]
    ]
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(examples)
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=threat_intel_bulk_template.csv"}
    )

@router.post("/upload")
async def upload_bulk_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Accepts CSV, XLSX, XLS file uploads, parses them, validates data,
    saves valid non-duplicate indicators, and returns stats.
    """
    filename = file.filename or ""
    extension = filename.split(".")[-1].lower() if "." in filename else ""
    
    if extension not in ["csv", "xlsx", "xls"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format: '.{extension}'. Only .csv, .xlsx, and .xls are supported."
        )
    
    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty."
        )
        
    records = []
    headers = []
    
    # --- Parse file based on extension ---
    try:
        if extension == "csv":
            try:
                decoded = contents.decode("utf-8")
            except UnicodeDecodeError:
                # Fallback to latin-1
                decoded = contents.decode("latin-1")
                
            csv_reader = csv.reader(StringIO(decoded))
            rows = list(csv_reader)
            if not rows or len(rows) < 1:
                raise HTTPException(status_code=400, detail="The file does not contain any rows.")
            
            headers = [normalize_header(h) for h in rows[0]]
            for row_idx, r in enumerate(rows[1:], start=2):
                if not r or all(cell.strip() == "" for cell in r):
                    continue # skip empty rows
                
                # Zip headers with row cells, padding with empty strings if row is shorter
                row_dict = {}
                for idx, col_name in enumerate(headers):
                    val = r[idx].strip() if idx < len(r) else ""
                    row_dict[col_name] = val
                records.append((row_idx, row_dict))
                
        elif extension == "xlsx":
            try:
                import openpyxl
            except ImportError:
                raise HTTPException(status_code=500, detail="Excel parser dependencies (openpyxl) are not loaded yet.")
            
            wb = openpyxl.load_workbook(filename=BytesIO(contents), data_only=True, read_only=True)
            sheet = wb.active
            if not sheet:
                raise HTTPException(status_code=400, detail="Could not find an active sheet in Excel file.")
                
            rows_iter = sheet.iter_rows(values_only=True)
            rows = [list(r) for r in rows_iter if r is not None]
            if not rows or len(rows) < 1:
                raise HTTPException(status_code=400, detail="The file does not contain any rows.")
            
            # Extract header and normalize
            headers = [normalize_header(str(h)) if h is not None else f"empty_{i}" for i, h in enumerate(rows[0])]
            
            for row_idx, r in enumerate(rows[1:], start=2):
                if not r or all(cell is None or str(cell).strip() == "" for cell in r):
                    continue # skip empty rows
                
                row_dict = {}
                for idx, col_name in enumerate(headers):
                    val = str(r[idx]).strip() if (idx < len(r) and r[idx] is not None) else ""
                    row_dict[col_name] = val
                records.append((row_idx, row_dict))
                
        elif extension == "xls":
            try:
                import xlrd
            except ImportError:
                raise HTTPException(status_code=500, detail="Excel legacy parser dependencies (xlrd) are not loaded yet.")
            
            wb = xlrd.open_workbook(file_contents=contents)
            sheet = wb.sheet_by_index(0)
            if not sheet or sheet.nrows < 1:
                raise HTTPException(status_code=400, detail="The Excel sheet is empty.")
                
            # Extract header
            header_row = [sheet.cell_value(0, col_idx) for col_idx in range(sheet.ncols)]
            headers = [normalize_header(str(h)) if h != "" else f"empty_{i}" for i, h in enumerate(header_row)]
            
            for row_idx in range(1, sheet.nrows):
                row_vals = [sheet.cell_value(row_idx, col_idx) for col_idx in range(sheet.ncols)]
                if all(str(cell).strip() == "" for cell in row_vals):
                    continue # skip empty rows
                
                row_dict = {}
                for idx, col_name in enumerate(headers):
                    val = str(row_vals[idx]).strip() if (idx < len(row_vals) and row_vals[idx] != "") else ""
                    # Handle floats like 192.168 if parsed as numbers or simple numeric values
                    if isinstance(row_vals[idx], float) and row_vals[idx].is_integer():
                        val = str(int(row_vals[idx]))
                    row_dict[col_name] = val
                records.append((row_idx + 1, row_dict))
    except HTTPException:
        raise
    except Exception as parse_err:
        logger.error(f"Error parsing uploaded bulk file: {parse_err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse the file: {str(parse_err)}"
        )

    # --- Validate headers ---
    indicator_cols = ["IP_Address", "Domain", "URL", "Hash"]
    found_indicator_col = any(col in headers for col in indicator_cols)
    if not found_indicator_col:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Required indicator column missing. The file must contain at least one of: IP_Address, Domain, URL, or Hash."
        )

    # --- Process records ---
    imported_count = 0
    duplicate_count = 0
    invalid_count = 0
    total_count = 0
    
    seen_in_session = set()
    errors = []
    
    for row_num, rec in records:
        # Determine if row has at least one valid indicator
        ip_val = rec.get("IP_Address", "")
        domain_val = rec.get("Domain", "")
        url_val = rec.get("URL", "")
        hash_val = rec.get("Hash", "")
        
        indicators_to_process = []
        if ip_val:
            indicators_to_process.append((ip_val, "ip"))
        if domain_val:
            indicators_to_process.append((domain_val, "domain"))
        if url_val:
            indicators_to_process.append((url_val, "url"))
        if hash_val:
            indicators_to_process.append((hash_val, "hash"))
            
        if not indicators_to_process:
            invalid_count += 1
            total_count += 1
            errors.append(f"Row {row_num}: No valid indicator found in columns IP_Address, Domain, URL, or Hash.")
            continue
            
        threat_type = rec.get("Threat_Type", "Malicious Infrastructure")
        severity = rec.get("Severity", "Medium")
        source = rec.get("Source", "Bulk Upload")
        country = rec.get("Country", "")
        description = rec.get("Description", "")
        
        row_has_imported = False
        row_has_duplicate = False
        row_has_invalid = False
        
        for val, itype in indicators_to_process:
            val_clean = val.strip()
            # Simple format sanity check
            if len(val_clean) < 3:
                row_has_invalid = True
                errors.append(f"Row {row_num}: Indicator value '{val_clean}' too short for type '{itype}'.")
                continue
                
            # Check for duplicate in session
            session_key = (val_clean.lower(), itype)
            if session_key in seen_in_session:
                row_has_duplicate = True
                continue
                
            seen_in_session.add(session_key)
            
            # Check database for duplicates
            existing = db.query(Scan).filter(Scan.indicator == val_clean).first()
            if existing:
                row_has_duplicate = True
                continue
                
            # Map severity to score/level
            risk_score, risk_level = map_severity(severity)
            
            # Create a Scan entry
            scan_id = str(uuid.uuid4())
            raw_meta = {
                "ip_address": ip_val if itype == "ip" else "",
                "domain": domain_val if itype == "domain" else "",
                "url": url_val if itype == "url" else "",
                "hash": hash_val if itype == "hash" else "",
                "threat_type": threat_type,
                "severity": severity,
                "source": source,
                "country": country,
                "description": description,
                "bulk_uploaded": True,
                "upload_time": datetime.datetime.utcnow().isoformat()
            }
            
            db_scan = Scan(
                id=scan_id,
                indicator=val_clean,
                type=itype,
                risk_score=risk_score,
                risk_level=risk_level,
                summary=description or f"Bulk uploaded threat indicator: {threat_type}",
                raw_data=raw_meta,
                created_at=datetime.datetime.utcnow()
            )
            
            try:
                db.add(db_scan)
                db.commit()
                row_has_imported = True
            except Exception as db_err:
                db.rollback()
                logger.error(f"Failed to import bulk indicator {val_clean}: {db_err}")
                row_has_invalid = True
                errors.append(f"Row {row_num}: Database error inserting indicator '{val_clean}'.")
                
        # Aggregate counts per row
        total_count += 1
        if row_has_imported:
            imported_count += 1
        elif row_has_duplicate:
            duplicate_count += 1
        elif row_has_invalid:
            invalid_count += 1
            
    return {
        "total": total_count,
        "imported": imported_count,
        "duplicates": duplicate_count,
        "invalid": invalid_count,
        "errors": errors[:50] # Limit to first 50 errors for display sanity
    }

@router.get("/indicators")
def list_bulk_indicators(
    page: int = 1,
    size: int = 10,
    search: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    order: Optional[str] = "desc",
    db: Session = Depends(get_db)
):
    """
    Returns paginated, searchable, sortable list of bulk-uploaded indicators.
    """
    # 1. Base query checking for bulk_uploaded indicator inside raw_data JSON
    if "sqlite" in settings.DATABASE_URL:
        # SQLite json_extract
        query = db.query(Scan).filter(
            func.json_extract(Scan.raw_data, "$.bulk_uploaded") == True
        )
    else:
        # PostgreSQL json path operator ->>
        query = db.query(Scan).filter(
            Scan.raw_data["bulk_uploaded"].as_boolean() == True
        )
        
    # 2. Search filter
    if search:
        search_pat = f"%{search}%"
        
        # Build search filters over indicator, type, risk_level, summary
        search_filters = [
            Scan.indicator.ilike(search_pat),
            Scan.type.ilike(search_pat),
            Scan.risk_level.ilike(search_pat),
            Scan.summary.ilike(search_pat)
        ]
        query = query.filter(or_(*search_filters))
        
    # 3. Sorting
    sort_column = Scan.created_at
    if sort_by == "indicator":
        sort_column = Scan.indicator
    elif sort_by == "type":
        sort_column = Scan.type
    elif sort_by == "risk_level":
        sort_column = Scan.risk_level
    elif sort_by == "risk_score":
        sort_column = Scan.risk_score
        
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
        
    # 4. Pagination
    total_records = query.count()
    offset = (page - 1) * size
    scans = query.offset(offset).limit(size).all()
    
    results = []
    for s in scans:
        raw = s.raw_data or {}
        results.append({
            "id": s.id,
            "indicator": s.indicator,
            "type": s.type,
            "risk_score": s.risk_score,
            "risk_level": s.risk_level,
            "summary": s.summary,
            "threat_type": raw.get("threat_type", "Malicious Infrastructure"),
            "severity": raw.get("severity", s.risk_level),
            "source": raw.get("source", "Bulk Upload"),
            "country": raw.get("country", ""),
            "description": raw.get("description", s.summary),
            "created_at": s.created_at
        })
        
    return {
        "items": results,
        "total": total_records,
        "page": page,
        "size": size,
        "pages": (total_records + size - 1) // size if size > 0 else 1
    }
