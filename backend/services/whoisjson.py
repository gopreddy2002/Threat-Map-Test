import asyncio
import logging
import random
from typing import Dict, Any

logger = logging.getLogger(__name__)

class WhoisJsonService:
    def __init__(self):
        self.api_key = "43b0c1aa36fcb49caab044a866c2052e5681b137e71e5d9fb94f3057fde7081b"
        self.base_url = "https://api.whoisjson.fake/v1" # Mock endpoint

    async def get_domain_data(self, domain: str) -> Dict[str, Any]:
        """
        Simulates fetching comprehensive WHOIS/DNS data from WhoisJSON.
        """
        try:
            # Simulate network latency (200-500ms)
            await asyncio.sleep(random.uniform(0.2, 0.5))

            is_malicious = "malicious" in domain.lower() or "phish" in domain.lower()
            
            # Subdomains mock
            subdomains = ["www", "mail", "api", "dev", "test", "staging", "admin"]
            active_subs = random.sample(subdomains, random.randint(1, 5))
            active_subs = [f"{sub}.{domain}" for sub in active_subs]

            return {
                "status": "success",
                "registrar_metadata": {
                    "name": "Cloudflare, Inc." if not is_malicious else "Namecheap, Inc.",
                    "iana_id": "1337" if not is_malicious else "1068",
                    "url": "http://www.cloudflare.com" if not is_malicious else "http://www.namecheap.com"
                },
                "registry_dates": {
                    "creation_date": "2010-01-15T00:00:00Z" if not is_malicious else "2024-05-10T00:00:00Z",
                    "updated_date": "2023-01-10T00:00:00Z",
                    "expiration_date": "2026-01-15T00:00:00Z" if not is_malicious else "2025-05-10T00:00:00Z"
                },
                "epp_status": [
                    "clientTransferProhibited",
                    "clientUpdateProhibited",
                    "clientDeleteProhibited"
                ],
                "contacts": {
                    "registrant": {
                        "name": "REDACTED FOR PRIVACY",
                        "organization": "Privacy Protect, LLC",
                        "email": "contact@privacyprotect.fake",
                        "country": "IS"
                    },
                    "admin": {
                        "name": "REDACTED FOR PRIVACY",
                        "organization": "Privacy Protect, LLC",
                        "email": "admin@privacyprotect.fake"
                    },
                    "tech": {
                        "name": "REDACTED FOR PRIVACY",
                        "organization": "Privacy Protect, LLC",
                        "email": "tech@privacyprotect.fake"
                    }
                },
                "dns_records": {
                    "A": [f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}"],
                    "AAAA": ["2606:4700:4700::1111"],
                    "MX": [f"mail.{domain} (Priority: 10)"],
                    "TXT": [
                        "v=spf1 include:_spf.google.com ~all",
                        "google-site-verification=xyz123"
                    ],
                    "NS": [f"ns1.{domain}", f"ns2.{domain}"],
                    "CNAME": [],
                    "SOA": [f"ns1.{domain} admin.{domain} 2024010101 7200 3600 1209600 3600"],
                    "CAA": ["0 issue \"letsencrypt.org\""],
                    "DMARC": ["v=DMARC1; p=reject; rua=mailto:dmarc@example.com"]
                },
                "ssl_tls_state": {
                    "status": "valid" if not is_malicious else "invalid_or_expired",
                    "issuer": "Let's Encrypt Authority X3",
                    "cipher": "TLS_AES_256_GCM_SHA384",
                    "valid_from": "2024-01-01T00:00:00Z",
                    "valid_to": "2024-04-01T00:00:00Z"
                },
                "active_subdomains": active_subs,
                "availability": "registered",
                "reverse_whois_count": random.randint(1, 50) if not is_malicious else random.randint(50, 500)
            }
        except Exception as e:
            logger.error(f"WhoisJSON query failed for {domain}: {e}")
            return {"status": "error", "message": str(e)}

whoisjson_service = WhoisJsonService()
