#!/bin/bash
# Quick Deploy to Vercel Script
# Run this from the project root directory

echo "🚀 ThreatMap Vercel Deployment Setup"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if git is initialized
if [ ! -d .git ]; then
    echo "⚠️  Git not initialized. Initialize Git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

echo "📝 Steps to deploy:"
echo ""
echo "1. Push your code to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Option A - Deploy via CLI:"
echo "   vercel --prod"
echo ""
echo "3. Option B - Deploy via Dashboard:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Click 'Add New' → 'Project'"
echo "   - Select your GitHub repo"
echo "   - Click 'Deploy'"
echo ""
echo "4. Configure Environment Variables:"
echo "   - Go to Project Settings → Environment Variables"
echo "   - Add required API keys (see VERCEL_DEPLOYMENT.md)"
echo ""
echo "5. Test your deployment:"
echo "   curl https://your-project.vercel.app/api/v1/health"
echo ""
echo "📚 For detailed instructions, see: VERCEL_DEPLOYMENT.md"
