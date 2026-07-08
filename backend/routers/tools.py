import asyncio
import base64
import binascii
import email.parser
import ipaddress
import json
import urllib.parse
import re
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
import httpx
from core.config import is_configured_secret, settings

try:
    import dns.asyncresolver
except ImportError:
    pass

router = APIRouter(prefix="/tools", tags=["Tools"])

class EmailHeadersRequest(BaseModel):
    raw_headers: str

class DecodeRequest(BaseModel):
    payload: str
    decode_type: str = "auto" # 'auto', 'base64', 'hex'

class GoogleDorkRequest(BaseModel):
    target: str
    mode: str = "domain"

class SpiderFootRequest(BaseModel):
    target: str
    target_type: str = "domain"
    scan_name: Optional[str] = None
    module_list: Optional[str] = None
    type_list: Optional[str] = None
    use_case: str = "passive"

class SpiderFootSearchRequest(BaseModel):
    value: str
    scan_id: Optional[str] = None
    event_type: Optional[str] = None

class SpiderFootConfigUpdateRequest(BaseModel):
    token: str
    allopts: dict

class AwesomeTILookupRequest(BaseModel):
    indicator: str
    indicator_type: str = "auto"

class SocTriageRequest(BaseModel):
    alert_text: str
    artifact_type: str = "auto"
    severity_hint: Optional[str] = None

class DetectionPackRequest(BaseModel):
    indicator: str
    indicator_type: str = "auto"
    title: Optional[str] = None

AWESOME_TI_SOURCES = [
    {
        "id": "ipsum",
        "name": "IPsum",
        "category": "ip_reputation",
        "source": "awesome-threat-intelligence",
        "url": "https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt",
        "api_key_required": False,
        "supported_types": ["ip"],
        "description": "Aggregated suspicious IP feed from public blocklists.",
    },
    {
        "id": "feodo_tracker",
        "name": "Feodo Tracker",
        "category": "botnet_c2",
        "source": "awesome-threat-intelligence",
        "url": "https://feodotracker.abuse.ch/downloads/ipblocklist.txt",
        "api_key_required": False,
        "supported_types": ["ip"],
        "description": "abuse.ch botnet C2 IP blocklist.",
    },
    {
        "id": "sslbl",
        "name": "SSLBL",
        "category": "botnet_c2",
        "source": "awesome-threat-intelligence",
        "url": "https://sslbl.abuse.ch/blacklist/sslipblacklist.csv",
        "api_key_required": False,
        "supported_types": ["ip"],
        "description": "abuse.ch SSLBL botnet C2 IP blacklist.",
    },
    {
        "id": "urlhaus_recent",
        "name": "URLhaus Recent URLs",
        "category": "malware_urls",
        "source": "awesome-threat-intelligence",
        "url": "https://urlhaus.abuse.ch/downloads/csv_recent/",
        "api_key_required": False,
        "supported_types": ["url", "domain", "ip"],
        "description": "Recent malware URLs published by URLhaus.",
    },
    {
        "id": "urlhaus_api",
        "name": "URLhaus API",
        "category": "malware_urls",
        "source": "awesome-threat-intelligence",
        "url": "https://urlhaus-api.abuse.ch/",
        "api_key_required": True,
        "supported_types": ["url", "domain", "ip", "hash"],
        "description": "URL, host, and payload lookups from URLhaus.",
    },
    {
        "id": "threatfox_api",
        "name": "ThreatFox API",
        "category": "ioc_search",
        "source": "awesome-threat-intelligence",
        "url": "https://threatfox.abuse.ch/api/",
        "api_key_required": True,
        "supported_types": ["ip", "domain", "url", "hash"],
        "description": "IOC and hash search for malware infrastructure.",
    },
    {
        "id": "malwarebazaar_api",
        "name": "MalwareBazaar API",
        "category": "malware_hashes",
        "source": "awesome-threat-intelligence",
        "url": "https://bazaar.abuse.ch/api/",
        "api_key_required": True,
        "supported_types": ["hash"],
        "description": "Malware sample metadata by hash.",
    },
]

def _spiderfoot_base_url() -> str:
    return (settings.SPIDERFOOT_BASE_URL or "http://127.0.0.1:5001").rstrip("/")

def _spiderfoot_headers() -> dict:
    headers = {
        "User-Agent": "ThreatMap-SpiderFoot/1.0",
        "Accept": "application/json",
    }
    if settings.SPIDERFOOT_API_KEY:
        headers["X-API-Key"] = settings.SPIDERFOOT_API_KEY
        headers["Authorization"] = f"Bearer {settings.SPIDERFOOT_API_KEY}"
    return headers

def _spiderfoot_auth():
    if settings.SPIDERFOOT_USERNAME and settings.SPIDERFOOT_PASSWORD:
        return httpx.DigestAuth(settings.SPIDERFOOT_USERNAME, settings.SPIDERFOOT_PASSWORD)
    return None

def _spiderfoot_parse_response(resp: httpx.Response):
    try:
        return resp.json()
    except Exception:
        return {"raw": resp.text[:5000]}

def _spiderfoot_unavailable(last_error: Optional[str] = None) -> dict:
    base_url = _spiderfoot_base_url()
    return {
        "source": "spiderfoot",
        "status": "unavailable",
        "web_url": base_url,
        "detail": "ThreatMap could not reach the SpiderFoot API. Start SpiderFoot and set SPIDERFOOT_BASE_URL if it runs somewhere else.",
        "last_error": last_error,
        "setup": [
            "Clone https://github.com/smicallef/spiderfoot.git or use your existing SpiderFoot install.",
            "Start the SpiderFoot web server, commonly on http://127.0.0.1:5001.",
            "Set SPIDERFOOT_BASE_URL to the SpiderFoot server URL.",
            "Set SPIDERFOOT_USERNAME and SPIDERFOOT_PASSWORD if the SpiderFoot server uses digest auth.",
            "Set SPIDERFOOT_API_KEY if your deployment requires a custom API key header.",
        ],
    }

