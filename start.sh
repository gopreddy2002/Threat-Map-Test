#!/usr/bin/env bash
# start.sh — Auto-restarting ThreatMap backend (WSL / Linux / macOS)
cd "$(dirname "$0")"
source backend/venv/bin/activate
while true; do
    echo "[$(date)] Starting ThreatMap backend..."
    uvicorn backend.main:app --host 0.0.0.0 --port 8000 --timeout-keep-alive 75 --workers 1
    echo "[$(date)] Backend stopped. Restarting in 3 seconds..."
    sleep 3
done
