"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RiskBadge from "@/components/RiskBadge";

type BulkResult = {
  indicator: string;
  type: string;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "UNKNOWN";
  malicious_engines?: number;
  total_engines?: number;
  status: string;
};

type BulkPayload = {
  total: number;
  results: BulkResult[];
};

export default function BulkResultsPage() {
  const [payload, setPayload] = useState<BulkPayload | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bulkScanResults");
      if (raw) setPayload(JSON.parse(raw));
    } catch {
      setPayload(null);
    }
  }, []);

  const summary = useMemo(() => {
    const results = payload?.results || [];
    return {
      total: results.length,
      critical: results.filter((item) => item.risk_level === "CRITICAL").length,
      high: results.filter((item) => item.risk_level === "HIGH").length,
      successful: results.filter((item) => item.status === "success").length,
    };
  }, [payload]);

  if (!payload) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16 text-center">
        <h1 className="text-2xl font-black text-white mb-3">Bulk Results</h1>
        <p className="text-sm text-on-surface-variant mb-6">No bulk scan results are available in this browser session.</p>
        <Link href="/" className="inline-flex items-center justify-center bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-bold">
          Start Bulk Scan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Bulk Scan Results</h1>
          <p className="text-sm text-on-surface-variant">Sorted by risk score from highest to lowest.</p>
        </div>
        <Link href="/" className="inline-flex items-center justify-center bg-surface-container-low border border-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold">
          New Scan
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Total", summary.total, "text-white"],
          ["Successful", summary.successful, "text-emerald-400"],
          ["High", summary.high, "text-orange-400"],
          ["Critical", summary.critical, "text-error"],
        ].map(([label, value, color]) => (
          <div key={label} className="glass-panel rounded-xl p-4 border border-white/5">
            <div className="text-[10px] uppercase text-on-surface-variant font-mono-sm">{label}</div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-on-surface-variant border-b border-white/10">
            <tr>
              <th className="py-3 pr-4">Indicator</th>
              <th className="py-3 pr-4">Type</th>
              <th className="py-3 pr-4">Risk</th>
              <th className="py-3 pr-4">VT Detections</th>
              <th className="py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {payload.results.map((item) => (
              <tr key={`${item.type}:${item.indicator}`} className="text-on-surface">
                <td className="py-3 pr-4 font-mono-sm break-all max-w-sm">{item.indicator}</td>
                <td className="py-3 pr-4 uppercase text-on-surface-variant">{item.type}</td>
                <td className="py-3 pr-4">
                  {item.risk_level === "UNKNOWN" ? (
                    <span className="text-on-surface-variant">Unknown</span>
                  ) : (
                    <RiskBadge level={item.risk_level} score={item.risk_score} />
                  )}
                </td>
                <td className="py-3 pr-4 font-mono-sm">
                  {item.malicious_engines ?? 0} / {item.total_engines || "unknown"}
                </td>
                <td className="py-3 text-right">
                  <span className={`px-2 py-1 rounded border text-[10px] uppercase font-bold ${
                    item.status === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-error/10 text-error border-error/20"
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
