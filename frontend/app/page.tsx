"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ScanInput from "@/components/ScanInput";
import ScanSequence from "@/components/ScanSequence";
import { api } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [scanError, setScanError] = useState("");

  const handleScan = async (indicator: string, type: "ip" | "url" | "domain" | "hash" | "bulk" | "cve") => {
    setIsLoading(true);
    setScanError("");
    try {
      if (type === "bulk") {
        const indicators = indicator.split(/[\n,]+/).map(i => i.trim()).filter(i => i.length > 0);
        // We'll navigate to a new bulk results page (which we can build next or pass state)
        // For now, let's just trigger the bulk scan and log it, or redirect to a /results/bulk page
        const result = await api.bulkScan(indicators);
        // We need a way to display bulk results. For now we can route to /bulk-results
        // We'll encode the result in sessionStorage to pass it easily without a DB record
        sessionStorage.setItem("bulkScanResults", JSON.stringify(result));
        router.push(`/results/bulk`);
      } else if (type === "cve") {
        // Redirect to a specific CVE results view
        router.push(`/results/cve/${indicator}`);
      } else {
        // Run API call + 6s minimum UX delay in parallel.
        // If API responds in 2s, we wait the remaining 4s (professional feel).
        // If API takes 10s, we just wait for it (delay already passed).
        const minDelay = new Promise<void>(r => setTimeout(r, 6000));
        const [result] = await Promise.all([
          api.analyzeIndicator(indicator, type),
          minDelay,
        ]);

        if (result && result.id) {
          router.push(`/results/${result.id}`);
        } else {
          setScanError("Invalid response from server. Please try again.");
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || "An unexpected error occurred during scan.";
      setScanError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const platforms = [
    {
      name: "VirusTotal",
      description: "Aggregates malicious reputation across 90+ security engines.",
      icon: "security",
      status: "Active",
    },
    {
      name: "AbuseIPDB",
      description: "IP blacklist engine reporting spam, brute-force, and malware C2s.",
      icon: "sensors",
      status: "Active",
    },
    {
      name: "GreyNoise",
      description: "Classifies internet background scanners and internet noise.",
      icon: "hearing",
      status: "Active",
    },
    {
      name: "AlienVault OTX",
      description: "Extracts open indicator pulse counts and threat campaign tags.",
      icon: "hub",
      status: "Active",
    },
    {
      name: "URLScan.io",
      description: "Analyses URL behaviors and renders sandbox snapshots.",
      icon: "pageview",
      status: "Active",
    },
    {
      name: "Local OSINT Engine",
      description: "Resolves direct WHOIS parameters, DNS records, and SSL handshakes.",
      icon: "lan",
      status: "Active",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 flex flex-col justify-center min-h-[calc(100vh-8rem)]">
      {/* Title/Branding Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 rounded-xl bg-primary/10 border border-primary/20 mb-6">
          <span className="material-symbols-outlined text-primary text-[32px] animate-pulse">
            radar
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 font-headline-lg">
          AI-Powered Threat Intelligence
        </h1>
        <p className="text-base text-on-surface-variant max-w-2xl mx-auto font-body-lg leading-relaxed">
          Aggregates IP geolocation, malicious binary signals, domain DNS mapping, and URL scan screenshots
          into a single, consolidated threat score supported by automated Google Gemini mitigation reports.
        </p>
      </div>

      {/* Unified Search Control */}
      <div className="mb-16">
        <ScanInput onScan={handleScan} isLoading={isLoading} />
        {scanError && (
          <div className="mt-4 p-4 rounded-xl bg-error-container/20 border border-error-container/30 text-error text-sm font-mono-sm text-center">
            {scanError}
          </div>
        )}

        <ScanSequence isVisible={isLoading} />
      </div>

      {/* Integration Feeds Matrix */}
      <div>
        <h3 className="text-center font-bold font-label-caps text-label-caps text-[12px] text-on-surface-variant uppercase tracking-widest mb-6">
          Aggregated OSINT Partners & Feeds
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="glass-panel p-md rounded-xl hover:border-white/20 transition-all duration-300 flex items-start gap-4"
            >
              <div className="p-2.5 rounded-lg bg-surface-container-low border border-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  {p.icon}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{p.name}</h4>
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono-sm uppercase border border-primary/15">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
