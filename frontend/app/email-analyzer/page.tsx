"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

export default function EmailAnalyzerPage() {
  const [headers, setHeaders] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!headers) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/email-analyzer/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">mark_email_unread</span>
          Suspicious Email Header Analyzer
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Analyze raw email headers to identify spoofing, phishing, and malicious routing.
        </p>
      </motion.div>
      <div className="flex flex-col gap-4">
        <textarea 
           className="w-full h-48 bg-surface-container-low border border-white/10 rounded-xl p-4 text-white font-mono text-sm" 
           placeholder="Paste raw email headers here..." 
           value={headers} 
           onChange={e => setHeaders(e.target.value)} 
        />
        <button onClick={analyze} className="bg-primary text-surface px-6 py-2 rounded-lg self-start">{loading ? "Analyzing..." : "Analyze Headers"}</button>
      </div>
      {result && (
        <div className="bg-surface-container-low border border-white/5 rounded-xl p-6 mt-4">
           <h3 className="text-lg font-bold text-white mb-4">Analysis Result</h3>
           <div className="grid grid-cols-3 gap-4 mb-4">
             <div className="bg-surface p-3 rounded"><span className="text-on-surface-variant text-xs block">SPF</span><span className={result.spf_status === "Pass" ? "text-success" : "text-error"}>{result.spf_status}</span></div>
             <div className="bg-surface p-3 rounded"><span className="text-on-surface-variant text-xs block">DKIM</span><span className={result.dkim_status === "Pass" ? "text-success" : "text-error"}>{result.dkim_status}</span></div>
             <div className="bg-surface p-3 rounded"><span className="text-on-surface-variant text-xs block">DMARC</span><span className={result.dmarc_status === "Pass" ? "text-success" : "text-error"}>{result.dmarc_status}</span></div>
           </div>
           <h4 className="text-white font-semibold mb-2">Indicators:</h4>
           <ul className="list-disc pl-5 text-on-surface-variant">
              {result.suspicious_indicators.map((ind: string, i: number) => <li key={i}>{ind}</li>)}
           </ul>
        </div>
      )}
    </div>
  );
}
