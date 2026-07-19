import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function proxy(request: NextRequest, context: { params: { path: string[] } }) {
  const apiKey = process.env.THREATMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { detail: "Frontend proxy authentication is not configured." },
      { status: 503 },
    );
  }

  const configuredBase = process.env.THREATMAP_BACKEND_URL;
  const isProduction = process.env.VERCEL_URL ? true : false;
  
  // Server-side fetch requires an absolute URL. On Vercel, the incoming path
  // already starts with api/v1, so use the deployment origin without adding a
  // second /api prefix; vercel.json then rewrites /api/* to the Python function.
  const backendBase = (configuredBase || (isProduction ? request.nextUrl.origin : "http://127.0.0.1:8000")).replace(/\/$/, "");
  
  const path = context.params.path.map(encodeURIComponent).join("/");
  const target = `${backendBase}/${path}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.set("X-API-Key", apiKey);
  headers.delete("host");
  headers.delete("content-length");

  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ detail: "ThreatMap backend is unavailable." }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
