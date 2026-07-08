import os
import tempfile
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional

DEFAULT_DATABASE_URL = (
    f"sqlite:///{os.path.join(tempfile.gettempdir(), 'threatmap.db')}"
    if os.environ.get("VERCEL")
    else "sqlite:///./threatmap.db"
)

class Settings(BaseSettings):
    PROJECT_NAME: str = "ThreatMap API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = Field(
        default=DEFAULT_DATABASE_URL,
        description="SQLAlchemy PostgreSQL connection string or local SQLite fallback."
    )
    
    # Redis Cache (Upstash)
    REDIS_URL: Optional[str] = Field(
        default=None,
        description="Redis connection URL"
    )
    UPSTASH_REDIS_REST_URL: str = "your_url"
    UPSTASH_REDIS_REST_TOKEN: str = "your_link"
    
    # Security API Keys (Defaulted to the provided keys for zero-setup ease of evaluation)
    VIRUSTOTAL_API_KEY: str = "YOUR_API_KEY"
    ABUSEIPDB_API_KEY: str = "YOUR_API_KEY"
    IPINFO_API_TOKEN: str = "YOUR_API_KEY"
    GEMINI_API_KEY: str = "YOUR_API_KEY"
    ALIENVAULT_API_KEY: str = "YOUR_API_KEY"
    URLSCAN_API_KEY: str = "YOUR_API_KEY"
    
    # GreyNoise community API headers default
    GREYNOISE_API_KEY: str = "TreatMap"
    
    # Optional Keys
    GROQ_API_KEY: Optional[str] = None
    OTX_API_KEY: Optional[str] = None
    SHODAN_API_KEY: Optional[str] = "L7MfQIpj0L7jEXQrwOe0WnJPgDbQKfdE"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"

settings = Settings()

PLACEHOLDER_SECRET_VALUES = {
    "",
    "your_api_key",
    "your_api_key_here",
    "your_key",
    "your_token",
    "your_link",
    "your_url",
    "treatmap",
}

def is_configured_secret(value: Optional[str], min_length: int = 10) -> bool:
    if not value:
        return False
    normalized = value.strip()
    if len(normalized) < min_length:
        return False
    return normalized.lower() not in PLACEHOLDER_SECRET_VALUES
