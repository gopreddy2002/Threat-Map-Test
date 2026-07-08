@echo off
cd /d "%~dp0"
call .\venv\Scripts\activate.bat
:loop
echo Starting FastAPI Backend...
python -m uvicorn main:app --host 0.0.0.0 --port 8000
echo Backend crashed, restarting in 2 seconds...
timeout /t 2 /nobreak >nul
goto loop
