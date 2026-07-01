"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ExecutiveSummaryPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/executive-summary/")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">donut_small</span>
          Executive Risk Summary Dashboard
        </h1>
      </motion.div>
      {loading ? <div className="text-white">Generating summary...</div> : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="bg-surface-container-low p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
             <span className="text-4xl font-black text-white">{stats.total_threats}</span>
             <span className="text-sm text-on-surface-variant uppercase tracking-widest mt-2">Total Threats</span>
           </div>
           <div className="bg-surface-container-low p-6 rounded-xl border border-error/20 flex flex-col items-center justify-center text-center">
             <span className="text-4xl font-black text-error">{stats.critical_alerts}</span>
             <span className="text-sm text-on-surface-variant uppercase tracking-widest mt-2">Critical Alerts</span>
           </div>
           <div className="bg-surface-container-low p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
             <span className="text-4xl font-black text-warning">{stats.open_cases}</span>
             <span className="text-sm text-on-surface-variant uppercase tracking-widest mt-2">Open Cases</span>
           </div>
           <div className="bg-surface-container-low p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
             <span className="text-4xl font-black text-success">{stats.remediation_progress}%</span>
             <span className="text-sm text-on-surface-variant uppercase tracking-widest mt-2">Remediation</span>
           </div>
        </div>
      )}
    </div>
  );
}
