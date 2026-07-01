"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AlertPrioritizerPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/alert-prioritizer/prioritized")
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">priority_high</span>
          Security Alert Prioritizer
        </h1>
      </motion.div>
      {loading ? <div className="text-white">Loading...</div> : (
        <div className="flex flex-col gap-3">
          {alerts.map((a, i) => (
            <div key={a.id} className="bg-surface-container-low p-4 rounded-xl border border-white/5 flex items-center justify-between">
               <div>
                 <h4 className="text-white font-bold">{a.title}</h4>
                 <p className="text-xs text-on-surface-variant">{a.indicator} • {new Date(a.created_at).toLocaleString()}</p>
               </div>
               <div className={`px-3 py-1 rounded-full text-xs font-bold ${a.risk_score > 80 ? 'bg-error/20 text-error' : 'bg-warning/20 text-warning'}`}>
                 Risk: {a.risk_score}
               </div>
            </div>
          ))}
          {alerts.length === 0 && <div className="text-white/50">No active alerts to prioritize.</div>}
        </div>
      )}
    </div>
  );
}