async def _spiderfoot_request(path: str, method: str = "GET", params: Optional[dict] = None, data: Optional[dict] = None) -> dict:
    url = f"{_spiderfoot_base_url()}{path}"
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True, auth=_spiderfoot_auth()) as client:
            if method.upper() == "POST":
                resp = await client.post(url, data=data or {}, headers=_spiderfoot_headers())
            else:
                resp = await client.get(url, params=params or {}, headers=_spiderfoot_headers())

        if resp.status_code >= 400:
            return {
                "source": "spiderfoot",
                "status": "error",
                "endpoint": path,
                "status_code": resp.status_code,
                "detail": resp.text[:500],
            }

        return {
            "source": "spiderfoot",
            "status": "success",
            "endpoint": path,
            "data": _spiderfoot_parse_response(resp),
        }
    except Exception as e:
        return _spiderfoot_unavailable(str(e))

def _scan_id_from_response(data):
    if isinstance(data, list) and data:
        return data[1] if data[0] == "SUCCESS" and len(data) > 1 else None
    if isinstance(data, dict):
        return data.get("id") or data.get("scan_id") or data.get("scanId") or data.get("scan")
    if isinstance(data, str):
        return data
    return None

def _detect_indicator_type(indicator: str) -> str:
    value = indicator.strip()
    if re.fullmatch(r"[A-Fa-f0-9]{32}|[A-Fa-f0-9]{40}|[A-Fa-f0-9]{64}", value):
        return "hash"
    try:
        ipaddress.ip_address(value)
        return "ip"
    except ValueError:
        pass
    if value.startswith(("http://", "https://")):
        return "url"
    if "@" in value and "." in value:
        return "email"
    if "." in value:
        return "domain"
    return "keyword"

def _extract_soc_observables(text: str) -> dict:
    ip_regex = r"\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b"
    domain_regex = r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b"
    url_regex = r"https?://[^\s\"'<>]+"
    hash_regex = r"\b[A-Fa-f0-9]{32}\b|\b[A-Fa-f0-9]{40}\b|\b[A-Fa-f0-9]{64}\b"
    email_regex = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    cve_regex = r"\bCVE-\d{4}-\d{4,7}\b"
    technique_regex = r"\bT\d{4}(?:\.\d{3})?\b"

    urls = sorted(set(re.findall(url_regex, text, flags=re.IGNORECASE)))
    ips = sorted(set(re.findall(ip_regex, text)))
    hashes = sorted(set(re.findall(hash_regex, text)))
    emails = sorted(set(re.findall(email_regex, text, flags=re.IGNORECASE)))
    cves = sorted(set(match.upper() for match in re.findall(cve_regex, text, flags=re.IGNORECASE)))
    techniques = sorted(set(match.upper() for match in re.findall(technique_regex, text, flags=re.IGNORECASE)))

    url_hosts = set()
    for url_value in urls:
        try:
            host = urllib.parse.urlparse(url_value).hostname
            if host:
                url_hosts.add(host.lower())
        except Exception:
            pass

    domains = sorted(
        set(d.lower() for d in re.findall(domain_regex, text))
        - set(em.split("@")[-1].lower() for em in emails)
        - url_hosts
    )

    return {
        "ips": ips,
        "domains": domains,
        "urls": urls,
        "hashes": hashes,
        "emails": emails,
        "cves": cves,
        "mitre_techniques": techniques,
    }

def _first_observable(observables: dict) -> tuple[Optional[str], str]:
    for key, obs_type in [("ips", "ip"), ("urls", "url"), ("domains", "domain"), ("hashes", "hash"), ("emails", "email")]:
        values = observables.get(key) or []
        if values:
            return values[0], obs_type
    return None, "unknown"

async def _fetch_cisa_kev(cve: str) -> dict:
    source = {
        "id": "cisa_kev",
        "name": "CISA Known Exploited Vulnerabilities",
        "url": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
    }
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(source["url"])
        if resp.status_code >= 400:
            return {**source, "status": "error", "detail": f"HTTP {resp.status_code}"}
        data = resp.json()
        vulns = data.get("vulnerabilities", []) if isinstance(data, dict) else []
        match = next((item for item in vulns if str(item.get("cveID", "")).upper() == cve.upper()), None)
        return {**source, "status": "success", "matched": bool(match), "data": match}
    except Exception as e:
        return {**source, "status": "unavailable", "detail": str(e)}

async def _fetch_epss(cve: str) -> dict:
    source = {"id": "epss", "name": "FIRST EPSS", "url": "https://api.first.org/data/v1/epss"}
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(source["url"], params={"cve": cve})
        if resp.status_code >= 400:
            return {**source, "status": "error", "detail": f"HTTP {resp.status_code}"}
        data = resp.json()
        rows = data.get("data", []) if isinstance(data, dict) else []
        return {**source, "status": "success", "matched": bool(rows), "data": rows[0] if rows else None}
    except Exception as e:
        return {**source, "status": "unavailable", "detail": str(e)}

def _soc_severity(observables: dict, feed_results: list[dict], vuln_results: list[dict], severity_hint: Optional[str]) -> str:
    if severity_hint:
        normalized = severity_hint.strip().upper()
        if normalized in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}:
            return normalized
    if any(item.get("matched") for item in vuln_results if item.get("id") == "cisa_kev"):
        return "CRITICAL"
    if any(item.get("matched") for item in feed_results):
        return "HIGH"
    if observables.get("hashes") or observables.get("cves"):
        return "MEDIUM"
    return "LOW"

def _build_hunt_queries(indicator: str, indicator_type: str) -> dict:
    field_map = {
        "ip": ("src_ip", "RemoteIP", "source.ip OR destination.ip"),
        "domain": ("query", "RemoteUrl", "dns.question.name OR url.domain"),
        "url": ("url", "RemoteUrl", "url.full"),
        "hash": ("file_hash", "SHA256", "file.hash.sha256 OR file.hash.md5"),
        "email": ("sender", "SenderFromAddress", "email.from.address"),
    }
    splunk_field, kql_field, elastic_field = field_map.get(indicator_type, ("_raw", "*", "*"))
    quoted = indicator.replace('"', '\\"')
    return {
        "splunk": f'index=* {splunk_field}="{quoted}" OR "{quoted}"',
        "microsoft_defender_kql": f'SearchQuery = "{quoted}"; search in (DeviceNetworkEvents, DeviceFileEvents, EmailEvents) SearchQuery',
        "sentinel_kql": f'union isfuzzy=true SecurityEvent, DeviceNetworkEvents, DeviceFileEvents, EmailEvents | where * has "{quoted}"',
        "elastic_lucene": f'({elastic_field}: "{quoted}") OR "{quoted}"',
    }

