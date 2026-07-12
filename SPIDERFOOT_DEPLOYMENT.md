# SpiderFoot deployment

SpiderFoot must run on persistent compute. It cannot run as a long-lived process inside Vercel.

1. On a dedicated VM, run `docker compose -f docker-compose.spiderfoot.yml up -d --build`.
2. Put an authenticated HTTPS reverse proxy in front of `127.0.0.1:5001`.
3. Restrict ingress to the ThreatMap backend where possible.
4. Set `SPIDERFOOT_BASE_URL`, plus either digest credentials or `SPIDERFOOT_API_KEY`, in the backend deployment.
5. Verify `GET /api/v1/tools/spiderfoot/health` through ThreatMap before enabling scan controls.

Never expose the unauthenticated SpiderFoot port directly to the public internet.
