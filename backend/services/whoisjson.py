from typing import Any, Dict


class WhoisJsonService:
    """Explicit placeholder until a real WhoisJSON provider is configured."""

    async def get_domain_data(self, domain: str) -> Dict[str, Any]:
        return {
            "provider": "whoisjson",
            "status": "unavailable",
            "data": None,
            "detail": "WhoisJSON provider is not configured for live lookups.",
        }


whoisjson_service = WhoisJsonService()