def _build_detection_pack(indicator: str, indicator_type: str, title: Optional[str] = None) -> dict:
    safe_title = title or f"ThreatMap SOC Detection for {indicator_type.upper()} Indicator"
    rule_id = re.sub(r"[^a-zA-Z0-9]+", "_", indicator.lower()).strip("_")[:48] or "indicator"
    escaped = indicator.replace("\\", "\\\\").replace('"', '\\"')
    sigma_field = {
        "ip": "DestinationIp",
        "domain": "QueryName",
        "url": "Url",
        "hash": "Hashes",
        "email": "SenderFromAddress",
    }.get(indicator_type, "CommandLine")

    sigma = f"""title: {safe_title}
id: threatmap-{rule_id}
status: experimental
description: Detects activity involving {indicator}
references:
  - https://github.com/SigmaHQ/sigma
author: ThreatMap
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    {sigma_field}|contains: "{escaped}"
  condition: selection
falsepositives:
  - Legitimate administrator testing
level: medium
"""

    suricata = None
    if indicator_type == "ip":
        suricata = f'alert ip any any -> {indicator} any (msg:"ThreatMap IOC IP {indicator}"; sid:9000001; rev:1;)'
    elif indicator_type == "domain":
        suricata = f'alert dns any any -> any any (msg:"ThreatMap IOC domain {indicator}"; dns.query; content:"{escaped}"; nocase; sid:9000002; rev:1;)'
    elif indicator_type == "url":
        parsed = urllib.parse.urlparse(indicator)
        host = parsed.hostname or indicator
        path = parsed.path or "/"
        suricata = f'alert http any any -> any any (msg:"ThreatMap IOC URL {indicator}"; http.host; content:"{host}"; nocase; http.uri; content:"{path}"; sid:9000003; rev:1;)'

    yara = f"""rule ThreatMap_IOC_{rule_id}
{{
    meta:
        description = "ThreatMap generated indicator rule"
        indicator = "{escaped}"
        source = "ThreatMap SOC Workbench"
    strings:
        $ioc = "{escaped}" nocase
    condition:
        $ioc
}}
"""

    return {
        "sigma": sigma,
        "suricata": suricata,
        "yara": yara,
        "hunt_queries": _build_hunt_queries(indicator, indicator_type),
    }

def _strip_public_feed_lines(text: str) -> list[str]:
    values = []
    for line in text.splitlines():
        clean = line.strip()
        if not clean or clean.startswith("#"):
            continue
        values.append(clean.split(",")[0].split()[0].strip('"'))
    return values

