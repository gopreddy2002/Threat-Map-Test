import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON
from models.database import Base


class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    threshold = Column(Integer, default=80)
    enabled = Column(Boolean, default=True)

    # Example: ["email", "slack", "discord", "telegram", "dashboard"]
    channels = Column(JSON, default=list)

    # Example:
    # {
    #   "email": "admin@example.com",
    #   "telegram_chat_id": "123456"
    # }
    recipients = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)


class AlertNotification(Base):
    __tablename__ = "alert_notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    indicator = Column(String, nullable=False)
    indicator_type = Column(String, nullable=True)
    risk_score = Column(Integer, nullable=False)
    severity = Column(String, nullable=False)

    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)

    channel = Column(String, default="dashboard")
    status = Column(String, default="created")  # created, sent, failed
    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
