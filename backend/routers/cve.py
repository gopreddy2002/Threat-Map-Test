from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/cve", tags=["CVE Checker"])

@router.get("/{cve_id}")
async def check_cve(cve_id: str):
    # Mocking NVD API or returning demo data
    # Real implementation would call https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}
    
    return {
        "cve_id": cve_id,
        "cvss_score": 9.8,
        "severity": "CRITICAL",
        "description": f"A critical vulnerability exists in the requested product ({cve_id}) allowing remote code execution.",
        "affected_products": ["ExampleProduct v1.0 - 2.5"],
        "remediation": "Apply the latest patch provided by the vendor."
    }
