# start.ps1 — Auto-restarting ThreatMap backend (Windows PowerShell)
# Run from c:\ThreatMap with: powershell -ExecutionPolicy Bypass -File start.ps1
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

while ($true) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting ThreatMap backend..." -ForegroundColor Cyan
    & ".\backend\venv\Scripts\uvicorn.exe" backend.main:app `
        --host 0.0.0.0 `
        --port 8000 `
        --timeout-keep-alive 75 `
        --workers 1
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Backend stopped. Restarting in 3 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}
