import os
import smtplib
from email.message import EmailMessage
from typing import Dict, Any, List

import httpx
from sqlalchemy.orm import Session

from alert_models import AlertRule, AlertNotification


def get_severity(score: int) -> str:
    if score >= 90:
        return "CRITICAL"
    if score >= 75:
        return "HIGH"
    if score >= 50:
        return "MEDIUM"
    return "LOW"


def build_alert_message(scan: Dict[str, Any]) -> Dict[str, str]:
    indicator = scan.get("indicator", "Unknown IOC")
    indicator_type = scan.get("type", "unknown")
    risk_score = int(scan.get("risk_score", 0))
    severity = get_severity(risk_score)

    title = f"{severity} Threat Alert: {indicator}"

    message = f"""
ThreatMap Alert

IOC: {indicator}
Type: {indicator_type}
Risk Score: {risk_score}/100
Severity: {severity}

Action Required:
- Review IOC details in ThreatMap dashboard
- Check related infrastructure
- Block indicator if confirmed malicious
- Escalate to SOC/IR team if required
""".strip()

    return {
        "title": title,
        "message": message,
        "severity": severity,
    }


def create_dashboard_notification(
    db: Session,
    scan: Dict[str, Any],
    alert_data: Dict[str, str],
    channel: str,
    status: str = "created",
):
    notification = AlertNotification(
        indicator=scan.get("indicator", "Unknown"),
        indicator_type=scan.get("type", "unknown"),
        risk_score=int(scan.get("risk_score", 0)),
        severity=alert_data["severity"],
        title=alert_data["title"],
        message=alert_data["message"],
        channel=channel,
        status=status,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification


def send_email_alert(subject: str, body: str, to_email: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not all([smtp_host, smtp_user, smtp_password, to_email]):
        return False

    msg = EmailMessage()
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        return True
    except Exception as error:
        print(f"[EMAIL ALERT ERROR] {error}")
        return False


async def send_slack_alert(text: str) -> bool:
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")

    if not webhook_url:
        return False

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(webhook_url, json={"text": text})
            return response.status_code in [200, 201, 202]
    except Exception as error:
        print(f"[SLACK ALERT ERROR] {error}")
        return False


async def send_discord_alert(text: str) -> bool:
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")

    if not webhook_url:
        return False

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(webhook_url, json={"content": text})
            return response.status_code in [200, 201, 202, 204]
    except Exception as error:
        print(f"[DISCORD ALERT ERROR] {error}")
        return False


async def send_telegram_alert(text: str, chat_id: str = None) -> bool:
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")

    if not bot_token or not chat_id:
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                url,
                json={
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": "HTML",
                },
            )
            return response.status_code == 200
    except Exception as error:
        print(f"[TELEGRAM ALERT ERROR] {error}")
        return False


async def trigger_alerts_if_needed(db: Session, scan: Dict[str, Any]) -> List[AlertNotification]:
    risk_score = int(scan.get("risk_score", 0))

    rules = db.query(AlertRule).filter(AlertRule.enabled == True).all()

    if not rules:
        default_threshold = int(os.getenv("ALERT_RISK_THRESHOLD", "80"))

        default_rule = AlertRule(
            name="Default High Risk IOC Alert",
            threshold=default_threshold,
            enabled=True,
            channels=["dashboard", "email", "slack", "discord", "telegram"],
            recipients={
                "email": os.getenv("ALERT_EMAIL_TO"),
                "telegram_chat_id": os.getenv("TELEGRAM_CHAT_ID"),
            },
        )

        db.add(default_rule)
        db.commit()
        db.refresh(default_rule)

        rules = [default_rule]

    created_notifications = []

    for rule in rules:
        if risk_score < rule.threshold:
            continue

        alert_data = build_alert_message(scan)
        channels = rule.channels or ["dashboard"]
        recipients = rule.recipients or {}

        for channel in channels:
            status = "created"

            if channel == "email":
                sent = send_email_alert(
                    subject=alert_data["title"],
                    body=alert_data["message"],
                    to_email=recipients.get("email") or os.getenv("ALERT_EMAIL_TO"),
                )
                status = "sent" if sent else "failed"

            elif channel == "slack":
                sent = await send_slack_alert(alert_data["message"])
                status = "sent" if sent else "failed"

            elif channel == "discord":
                sent = await send_discord_alert(alert_data["message"])
                status = "sent" if sent else "failed"

            elif channel == "telegram":
                sent = await send_telegram_alert(
                    alert_data["message"],
                    chat_id=recipients.get("telegram_chat_id"),
                )
                status = "sent" if sent else "failed"

            elif channel == "dashboard":
                status = "created"

            notification = create_dashboard_notification(
                db=db,
                scan=scan,
                alert_data=alert_data,
                channel=channel,
                status=status,
            )

            created_notifications.append(notification)

    return created_notifications
