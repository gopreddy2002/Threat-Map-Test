"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export default function DarkWebPage() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<any>(null);

  const runInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError("");
    setReport(null);

    try {
      const response = await api.investigateDarkWeb(query.trim(), limit);
      setReport(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Dark-web investigation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4 mb-10">
        <span className="material-symbols-outlined text-[64px] text-primary">dark_mode</span>
        <h1 className="text-4xl font-black text-white tracking-widest font-headline-lg">
          DARK WEB <span className="text-primary font-light">INTEL</span>
        </h1>
        <p className="text-on-surface-variant max-w-3xl mx-auto">
          Launch a structured, AI-assisted investigation for aliases, leaked data, forums, and underground chatter tied to a target.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-white/5 mb-8">
        <form onSubmit={runInvestigation} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. ransomware group, leaked credentials, phishing kit"
              className="bg-background border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
              required
            />
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value={3}>3 leads</option>
              <option value={5}>5 leads</option>
              <option value={8}>8 leads</option>
            </select>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-background font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isLoading ? "Investigating..." : "Start Investigation"}
            </button>
          </div>
          <p className="text-xs text-on-surface-variant">
            This workflow is designed for lawful, authorized OSINT investigations and produces a lead-focused summary you can review and share.
          </p>
        </form>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error/50 p-4 rounded-xl text-error text-sm mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {report && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-surface border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Investigation Brief</p>
                <h2 className="text-xl font-bold text-white">{report.query}</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs uppercase font-semibold">
                {report.risk_level}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">{report.summary}</p>
            <div className="rounded-xl border border-white/5 bg-background/40 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-on-surface-variant mb-2">Sources consulted</p>
              <ul className="space-y-2 text-sm text-white">
                {report.sources_consulted.map((source: string) => (
                  <li key={source} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">fiber_manual_record</span>
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-surface border border-white/5 rounded-xl p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Likely mentions</p>
            <div className="space-y-3">
              {report.mentions.map((mention: any, idx: number) => (
                <div key={`${mention.title}-${idx}`} className="rounded-xl border border-white/5 bg-background/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{mention.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{mention.source}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary">{mention.type}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-3 leading-relaxed">{mention.snippet}</p>
                  <p className="text-xs text-primary mt-2">Confidence: {mention.confidence}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