async def _fetch_text_feed(source: dict, indicator: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(source["url"])
        if resp.status_code >= 400:
            return {**source, "status": "error", "detail": f"HTTP {resp.status_code}"}
        values = _strip_public_feed_lines(resp.text)
        matched = indicator in values
        return {
            **source,
            "status": "success",
            "matched": matched,
            "sample_size": len(values),
            "matches": [indicator] if matched else [],
        }
    except Exception as e:
        return {**source, "status": "unavailable", "detail": str(e)}

async def _abusech_post(source: dict, url: str, payload: dict, auth_key: Optional[str]) -> dict:
    if not auth_key:
        return {
            **source,
            "status": "not_configured",
            "detail": "Set ABUSECH_AUTH_KEY to enable this documented abuse.ch API.",
        }
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            resp = await client.post(url, data=payload, headers={"Auth-Key": auth_key, "Accept": "application/json"})
        if resp.status_code >= 400:
            return {**source, "status": "error", "detail": f"HTTP {resp.status_code}: {resp.text[:300]}"}
        data = resp.json()
        query_status = data.get("query_status") if isinstance(data, dict) else None
        return {
            **source,
            "status": "success",
            "matched": query_status == "ok",
            "query_status": query_status,
            "data": data,
        }
    except Exception as e:
        return {**source, "status": "unavailable", "detail": str(e)}

async def _threatfox_post(source: dict, payload: dict, auth_key: Optional[str]) -> dict:
    if not auth_key:
        return {
            **source,
            "status": "not_configured",
            "detail": "Set ABUSECH_AUTH_KEY to enable this documented ThreatFox API.",
        }
    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            resp = await client.post(
                "https://threatfox-api.abuse.ch/api/v1/",
                json=payload,
                headers={"Auth-Key": auth_key, "Accept": "application/json"},
            )
        if resp.status_code >= 400:
            return {**source, "status": "error", "detail": f"HTTP {resp.status_code}: {resp.text[:300]}"}
        data = resp.json()
        query_status = data.get("query_status") if isinstance(data, dict) else None
        return {
            **source,
            "status": "success",
            "matched": query_status == "ok",
            "query_status": query_status,
            "data": data,
        }
    except Exception as e:
        return {**source, "status": "unavailable", "detail": str(e)}

@router.post("/email-headers")
async def analyze_email_headers(request: EmailHeadersRequest):
    try:
        parser = email.parser.HeaderParser()
        msg = parser.parsestr(request.raw_headers)
        
        headers_dict = {}
        for k, v in msg.items():
            k_lower = k.lower()
            if k_lower not in headers_dict:
                headers_dict[k_lower] = []
            headers_dict[k_lower].append(v)

        # Extract key security indicators
        received_hops = headers_dict.get("received", [])
        auth_results = headers_dict.get("authentication-results", [])
        return_path = msg.get("return-path", "")
        from_header = msg.get("from", "")
        
        # Risk Analysis Layer
        risk_score = 0
        red_flags = []
        
        auth_str = " ".join(auth_results).lower()
        if "spf=fail" in auth_str or "spf=softfail" in auth_str:
            risk_score += 30
            red_flags.append("SPF authentication failed")
        
        if "dkim=fail" in auth_str:
            risk_score += 25
            red_flags.append("DKIM signature failed")
            
        if "dmarc=fail" in auth_str and "p=reject" in auth_str:
            risk_score += 30
            red_flags.append("DMARC policy violation (reject)")

        def extract_domain(email_str):
            match = re.search(r'@([\w.-]+)', str(email_str))
            return match.group(1).lower() if match else ""

        from_domain = extract_domain(from_header)
        return_domain = extract_domain(return_path)
        
        if from_domain and return_domain and from_domain != return_domain:
            risk_score += 20
            red_flags.append(f"Sender mismatch: From ({from_domain}) != Return-Path ({return_domain})")

        display_name_match = re.search(r'^(.*?)\s*<', str(from_header))
        if display_name_match and from_domain:
            display_name = display_name_match.group(1).lower().strip(' "\'')
            brands = ["paypal", "microsoft", "apple", "google", "amazon", "bank", "netflix", "facebook"]
            for brand in brands:
                if brand in display_name and brand not in from_domain:
                    risk_score += 20
                    red_flags.append(f"Brand impersonation detected: '{brand}' in display name but domain is {from_domain}")
                    break

        originating_ip = None
        ip_pattern = r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
        for hop in reversed(received_hops):
            ips = re.findall(ip_pattern, str(hop))
            for ip in ips:
                if not ip.startswith("10.") and not ip.startswith("192.168.") and not (ip.startswith("172.") and int(ip.split('.')[1]) in range(16,32)) and not ip.startswith("127."):
                    originating_ip = ip
                    break
            if originating_ip:
                break
        
        if originating_ip:
            from services.abuseipdb import abuse_ipdb_service
            abuse_data = await abuse_ipdb_service.check_ip(originating_ip)
            abuse_score = abuse_data.get("abuseConfidenceScore", 0)
            if abuse_score > 0:
                risk_score += 25
                red_flags.append(f"Originating IP ({originating_ip}) has AbuseIPDB score of {abuse_score}%")

        risk_score = min(risk_score, 100)
        
        if risk_score >= 60:
            risk_level = "HIGH"
        elif risk_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Generate Plain English Verdict with Groq AI
        ai_summary = "Email analyzed successfully."
        if red_flags:
            try:
                from services.groq_service import chat_with_ai
                prompt = f"Analyze these email header findings and write a 1-2 sentence plain-English verdict. Do NOT use markdown or bold text. Be direct and professional. Risk Level: {risk_level}, Score: {risk_score}, Flags: {', '.join(red_flags)}."
                ai_summary = await chat_with_ai(prompt, model="openai/gpt-oss-120b")
            except Exception as e:
                ai_summary = f"This email shows a {risk_level} risk level based on header analysis. Identified flags: {', '.join(red_flags)}."
        else:
            ai_summary = "No significant risk indicators were found in the email headers."

        return {
            "verdict": {
                "risk_level": risk_level,
                "risk_score": risk_score,
                "red_flags": red_flags,
                "summary": ai_summary.strip()
            },
            "summary": {
                "from": from_header,
                "return_path": return_path,
                "hop_count": len(received_hops),
                "auth_results": auth_results,
                "originating_ip": originating_ip
            },
            "headers": headers_dict
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/typosquatting")
async def check_typosquatting(domain: str = Query(..., description="Domain to check")):
    if "." not in domain:
        raise HTTPException(status_code=400, detail="Invalid domain format")
    
    parts = domain.split(".")
    base = parts[0]
    tld = ".".join(parts[1:])
    
    variations = set()
    # Omission
    for i in range(len(base)):
        variations.add(base[:i] + base[i+1:] + "." + tld)
    # Repetition
    for i in range(len(base)):
        variations.add(base[:i] + base[i] + base[i:] + "." + tld)
    # Transposition
    for i in range(len(base)-1):
        variations.add(base[:i] + base[i+1] + base[i] + base[i+2:] + "." + tld)
    
    variations.discard(domain)
    # Limit to 20 variations to avoid extreme overhead
    variations_list = list(variations)[:20]
    
    resolver = dns.asyncresolver.Resolver()
    resolver.timeout = 2.0
    resolver.lifetime = 2.0
    
    results = []
    
    async def check_domain(var):
        try:
            answers = await resolver.resolve(var, "A")
            ips = [rdata.address for rdata in answers]
            return {"domain": var, "resolves": True, "ips": ips}
        except Exception:
            return {"domain": var, "resolves": False, "ips": []}

    tasks = [check_domain(var) for var in variations_list]
    batch_results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for res in batch_results:
        if isinstance(res, dict):
            results.append(res)
            
    active = [r for r in results if r["resolves"]]
    inactive = [r for r in results if not r["resolves"]]
    
    return {
        "original": domain,
        "variations_checked": len(variations_list),
        "active_typosquats": active,
        "inactive_typosquats": inactive
    }

@router.post("/decode")
async def decode_string(req: DecodeRequest):
    payload = req.payload.strip()
    result = None
    detected_type = None

    if req.decode_type in ["auto", "base64"]:
        try:
            # Fix padding
            padded = payload + "=" * ((4 - len(payload) % 4) % 4)
            decoded = base64.b64decode(padded).decode('utf-8', errors='ignore')
            if req.decode_type == "base64" or (decoded and decoded != payload):
                result = decoded
                detected_type = "base64"
        except Exception:
            pass

    if result is None and req.decode_type in ["auto", "hex"]:
        try:
            decoded = binascii.unhexlify(payload.replace(" ", "").replace("0x", "")).decode('utf-8', errors='ignore')
            if req.decode_type == "hex" or decoded:
                result = decoded
                detected_type = "hex"
        except Exception:
            pass

    if result is None:
        return {"decoded": "Could not decode payload", "type": "unknown"}
        
    return {"decoded": result, "type": detected_type}

@router.post("/google-dorks")
async def generate_google_dorks(req: GoogleDorkRequest):
    target = req.target.strip()
    mode = req.mode.strip().lower()

    if not target:
        raise HTTPException(status_code=400, detail="Target cannot be empty")

    if mode not in {"domain", "company", "email", "keyword"}:
        raise HTTPException(status_code=400, detail="Mode must be domain, company, email, or keyword")

    cleaned = target.replace("https://", "").replace("http://", "").strip("/")
    if mode == "domain":
        cleaned = cleaned.split("/")[0]

    def google_url(query: str) -> str:
        return f"https://www.google.com/search?q={urllib.parse.quote_plus(query)}"

    if mode == "domain":
        queries = [
            ("Exposed documents", f"site:{cleaned} filetype:pdf OR filetype:doc OR filetype:xls"),
            ("Directory listings", f"site:{cleaned} intitle:\"index of\""),
            ("Login portals", f"site:{cleaned} inurl:login OR inurl:admin OR intitle:login"),
            ("Config files", f"site:{cleaned} ext:env OR ext:conf OR ext:ini OR ext:log"),
            ("Public backups", f"site:{cleaned} ext:bak OR ext:old OR ext:backup OR ext:sql"),
            ("Error disclosure", f"site:{cleaned} \"stack trace\" OR \"syntax error\" OR \"warning:\""),
            ("Sensitive keywords", f"site:{cleaned} password OR token OR secret OR api_key"),
            ("Subdomains indexed", f"site:*.{cleaned} -site:www.{cleaned}"),
            ("Git exposure", f"site:{cleaned} inurl:.git OR inurl:.svn"),
            ("Cloud storage mentions", f"site:{cleaned} \"s3.amazonaws.com\" OR \"storage.googleapis.com\""),
        ]
    elif mode == "email":
        queries = [
            ("Email mentions", f"\"{cleaned}\""),
            ("Paste mentions", f"\"{cleaned}\" site:pastebin.com OR site:ghostbin.com"),
            ("Credential context", f"\"{cleaned}\" password OR leaked OR breach"),
            ("Document mentions", f"\"{cleaned}\" filetype:pdf OR filetype:doc OR filetype:xls"),
        ]
    elif mode == "company":
        queries = [
            ("Public documents", f"\"{cleaned}\" filetype:pdf OR filetype:ppt OR filetype:xls"),
            ("Hiring tech clues", f"\"{cleaned}\" \"AWS\" OR \"Azure\" OR \"Kubernetes\""),
            ("Exposed portals", f"\"{cleaned}\" inurl:login OR inurl:admin OR inurl:portal"),
            ("Code mentions", f"\"{cleaned}\" site:github.com OR site:gitlab.com"),
            ("Leaks and breaches", f"\"{cleaned}\" leaked OR breach OR credentials"),
        ]
    else:
        queries = [
            ("Exact keyword", f"\"{cleaned}\""),
            ("Documents", f"\"{cleaned}\" filetype:pdf OR filetype:doc OR filetype:xls"),
            ("Code repositories", f"\"{cleaned}\" site:github.com OR site:gitlab.com"),
            ("Past exposure", f"\"{cleaned}\" leak OR breach OR dump"),
        ]

    return {
        "target": target,
        "mode": mode,
        "dorks": [
            {"name": name, "query": query, "url": google_url(query)}
            for name, query in queries
        ],
        "note": "Queries are generated locally. Open links manually and only investigate assets you are authorized to assess.",
    }

@router.get("/awesome-ti/catalog")
async def awesome_ti_catalog():
    auth_configured = is_configured_secret(settings.ABUSECH_AUTH_KEY, min_length=12)
    return {
        "source": "hslatman/awesome-threat-intelligence",
        "status": "success",
        "catalog_url": "https://github.com/hslatman/awesome-threat-intelligence",
        "auth": {"abusech_auth_key_configured": auth_configured},
        "sources": [
            {
                **source,
                "enabled": (not source["api_key_required"]) or auth_configured,
            }
            for source in AWESOME_TI_SOURCES
        ],
    }

@router.get("/awesome-ti/health")
async def awesome_ti_health():
    public_sources = [s for s in AWESOME_TI_SOURCES if not s["api_key_required"]]
    checks = await asyncio.gather(*[_fetch_text_feed(source, "__healthcheck__") for source in public_sources])
    return {
        "source": "hslatman/awesome-threat-intelligence",
        "status": "success",
        "checks": [
            {
                "id": check["id"],
                "name": check["name"],
                "status": check["status"],
                "sample_size": check.get("sample_size"),
                "detail": check.get("detail"),
            }
            for check in checks
        ],
    }

@router.post("/awesome-ti/lookup")
async def awesome_ti_lookup(req: AwesomeTILookupRequest):
    indicator = req.indicator.strip()
    if not indicator:
        raise HTTPException(status_code=400, detail="Indicator cannot be empty")

    indicator_type = req.indicator_type.strip().lower()
    if indicator_type == "auto":
        indicator_type = _detect_indicator_type(indicator)

    auth_key = settings.ABUSECH_AUTH_KEY if is_configured_secret(settings.ABUSECH_AUTH_KEY, min_length=12) else None
    source_map = {source["id"]: source for source in AWESOME_TI_SOURCES}
    tasks = []

    if indicator_type == "ip":
        for source_id in ["ipsum", "feodo_tracker", "sslbl"]:
            tasks.append(_fetch_text_feed(source_map[source_id], indicator))

    if indicator_type in {"url", "domain", "ip"}:
        tasks.append(_fetch_text_feed(source_map["urlhaus_recent"], indicator))
        urlhaus_payload = {"host": indicator} if indicator_type in {"domain", "ip"} else {"url": indicator}
        urlhaus_endpoint = "https://urlhaus-api.abuse.ch/v1/host/" if indicator_type in {"domain", "ip"} else "https://urlhaus-api.abuse.ch/v1/url/"
        tasks.append(_abusech_post(source_map["urlhaus_api"], urlhaus_endpoint, urlhaus_payload, auth_key))
        tasks.append(_threatfox_post(source_map["threatfox_api"], {"query": "search_ioc", "search_term": indicator, "exact_match": True}, auth_key))

    if indicator_type == "hash":
        tasks.append(_abusech_post(source_map["urlhaus_api"], "https://urlhaus-api.abuse.ch/v1/payload/", {"sha256_hash": indicator}, auth_key))
        tasks.append(_abusech_post(source_map["malwarebazaar_api"], "https://mb-api.abuse.ch/api/v1/", {"query": "get_info", "hash": indicator}, auth_key))
        tasks.append(_threatfox_post(source_map["threatfox_api"], {"query": "search_hash", "hash": indicator}, auth_key))

    if not tasks:
        return {
            "source": "hslatman/awesome-threat-intelligence",
            "status": "unsupported",
            "indicator": indicator,
            "indicator_type": indicator_type,
            "detail": "No working source in the curated integration supports this indicator type yet.",
            "results": [],
        }

    results = await asyncio.gather(*tasks)
    matched = [result for result in results if result.get("matched")]
    return {
        "source": "hslatman/awesome-threat-intelligence",
        "status": "success",
        "indicator": indicator,
        "indicator_type": indicator_type,
        "matched_count": len(matched),
        "checked_count": len(results),
        "results": results,
        "note": "Only stable public feeds and documented APIs from the awesome-threat-intelligence catalog are queried. Key-required APIs are skipped until ABUSECH_AUTH_KEY is configured.",
    }

@router.post("/soc/extract")
async def soc_extract_observables(req: SocTriageRequest):
    text = req.alert_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Alert text cannot be empty")
    return {
        "source": "threatmap-soc",
        "status": "success",
        "observables": _extract_soc_observables(text),
    }

@router.post("/soc/detection-pack")
async def soc_detection_pack(req: DetectionPackRequest):
    indicator = req.indicator.strip()
    if not indicator:
        raise HTTPException(status_code=400, detail="Indicator cannot be empty")
    indicator_type = req.indicator_type.strip().lower()
    if indicator_type == "auto":
        indicator_type = _detect_indicator_type(indicator)
    return {
        "source": "threatmap-soc",
        "status": "success",
        "indicator": indicator,
        "indicator_type": indicator_type,
        "content": _build_detection_pack(indicator, indicator_type, req.title),
        "references": [
            "https://github.com/SigmaHQ/sigma",
            "https://suricata.io/",
            "https://virustotal.github.io/yara/",
        ],
    }

@router.post("/soc/triage-pack")
async def soc_triage_pack(req: SocTriageRequest):
    text = req.alert_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Alert text cannot be empty")

    observables = _extract_soc_observables(text)
    primary_indicator, primary_type = _first_observable(observables)
    requested_type = req.artifact_type.strip().lower()
    if requested_type != "auto" and primary_indicator:
        primary_type = requested_type

    feed_results = []
    if primary_indicator and primary_type in {"ip", "domain", "url", "hash"}:
        lookup = await awesome_ti_lookup(AwesomeTILookupRequest(indicator=primary_indicator, indicator_type=primary_type))
        feed_results = lookup.get("results", [])

    vuln_tasks = []
    for cve in observables.get("cves", [])[:5]:
        vuln_tasks.append(_fetch_cisa_kev(cve))
        vuln_tasks.append(_fetch_epss(cve))
    vuln_results = await asyncio.gather(*vuln_tasks) if vuln_tasks else []

    severity = _soc_severity(observables, feed_results, vuln_results, req.severity_hint)
    detection = _build_detection_pack(primary_indicator, primary_type) if primary_indicator else None

    playbook = [
        "Validate the alert source, timestamp, affected asset, user, and detection logic.",
        "Preserve volatile evidence: running processes, network connections, command history, and relevant logs.",
        "Check whether the indicator appears on other hosts, users, email messages, proxy logs, DNS logs, and EDR telemetry.",
        "Contain affected endpoints or accounts if matching malicious evidence is confirmed.",
        "Block confirmed malicious IPs, domains, URLs, and hashes at appropriate controls after change approval.",
        "Open or update an incident case, record decisions, and attach enrichment evidence.",
    ]
    if severity in {"HIGH", "CRITICAL"}:
        playbook.insert(3, "Escalate to incident response lead and begin scope expansion immediately.")
    if observables.get("cves"):
        playbook.append("Prioritize patching or compensating controls for CVEs confirmed in CISA KEV or with elevated EPSS.")

    return {
        "source": "threatmap-soc",
        "status": "success",
        "severity": severity,
        "primary_indicator": primary_indicator,
        "primary_type": primary_type,
        "observables": observables,
        "open_source_enrichment": {
            "feed_results": feed_results,
            "vulnerabilities": vuln_results,
        },
        "playbook": playbook,
        "detection_pack": detection,
        "case_fields": {
            "title": f"{severity} SOC triage - {primary_indicator or 'unclassified alert'}",
            "category": "Threat Intelligence / SOC Triage",
            "recommended_sla": "Immediate" if severity == "CRITICAL" else "4 hours" if severity == "HIGH" else "1 business day",
            "tags": sorted(set(["soc", "triage", primary_type] + observables.get("mitre_techniques", []))),
        },
        "references": [
            "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
            "https://www.first.org/epss/",
            "https://github.com/SigmaHQ/sigma",
            "https://github.com/hslatman/awesome-threat-intelligence",
        ],
    }

@router.post("/spiderfoot")
async def start_spiderfoot_scan(req: SpiderFootRequest):
    target = req.target.strip()
    target_type = req.target_type.strip().lower()
    use_case = req.use_case.strip().lower() or "passive"

    if not target:
        raise HTTPException(status_code=400, detail="Target cannot be empty")

    allowed_types = {"domain", "ip", "email", "username", "phone", "netblock", "hostname"}
    if target_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Target type must be one of: {', '.join(sorted(allowed_types))}")

    allowed_use_cases = {"passive", "all", "investigate", "footprint"}
    if use_case not in allowed_use_cases:
        raise HTTPException(status_code=400, detail=f"Use case must be one of: {', '.join(sorted(allowed_use_cases))}")

    if target_type == "ip":
        try:
            ipaddress.ip_address(target)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid IP address")

    if target_type == "netblock":
        try:
            ipaddress.ip_network(target, strict=False)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid network range")

    base_url = _spiderfoot_base_url()
    scan_name = (req.scan_name or f"ThreatMap {target}").strip()
    module_list = (req.module_list or "").strip()
    type_list = (req.type_list or "").strip()

    payload = {
        "scanname": scan_name,
        "scantarget": target,
        "typelist": type_list,
        "modulelist": module_list,
        "usecase": use_case,
    }

    response = await _spiderfoot_request("/startscan", method="POST", data=payload)
    if response.get("status") != "success":
        return {**response, "target": target, "target_type": target_type}

    data = response.get("data")
    accepted = not (isinstance(data, list) and data and data[0] == "ERROR")
    scan_id = _scan_id_from_response(data)
    if accepted:
        return {
            "source": "spiderfoot",
            "status": "started",
            "target": target,
            "target_type": target_type,
            "scan_name": scan_name,
            "scan_id": scan_id,
            "web_url": base_url,
            "scan_url": f"{base_url}/scanopts?id={scan_id}" if scan_id else f"{base_url}/scanlist",
            "api_response": data,
            "note": "SpiderFoot accepted the scan request. Review results in the SpiderFoot web UI.",
        }

    last_error = data[1] if isinstance(data, list) and len(data) > 1 else str(data)
    return {
        "source": "spiderfoot",
        "status": "error",
        "target": target,
        "target_type": target_type,
        "web_url": base_url,
        "detail": "SpiderFoot did not accept the scan request.",
        "last_error": last_error,
    }

@router.get("/spiderfoot/health")
async def spiderfoot_health():
    response = await _spiderfoot_request("/ping")
    data = response.get("data")
    if response.get("status") == "success" and isinstance(data, list) and data:
        return {
            "source": "spiderfoot",
            "status": "online" if data[0] == "SUCCESS" else "error",
            "version": data[1] if len(data) > 1 else None,
            "web_url": _spiderfoot_base_url(),
            "api_response": data,
        }
    return response

@router.get("/spiderfoot/modules")
async def spiderfoot_modules():
    return await _spiderfoot_request("/modules")

@router.get("/spiderfoot/event-types")
async def spiderfoot_event_types():
    return await _spiderfoot_request("/eventtypes")

@router.get("/spiderfoot/correlation-rules")
async def spiderfoot_correlation_rules():
    return await _spiderfoot_request("/correlationrules")

@router.get("/spiderfoot/scans")
async def spiderfoot_scans():
    return await _spiderfoot_request("/scanlist")

@router.get("/spiderfoot/scans/{scan_id}")
async def spiderfoot_scan_info(scan_id: str):
    return await _spiderfoot_request("/scanopts", params={"id": scan_id})

@router.get("/spiderfoot/scans/{scan_id}/logs")
async def spiderfoot_scan_logs(scan_id: str, limit: int = Query(100, ge=1, le=1000)):
    return await _spiderfoot_request("/scanlog", method="POST", data={"id": scan_id, "limit": str(limit)})

@router.get("/spiderfoot/scans/{scan_id}/summary")
async def spiderfoot_scan_summary(scan_id: str, by: str = Query("type")):
    return await _spiderfoot_request("/scansummary", params={"id": scan_id, "by": by})

@router.get("/spiderfoot/scans/{scan_id}/results")
async def spiderfoot_scan_results(
    scan_id: str,
    event_type: str = Query("ALL"),
    unique: bool = Query(False),
):
    path = "/scaneventresultsunique" if unique else "/scaneventresults"
    return await _spiderfoot_request(path, method="POST", data={"id": scan_id, "eventType": event_type})

@router.get("/spiderfoot/scans/{scan_id}/correlations")
async def spiderfoot_scan_correlations(scan_id: str, correlation_id: Optional[str] = Query(None)):
    if correlation_id:
        return await _spiderfoot_request("/scaneventresults", method="POST", data={"id": scan_id, "correlationId": correlation_id})
    return await _spiderfoot_request("/scancorrelations", method="POST", data={"id": scan_id})

@router.get("/spiderfoot/scans/{scan_id}/export")
async def spiderfoot_scan_export(scan_id: str, export_format: str = Query("json", pattern="^(json|csv|gexf)$")):
    endpoints = {
        "json": "/scanexportjsonmulti",
        "csv": "/scaneventresultexportmulti",
        "gexf": "/scanvizmulti",
    }
    return await _spiderfoot_request(endpoints[export_format], method="POST", data={"ids": scan_id})

@router.post("/spiderfoot/scans/{scan_id}/stop")
async def spiderfoot_stop_scan(scan_id: str):
    return await _spiderfoot_request("/stopscan", params={"id": scan_id})

@router.delete("/spiderfoot/scans/{scan_id}")
async def spiderfoot_delete_scan(scan_id: str):
    return await _spiderfoot_request("/scandelete", params={"id": scan_id})

@router.post("/spiderfoot/search")
async def spiderfoot_search(req: SpiderFootSearchRequest):
    value = req.value.strip()
    if not value:
        raise HTTPException(status_code=400, detail="Search value cannot be empty")
    return await _spiderfoot_request(
        "/search",
        method="POST",
        data={"value": value, "id": req.scan_id, "eventType": req.event_type},
    )

@router.get("/spiderfoot/config")
async def spiderfoot_get_config():
    return await _spiderfoot_request("/optsraw")

@router.post("/spiderfoot/config")
async def spiderfoot_save_config(req: SpiderFootConfigUpdateRequest):
    return await _spiderfoot_request(
        "/savesettingsraw",
        method="POST",
        data={"token": req.token, "allopts": json.dumps(req.allopts)},
    )

@router.get("/dns")
async def enumerate_dns(domain: str = Query(..., description="Domain to enumerate")):
    resolver = dns.asyncresolver.Resolver()
    resolver.timeout = 3.0
    resolver.lifetime = 3.0
    
    record_types = ["A", "AAAA", "MX", "TXT", "NS", "SOA"]
    results = {}
    
    async def fetch_record(rtype):
        try:
            answers = await resolver.resolve(domain, rtype)
            return rtype, [rdata.to_text() for rdata in answers]
        except Exception:
            return rtype, []

    tasks = [fetch_record(rt) for rt in record_types]
    batch_results = await asyncio.gather(*tasks)
    
    for rtype, data in batch_results:
        results[rtype] = data
        
    return {
        "domain": domain,
        "records": results
    }

@router.get("/shodan")
async def shodan_host_lookup(ip: str = Query(..., description="IP to scan via Shodan")):
    try:
        ipaddress.ip_address(ip)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid IP address")

    api_key = settings.SHODAN_API_KEY

    if api_key:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(
                    f"https://api.shodan.io/shodan/host/{ip}",
                    params={"key": api_key},
                )

            if resp.status_code == 200:
                data = resp.json()
                raw_vulns = data.get("vulns") or {}
                vulns = list(raw_vulns.keys()) if isinstance(raw_vulns, dict) else list(raw_vulns)
                services = [
                    {
                        "port": item.get("port"),
                        "transport": item.get("transport"),
                        "product": item.get("product"),
                        "version": item.get("version"),
                        "module": item.get("_shodan", {}).get("module"),
                        "banner": (item.get("data") or "").strip()[:500],
                    }
                    for item in data.get("data", [])[:20]
                ]

                return {
                    "source": "shodan",
                    "ip": data.get("ip_str", ip),
                    "hostnames": data.get("hostnames", []),
                    "domains": data.get("domains", []),
                    "ports": data.get("ports", []),
                    "vulns": vulns,
                    "services": services,
                    "os": data.get("os"),
                    "org": data.get("org"),
                    "isp": data.get("isp"),
                    "asn": data.get("asn"),
                    "country": data.get("country_name"),
                    "city": data.get("city"),
                    "last_update": data.get("last_update"),
                    "status": "success",
                }

            if resp.status_code == 404:
                return {"source": "shodan", "ip": ip, "status": "not_found", "detail": "No Shodan data found for this IP."}

            return {
                "source": "shodan",
                "ip": ip,
                "status": "error",
                "detail": f"Shodan API returned {resp.status_code}",
                "response": resp.text[:300],
            }
        except Exception as e:
            # Fall through to InternetDB below for a lightweight backup.
            shodan_error = str(e)
    else:
        shodan_error = "SHODAN_API_KEY is not configured"

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"https://internetdb.shodan.io/{ip}", timeout=5.0)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "source": "internetdb",
                    "ip": ip,
                    "ports": data.get("ports", []),
                    "vulns": data.get("vulns", []),
                    "hostnames": data.get("hostnames", []),
                    "cpes": data.get("cpes", []),
                    "tags": data.get("tags", []),
                    "status": "success",
                    "shodan_error": shodan_error,
                }
            elif resp.status_code == 404:
                return {"source": "internetdb", "ip": ip, "status": "not_found", "message": "No data found in Shodan or InternetDB", "shodan_error": shodan_error}
            else:
                return {"source": "internetdb", "ip": ip, "status": "error", "error": f"InternetDB returned {resp.status_code}", "shodan_error": shodan_error}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mac")
