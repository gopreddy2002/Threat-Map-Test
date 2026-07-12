#!/usr/bin/env pwsh
# Quick Deploy to Vercel Script (PowerShell)
# Run this from the project root directory

Write-Host "🚀 ThreatMap Vercel Deployment Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if Vercel CLI is installed
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "⚠️  Git not initialized. Initialize Git first:" -ForegroundColor Red
    Write-Host "   git init" -ForegroundColor Cyan
    Write-Host "   git add ." -ForegroundColor Cyan
    Write-Host "   git commit -m 'Initial commit'" -ForegroundColor Cyan
    exit 1
}

Write-Host "📝 Steps to deploy:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Push your code to GitHub:" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Option A - Deploy via CLI:" -ForegroundColor Cyan
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Option B - Deploy via Dashboard:" -ForegroundColor Cyan
Write-Host "   - Go to https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "   - Click 'Add New' → 'Project'" -ForegroundColor Gray
Write-Host "   - Select your GitHub repo" -ForegroundColor Gray
Write-Host "   - Click 'Deploy'" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configure Environment Variables:" -ForegroundColor Cyan
Write-Host "   - Go to Project Settings → Environment Variables" -ForegroundColor Gray
Write-Host "   - Add required API keys (see VERCEL_DEPLOYMENT.md)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Test your deployment:" -ForegroundColor Cyan
Write-Host "   curl https://your-project.vercel.app/api/v1/health" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 For detailed instructions, see: VERCEL_DEPLOYMENT.md" -ForegroundColor Magenta
