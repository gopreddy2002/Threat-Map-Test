"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

export default function AttackPathPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/attack-path/`)
      .then(res => res.json())
      .then(data => setPaths(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">route</span>
          Attack Path Visualizer
        </h1>
      </motion.div>
      {loading ? <div className="text-white">Loading paths...</div> : (
        <div className="grid gap-4">
          {paths.map(p => (
            <div key={p.id} className="bg-surface-container-low border border-white/5 rounded-xl p-6">
               <h3 className="text-lg font-bold text-white mb-2">{p.title} <span className="text-xs bg-error/20 text-error px-2 py-1 rounded ml-2">{p.risk_level}</span></h3>
               <div className="bg-surface border border-white/5 p-4 rounded flex items-center gap-4 text-on-surface-variant font-mono text-sm overflow-x-auto">
                 {p.steps?.nodes?.map((n: any, idx: number) => (
                   <React.Fragment key={n.id}>
                     <div className="bg-primary/20 text-primary px-3 py-1 rounded">{n.label}</div>
                     {idx < p.steps.nodes.length - 1 && <span>→</span>}
                   </React.Fragment>
                 ))}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
