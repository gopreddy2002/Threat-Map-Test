"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ThreatIntelligenceBriefingPage() {
  const [briefings, setBriefings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/threat-intel/")
      .then(res => res.json())
      .then(data => setBriefings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">history_edu</span>
          Threat Intelligence Briefing Generator
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Generate comprehensive executive briefings from raw threat intelligence data.
        </p>
      </motion.div>

      {loading ? <div className="text-white">Loading...</div> : (
        <div className="grid gap-4">
           {briefings.map(b => (
             <div key={b.id} className="bg-surface-container-low border border-white/5 rounded-xl p-4">
               <h3 className="text-lg font-bold text-white">{b.title}</h3>
               <p className="text-sm text-on-surface-variant mt-2">{b.content}</p>
             </div>
           ))}
           {briefings.length === 0 && <div className="text-white/50">No briefings generated yet.</div>}
        </div>
      )}
    </div>
  );
}
