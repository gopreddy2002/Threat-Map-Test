from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class ScanBase(BaseModel):
    indicator: str
    type: str
    refresh: bool = False

class ScanCreate(ScanBase):
    pass

class ScanResponse(ScanBase):
    id: str
    risk_score: int
    risk_level: str
    summary: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class WatchlistBase(BaseModel):
    indicator: str
    type: str
    notes: Optional[str] = None
    custom_threshold: Optional[int] = None
    tags: Optional[str] = None
    schedule_frequency: Optional[str] = None
    webhook_url: Optional[str] = None

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistUpdate(BaseModel):
    notes: Optional[str] = None
    custom_threshold: Optional[int] = None
    tags: Optional[str] = None
    schedule_frequency: Optional[str] = None
    webhook_url: Optional[str] = None

class WatchlistResponse(WatchlistBase):
    id: int
    added_at: datetime
    last_scanned_at: datetime
    last_risk_score: int

    model_config = ConfigDict(from_attributes=True)


class AlertBase(BaseModel):
    indicator: str
    alert_type: str
    title: str
    message: Optional[str] = None
    risk_score: int

class AlertResponse(AlertBase):
    id: int
    is_dismissed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertUpdate(BaseModel):
    is_dismissed: bool


# Dashboard Summary Schemes
class StatCardData(BaseModel):
    value: str
    trend: str
    status: str

class DashboardStats(BaseModel):
    total_scans_24h: int
    critical_threats: int
    high_risk_assets: int
    monitored_iocs: int
    recent_scans: List[ScanResponse]
    alerts: List[AlertResponse]
    threat_distribution: Dict[str, int] # e.g. {"critical": 25, "high": 35, "medium": 30, "low": 10}
    malware_prevalence: List[Dict[str, Any]] # e.g. [{"name": "Ransom.LockBit", "percentage": 82, "trend": "up"}]

class AttackPrediction(BaseModel):
    predicted_attack_type: str
    predicted_target_region: str
    confidence_level: str
    estimated_time: str
    explanation: str

class IncidentCaseBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "Open"
    priority: Optional[str] = "Medium"
    reporter: Optional[str] = "System"

class IncidentCaseCreate(IncidentCaseBase):
    pass

class IncidentCaseResponse(IncidentCaseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AttackSurfaceAssetBase(BaseModel):
    domain: str
    ips: Optional[List[str]] = []
    open_ports: Optional[List[int]] = []
    technologies: Optional[List[str]] = []

class AttackSurfaceAssetCreate(AttackSurfaceAssetBase):
    pass

class AttackSurfaceAssetResponse(AttackSurfaceAssetBase):
    id: int
    last_scanned: datetime
    model_config = ConfigDict(from_attributes=True)

class DarkWebMentionBase(BaseModel):
    keyword: str
    source: Optional[str] = None
    snippet: Optional[str] = None

class DarkWebMentionResponse(DarkWebMentionBase):
    id: int
    date_found: datetime
    model_config = ConfigDict(from_attributes=True)

class MalwareFamilyBase(BaseModel):
    name: str
    aliases: Optional[str] = None
    description: Optional[str] = None
    indicators: Optional[List[str]] = []

class MalwareFamilyResponse(MalwareFamilyBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EvidenceFileBase(BaseModel):
    filename: str
    file_path: str
    uploader: Optional[str] = "Analyst"
    incident_id: Optional[int] = None

class EvidenceFileResponse(EvidenceFileBase):
    id: int
    uploaded_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ThreatIntelBriefingBase(BaseModel):
    title: str
    content: str
    risk_score: Optional[int] = 0

class ThreatIntelBriefingResponse(ThreatIntelBriefingBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DomainReputationHistoryBase(BaseModel):
    domain: str
    risk_score: Optional[int] = 0
    categories: Optional[List[str]] = []
    whois_summary: Optional[str] = None

class DomainReputationHistoryResponse(DomainReputationHistoryBase):
    id: int
    scan_date: datetime
    model_config = ConfigDict(from_attributes=True)


class MitreTechniqueBase(BaseModel):
    technique_id: str
    name: str
    tactics: Optional[List[str]] = []
    severity: Optional[str] = "Medium"
    description: Optional[str] = None
    mitigation: Optional[str] = None

class MitreTechniqueResponse(MitreTechniqueBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class IOCTrackerBase(BaseModel):
    indicator: str
    type: str
    confidence_score: Optional[int] = 50
    expiry_date: Optional[datetime] = None
    is_active: Optional[bool] = True
    source: Optional[str] = None

class IOCTrackerResponse(IOCTrackerBase):
    id: int
    first_seen: datetime
    last_seen: datetime
    model_config = ConfigDict(from_attributes=True)


class AttackPathBase(BaseModel):
    title: str
    steps: Optional[Dict[str, Any]] = None
    risk_level: Optional[str] = "High"

class AttackPathResponse(AttackPathBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class RemediationPlaybookBase(BaseModel):
    title: str
    steps: Optional[List[Dict[str, Any]]] = []
    owner: Optional[str] = "Security Team"
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Active"
    threat_type: Optional[str] = None

class RemediationPlaybookResponse(RemediationPlaybookBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
