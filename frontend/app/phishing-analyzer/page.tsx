"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

export default function PhishingAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/phishing/analyze?url=${encodeURIComponent(url)}`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to analyze URL");
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">phishing</span>
          Phishing URL Analyzer
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://suspicious-link.com" className="flex-1 bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50" />
          <button onClick={analyze} disabled={loading} className="bg-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {loading ? "Analyzing..." : "Analyze"}
          </button>
      </motion.div>

      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      {result && (
        <div className={`mt-6 p-6 border rounded-xl ${result.is_phishing ? 'bg-error/10 border-error/50 text-error' : 'bg-success/10 border-success/50 text-success'}`}>
           <h2 className="text-xl font-bold mb-2">{result.is_phishing ? "⚠️ Phishing Detected" : "✅ Safe URL"}</h2>
           <p className="mb-4">Risk Score: {result.risk_score}</p>
           <ul className="list-disc pl-5">
              {result.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
           </ul>
        </div>
      )}
    </div>
  );
}
