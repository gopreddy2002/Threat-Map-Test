from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.database import get_db
from alert_models import AlertRule, AlertNotification


router = APIRouter(prefix="/alerts", tags=["Alerts"])


class AlertRuleCreate(BaseModel):
    name: str
    threshold: int = 80
    enabled: bool = True
    channels: List[str] = ["dashboard"]
    recipients: Dict[str, Any] = {}


class AlertRuleResponse(BaseModel):
    id: str
    name: str
    threshold: int
    enabled: bool
    channels: List[str]
    recipients: Dict[str, Any]

    class Config:
        from_attributes = True


@router.post("/rules", response_model=AlertRuleResponse)
def create_alert_rule(payload: AlertRuleCreate, db: Session = Depends(get_db)):
    allowed_channels = {"email", "slack", "discord", "telegram", "dashboard"}

    invalid_channels = set(payload.channels) - allowed_channels
    if invalid_channels:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid channels: {list(invalid_channels)}",
        )

    rule = AlertRule(
        name=payload.name,
        threshold=payload.threshold,
        enabled=payload.enabled,
        channels=payload.channels,
        recipients=payload.recipients,
    )

    db.add(rule)
    db.commit()
    db.refresh(rule)

    return rule


@router.get("/rules")
def list_alert_rules(db: Session = Depends(get_db)):
    return db.query(AlertRule).order_by(AlertRule.created_at.desc()).all()


@router.get("/notifications")
def list_notifications(
    unread_only: bool = False,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(AlertNotification)

    if unread_only:
        query = query.filter(AlertNotification.is_read == False)

    return query.order_by(AlertNotification.created_at.desc()).limit(limit).all()


@router.patch("/notifications/{notification_id}/read")
def mark_notification_as_read(notification_id: str, db: Session = Depends(get_db)):
    notification = (
        db.query(AlertNotification)
        .filter(AlertNotification.id == notification_id)
        .first()
    )

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return {
        "message": "Notification marked as read",
        "notification_id": notification.id,
    }


@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: str, db: Session = Depends(get_db)):
    notification = (
        db.query(AlertNotification)
        .filter(AlertNotification.id == notification_id)
        .first()
    )

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()

    return {
        "message": "Notification deleted",
        "notification_id": notification_id,
    }