async def mac_lookup(mac: str = Query(..., description="MAC Address")):
    try:
        # url encode mac just in case
        safe_mac = urllib.parse.quote(mac)
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"https://api.macvendors.com/{safe_mac}", timeout=5.0)
            if resp.status_code == 200:
                return {"mac": mac, "vendor": resp.text}
            elif resp.status_code == 404:
                return {"mac": mac, "vendor": "Unknown"}
            else:
                return {"error": f"MAC API returned {resp.status_code}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/network-range")
async def network_range(cidr: str = Query(..., description="CIDR block e.g. 192.168.1.0/24")):
    try:
        network = ipaddress.ip_network(cidr, strict=False)
        num_addresses = network.num_addresses
        
        # Sample first 3 and last 3 to check Shodan InternetDB
        hosts = list(network.hosts())
        samples = []
        if len(hosts) <= 6:
            samples = hosts
        else:
            samples = hosts[:3] + hosts[-3:]
            
        async def check_ip(ip_obj):
            ip_str = str(ip_obj)
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(f"https://internetdb.shodan.io/{ip_str}", timeout=2.0)
                    if resp.status_code == 200:
                        data = resp.json()
                        return {"ip": ip_str, "ports": data.get("ports", []), "hostnames": data.get("hostnames", [])}
            except Exception:
                pass
            return {"ip": ip_str, "ports": [], "hostnames": []}
            
        tasks = [check_ip(ip) for ip in samples]
        sample_results = await asyncio.gather(*tasks)

        return {
            "cidr": cidr,
            "network_address": str(network.network_address),
            "broadcast_address": str(network.broadcast_address),
            "num_addresses": num_addresses,
            "netmask": str(network.netmask),
            "version": network.version,
            "sample_shodan_checks": sample_results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/http-headers")
async def analyze_http_headers(url: str = Query(..., description="URL to analyze")):
    if not url.startswith("http"):
        url = "https://" + url
        
    try:
        async with httpx.AsyncClient(verify=False) as client:
            resp = await client.get(url, timeout=10.0, follow_redirects=True)
            
            headers = dict(resp.headers)
            security_headers = {
                "Strict-Transport-Security": headers.get("strict-transport-security"),
                "Content-Security-Policy": headers.get("content-security-policy"),
                "X-Frame-Options": headers.get("x-frame-options"),
                "X-Content-Type-Options": headers.get("x-content-type-options"),
                "Server": headers.get("server"),
                "X-Powered-By": headers.get("x-powered-by")
            }
            
            # Grade basic presence
            score = 100
            missing = []
            for h in ["Strict-Transport-Security", "Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options"]:
                if not security_headers[h]:
                    score -= 20
                    missing.append(h)
                    
            if security_headers["Server"] or security_headers["X-Powered-By"]:
                score -= 10 # Information disclosure
                
            return {
                "url": url,
                "final_url": str(resp.url),
                "status_code": resp.status_code,
                "score": max(0, score),
                "missing_headers": missing,
                "security_headers": security_headers,
                "all_headers": headers
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
