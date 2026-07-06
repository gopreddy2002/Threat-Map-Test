"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

export default function DomainReputationPage() {
  const [domain, setDomain] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!domain) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/domain-reputation/${domain}`);
      const data = await res.json();
      setHistory(data);
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
          <span className="material-symbols-outlined text-primary text-3xl">domain_verification</span>
          Domain Reputation History
        </h1>
      </motion.div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={domain} 
          onChange={e => setDomain(e.target.value)} 
          className="flex-1 bg-surface-container-low border border-white/10 rounded-lg px-4 text-white" 
          placeholder="example.com" 
        />
        <button onClick={fetchHistory} className="bg-primary text-surface px-6 py-2 rounded-lg">{loading ? "Loading..." : "Search"}</button>
      </div>
      <div className="grid gap-4">
         {history.length > 0 ? history.map(h => (
           <div key={h.id} className="bg-surface-container-low p-4 rounded-xl border border-white/5">
             <div className="text-white font-bold">{h.domain} - Risk: {h.risk_score}</div>
             <div className="text-sm text-on-surface-variant">Scanned: {new Date(h.scan_date).toLocaleString()}</div>
           </div>
         )) : (
           !loading && domain && <div className="text-white/50">No history found for this domain.</div>
         )}
      </div>
    </div>
  );
}
