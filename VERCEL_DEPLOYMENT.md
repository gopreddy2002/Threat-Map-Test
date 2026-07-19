# Vercel Deployment Guide for ThreatMap

This guide walks you through deploying ThreatMap to Vercel with both the Next.js frontend and Python FastAPI backend.

## Required authentication environment variables

Configure these in Vercel for Production, Preview, and Development, then redeploy:

```env
NEXTAUTH_URL=https://threat-map-test-one.vercel.app
NEXTAUTH_SECRET=<generate-a-strong-random-secret>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
```

The Google OAuth application must allow
`https://threat-map-test-one.vercel.app/api/auth/callback/google` as an authorized redirect URI.
GitHub OAuth is not configured in this application.

## Prerequisites

- **Vercel Account**: Sign up at https://vercel.com
- **GitHub Account**: Push your repo to GitHub (Vercel requires this)
- **Environment Variables**: Prepare your API keys and configuration

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd c:\Users\gopre\Desktop\threatmap
vercel --prod
```

#### Option B: Using Vercel Dashboard (GUI)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Click "Import"
5. Configure project settings (defaults are fine)
6. Click "Deploy"

### 3. Configure Environment Variables

After deployment, set the required environment variables in the Vercel Dashboard:

**Navigation**: Project Settings → Environment Variables

#### Required Variables:

```
THREATMAP_API_KEY=your_secure_api_key_here

# API Keys (get from respective services)
VIRUSTOTAL_API_KEY=your_key
ABUSEIPDB_API_KEY=your_key
IPINFO_API_TOKEN=your_key
GEMINI_API_KEY=your_key
ALIENVAULT_API_KEY=your_key
URLSCAN_API_KEY=your_key
GROQ_API_KEY=your_key

# Optional Redis (for caching)
REDIS_URL=your_redis_url
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Frontend
THREATMAP_BACKEND_URL=  # Leave empty to use /api endpoint

# CORS
CORS_ORIGINS=https://your-project.vercel.app
```

### 4. Database Configuration

ThreatMap uses SQLite by default on Vercel, which is stored in `/tmp` (ephemeral storage).

**For Production Persistence**, add a PostgreSQL database:

1. Use a managed database service (Neon, Supabase, Railway)
2. Add `DATABASE_URL` environment variable
3. Example for Neon (PostgreSQL):
   ```
   DATABASE_URL=postgresql://user:password@host/database
   ```

### 5. Verify Deployment

1. Visit your deployment URL: `https://your-project.vercel.app`
2. Test the health endpoint: `https://your-project.vercel.app/api/v1/health`
3. Check browser console for any proxy errors

## Architecture on Vercel

```
┌─────────────────────────────────────┐
│   Next.js Frontend                  │
│   (deployed at root /)              │
│   + Proxy routes at /app/api/proxy  │
└──────────────┬──────────────────────┘
               │
               ├─ Routes /api/* to Python backend
               │
┌──────────────▼──────────────────────┐
│   Python FastAPI Backend            │
│   (deployed at /api)                │
│   + Serverless functions via Mangum │
└─────────────────────────────────────┘
```

## API Endpoints

- **Health Check**: `https://your-project.vercel.app/api/v1/health`
- **Frontend Proxy**: `https://your-project.vercel.app/api/proxy/[...path]`
- **API Endpoints**: All requests go through the proxy at `/api/proxy/`

## Troubleshooting

### Backend Not Responding (502)

1. Check Vercel Function logs: https://vercel.com/dashboard/project/your-project/functions
2. Verify environment variables are set
3. Check that API keys are valid
4. Look for import errors in backend/main.py

### Database Errors

If using SQLite (ephemeral):
- Data resets on deployment
- Switch to PostgreSQL for persistence

### CORS Issues

Ensure `CORS_ORIGINS` environment variable includes your Vercel domain:
```
CORS_ORIGINS=https://your-project.vercel.app,http://localhost:3000
```

### Port Issues

Vercel assigns the PORT automatically. The backend in main.py already handles this:
```python
port = int(os.environ.get("PORT", 8000))
```

## Updating Your Deployment

After making code changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
# Vercel automatically redeploys
```

Or manually trigger redeploy:
```bash
vercel --prod
```

## Environment Variables Deep Dive

### THREATMAP_API_KEY
- **Type**: String (Secret)
- **Purpose**: API authentication for frontend-to-backend calls
- **Generate**: Use a strong random string
  ```bash
  openssl rand -hex 32
  ```

### Database URL
- **SQLite (Default)**: `sqlite:///./threatmap.db` (ephemeral on Vercel)
- **PostgreSQL**: `postgresql://user:password@host:port/database`

### Cache Configuration
- **Redis**: Used for performance optimization
- **Upstash**: Serverless Redis provider (free tier available)

## Production Checklist

- ✅ Environment variables configured
- ✅ API keys are valid and active
- ✅ Database is persistent (PostgreSQL recommended)
- ✅ CORS origins include your domain
- ✅ Health endpoint responds (200 OK)
- ✅ Frontend loads without errors
- ✅ API calls complete successfully

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Python Support](https://vercel.com/docs/functions/serverless-functions/python)
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)

## Support

For issues:
1. Check Vercel Function logs
2. Review error messages in browser console
3. Verify environment variables
4. Check API key validity
5. Review backend logs in Vercel dashboard
