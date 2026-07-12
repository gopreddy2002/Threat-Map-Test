from typing import Any, Dict


class DomainScanService:
    """Explicit placeholder; never emits simulated scan telemetry."""

    async def get_scan_data(self, indicator: str) -> Dict[str, Any]:
        return {
            "provider": "domainscan",
            "status": "unavailable",
            "data": None,
            "detail": "DomainScan provider is not configured for live lookups.",
        }


domainscan_service = DomainScanService()
