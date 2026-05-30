import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "ThreatMap API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./threatmap.db",
        description="SQLAlchemy PostgreSQL connection string or local SQLite fallback."
    )
    
    # Redis Cache (Upstash)
    REDIS_URL: str = Field(
        default="redis://default:gQAAAAAAAZdnAAIgcDI0YjFiMjBhNmY3ZTA0MzU0YjI4NDc2OTRlOGRmNGJhNQ@flexible-urchin-104295.upstash.io:6379",
        description="Redis connection URL"
    )
    UPSTASH_REDIS_REST_URL: str = "https://flexible-urchin-104295.upstash.io"
    UPSTASH_REDIS_REST_TOKEN: str = "gQAAAAAAAZdnAAIgcDI0YjFiMjBhNmY3ZTA0MzU0YjI4NDc2OTRlOGRmNGJhNQ"
    
    # Security API Keys (Defaulted to the provided keys for zero-setup ease of evaluation)
    VIRUSTOTAL_API_KEY: str = "d8f0279993bb4163ff5e20bccfbe3cf0b4d3f8769dc286a778703b20faf854e2"
    ABUSEIPDB_API_KEY: str = "d9ddd3f0286d8d7d90082b7f1e2c755c49543ec8d41b7b6486cafc7ebc51238cdfa2bc81673b0775"
    IPINFO_API_TOKEN: str = "b7adf89768147c"
    GEMINI_API_KEY: str = "AIzaSyDN7iQc6wp7kReDUaToNDIF5lRRpEIeu5E"
    ALIENVAULT_API_KEY: str = "85a8bcfbf49f8919169c3ab8a745904c48e715ebd74f9613a02a64c1d59aa8d8"
    URLSCAN_API_KEY: str = "019e68c2-286a-72fa-b744-5c65412374bd"
    
    # GreyNoise community API headers default
    GREYNOISE_API_KEY: str = "TreatMap"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
