#!/bin/bash
cd "$(dirname "$0")/backend" || exit 1
if [ -f venv/Scripts/activate ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi
while true; do
    python -m uvicorn main:app --host 127.0.0.1 --port 8000
    echo "Backend crashed. Restarting in 2s..."
    sleep 2
done
