"use client";

import React from "react";
import { ScanResponse } from "@/types";

type EvidenceItem = {
  source: string;
  status: "live" | "neutral" | "unavailable";
  signal: string;
  detail: string;
};

function sourceStatus(feed: any): string {
  return String(feed?.status || feed?.overall_status || feed?.lookup_status || "").toLowerCase();
}

function isLive(feed: any): boolean {
  if (!feed || Object.keys(feed).length === 0) return false;
  const status = sourceStatus(feed);
  return !["fallback", "error", "unavailable"].includes(status);
}

export default function ThreatIntelEvidence({ scan }: { scan: ScanResponse }) {
  const raw = scan.raw_data || {};
  const vt = raw.virustotal || {};
  const abuse = raw.abuseipdb || {};
  const greynoise = raw.greynoise || {};
  const otx = raw.alienvault_otx || {};
  const urlscan = raw.urlscan || {};
  const ipinfo = raw.ipinfo || {};

  const vtStats = vt.raw?.data?.attributes?.last_analysis_stats || vt.data?.attributes?.last_analysis_stats || vt;
  const vtMalicious = Number(vtStats.malicious || 0);
  const vtSuspicious = Number(vtStats.suspicious || 0);
  const vtTotal =
    Number(vtStats.malicious || 0) +
    Number(vtStats.suspicious || 0) +
    Number(vtStats.harmless || 0) +
    Number(vtStats.undetected || 0);

  const abuseData = abuse.data || abuse.raw || abuse;
  const abuseScore = Number(abuseData.abuseConfidenceScore || 0);
  const abuseReports = Number(abuseData.totalReports || 0);

  const evidence: EvidenceItem[] = [];

  if (isLive(vt)) {
    evidence.push({
      source: "VirusTotal",
      status: vtMalicious > 0 || vtSuspicious > 0 ? "live" : "neutral",
      signal: `${vtMalicious} malicious, ${vtSuspicious} suspicious`,
      detail: vtTotal > 0 ? `${vtTotal} engines returned analysis stats.` : "Live lookup returned no engine totals.",
    });
  }

  if (scan.type === "ip" && isLive(abuse)) {
    evidence.push({
      source: "AbuseIPDB",
      status: abuseScore > 0 ? "live" : "neutral",
      signal: `${abuseScore}% abuse confidence`,
      detail: `${abuseReports} community report${abuseReports === 1 ? "" : "s"} in the returned data.`,
    });
  }

  if (scan.type === "ip" && isLive(greynoise)) {
    const classification = greynoise.classification || "unknown";
    evidence.push({
      source: "GreyNoise",
      status: classification === "malicious" || greynoise.noise ? "live" : "neutral",
      signal: classification,
      detail: greynoise.noise ? "Observed scanning activity." : "No scanner behavior reported by this feed.",
    });
  }

  if (isLive(otx)) {
    const pulseCount = Number(otx.pulse_count || otx.raw?.pulse_info?.count || 0);
    evidence.push({
      source: "AlienVault OTX",
      status: pulseCount > 0 ? "live" : "neutral",
      signal: `${pulseCount} pulse${pulseCount === 1 ? "" : "s"}`,
      detail: Array.isArray(otx.tags) && otx.tags.length > 0 ? otx.tags.slice(0, 5).join(", ") : "No pulse tags returned.",
    });
  }

  if ((scan.type === "domain" || scan.type === "url") && isLive(urlscan)) {
    evidence.push({
      source: "URLScan",
      status: "neutral",
      signal: urlscan.overall_status || "available",
      detail: urlscan.scan_id ? `Sandbox result ${urlscan.scan_id}` : "Search returned without a sandbox id.",
    });
  }

  if (scan.type === "ip" && isLive(ipinfo)) {
    evidence.push({
      source: "IPinfo",
      status: "neutral",
      signal: [ipinfo.city, ipinfo.country].filter(Boolean).join(", ") || "geolocation returned",
      detail: ipinfo.org || "No organization returned.",
    });
  }

  const knownSources = [
    ["VirusTotal", vt],
    ...(scan.type === "ip" ? [["AbuseIPDB", abuse], ["GreyNoise", greynoise], ["IPinfo", ipinfo]] as [string, any][] : []),
    ["AlienVault OTX", otx],
    ...(scan.type === "domain" || scan.type === "url" ? [["URLScan", urlscan]] as [string, any][] : []),
    ["WhoisJSON", raw.whoisjson],
    ["DomainScan", raw.domainscan],
  ];

  const unavailable = knownSources
    .filter(([, feed]) => !isLive(feed))
    .map(([name, feed]) => ({ name, status: sourceStatus(feed) || "not returned" }));

  const liveCount = evidence.length;
  const threatSignals = evidence.filter((item) => item.status === "live").length;

  return (
    <section className="glass-panel rounded-xl p-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
          <div>
            <h3 className="font-bold text-white text-md font-headline-sm">Threat Intelligence Evidence</h3>
            <p className="text-[11px] text-on-surface-variant">Only live provider data is treated as evidence.</p>
          </div>
        </div>
        <div className="flex gap-2 text-[10px] font-mono-sm">
          <span className="px-2 py-1 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            {liveCount} live
          </span>
          <span className="px-2 py-1 rounded border border-red-500/20 bg-red-500/10 text-red-300">
            {threatSignals} threat signal{threatSignals === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {evidence.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evidence.map((item) => (
            <div key={item.source} className="rounded-lg border border-white/5 bg-surface-container-low p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-bold text-white">{item.source}</p>
                  <p className="text-[11px] text-on-surface-variant">{item.signal}</p>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border ${
                    item.status === "live"
                      ? "bg-red-500/10 text-red-300 border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {item.status === "live" ? "SIGNAL" : "NEUTRAL"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">{item.detail}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-sky-100">
          No live threat intelligence provider returned usable evidence for this scan.
        </div>
      )}

      {unavailable.length > 0 && (
        <div className="pt-3 border-t border-white/5">
          <p className="text-[10px] font-mono-sm uppercase tracking-wider text-on-surface-variant mb-2">
            Excluded from scoring
          </p>
          <div className="flex flex-wrap gap-2">
            {unavailable.map((item) => (
              <span key={item.name} className="px-2 py-1 rounded border border-white/10 bg-white/5 text-[10px] text-on-surface-variant font-mono-sm">
                {item.name}: {item.status}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
