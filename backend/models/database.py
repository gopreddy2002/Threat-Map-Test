import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

# Handle schema prefixes if Supabase is used, fallback to sqlite locally
if "sqlite" in settings.DATABASE_URL:
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, index=True)
    indicator = Column(String(255), index=True, nullable=False)
    type = Column(String(50), nullable=False) # ip, url, domain, hash
    risk_score = Column(Integer, default=0)
    risk_level = Column(String(50), default="LOW", index=True) # LOW, MEDIUM, HIGH, CRITICAL
    summary = Column(Text, nullable=True)
    raw_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    indicator = Column(String(255), unique=True, index=True, nullable=False)
    type = Column(String(50), nullable=False)
    added_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_scanned_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text, nullable=True)
    last_risk_score = Column(Integer, default=0)
    custom_threshold = Column(Integer, nullable=True) # Alert threshold e.g., 70
    tags = Column(String(500), nullable=True) # comma separated
    schedule_frequency = Column(String(50), nullable=True) # "daily", "weekly"
    webhook_url = Column(String(500), nullable=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    indicator = Column(String(255), index=True, nullable=False)
    alert_type = Column(String(100), default="RISK_SHIFT") # RISK_INCREASE, WATCHED_MODIFIED, CVE_DETECTED
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    risk_score = Column(Integer, default=0)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ThreatActor(Base):
    __tablename__ = "threat_actors"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    aliases = Column(String(500), nullable=True) # comma separated
    country = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    industries = Column(String(500), nullable=True)
    active_since = Column(String(100), nullable=True)
    threat_level = Column(String(50), default="HIGH")
    mitre_tactics = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class CampaignIOC(Base):
    __tablename__ = "campaign_iocs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    campaign_id = Column(String(36), index=True, nullable=False)
    scan_id = Column(String(36), nullable=False) # Reference to Scan.id
    added_at = Column(DateTime, default=datetime.datetime.utcnow)


class CommunityNote(Base):
    __tablename__ = "community_notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    indicator = Column(String(255), index=True, nullable=False)
    author = Column(String(255), default="Anonymous")
    text = Column(Text, nullable=False)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class IncidentCase(Base):
    __tablename__ = "incident_cases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Open") # Open, Investigating, Resolved
    priority = Column(String(50), default="Medium") # Low, Medium, High, Critical
    reporter = Column(String(100), default="System")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class AttackSurfaceAsset(Base):
    __tablename__ = "attack_surface_assets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    domain = Column(String(255), index=True, nullable=False)
    ips = Column(JSON, nullable=True) # list of IPs
    open_ports = Column(JSON, nullable=True) # list of open ports
    technologies = Column(JSON, nullable=True) # list of detected tech
    last_scanned = Column(DateTime, default=datetime.datetime.utcnow)


class DarkWebMention(Base):
    __tablename__ = "dark_web_mentions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    keyword = Column(String(255), index=True, nullable=False)
    source = Column(String(255), nullable=True)
    snippet = Column(Text, nullable=True)
    date_found = Column(DateTime, default=datetime.datetime.utcnow)


class MalwareFamily(Base):
    __tablename__ = "malware_families"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), index=True, nullable=False)
    aliases = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    indicators = Column(JSON, nullable=True) # associated hashes/domains
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class EvidenceFile(Base):
    __tablename__ = "evidence_files"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(1000), nullable=False)
    uploader = Column(String(100), default="Analyst")
    incident_id = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
