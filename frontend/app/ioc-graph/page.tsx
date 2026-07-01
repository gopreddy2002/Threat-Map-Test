"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function IocGraphPage() {
  const [indicator, setIndicator] = useState("");
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraph = async () => {
    if (!indicator) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/ioc-graph/${indicator}`);
      if (!response.ok) throw new Error("Failed to fetch graph data");
      const data = await response.json();
      setGraphData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          IOC Relationship Graph
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 bg-surface-container-low border border-white/5 rounded-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
           <div className="flex items-center gap-2">
              <input type="text" value={indicator} onChange={e => setIndicator(e.target.value)} placeholder="Search node..." className="bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 w-64" />
              <button onClick={fetchGraph} className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">{loading ? "Loading..." : "Search"}</button>
           </div>
        </div>

        {error && <div className="text-error bg-error/10 p-4 rounded-xl mb-4">Error: {error}</div>}

        <div className="flex-1 bg-surface border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center">
            {graphData ? (
                <div className="p-4 text-white overflow-auto w-full h-full">
                    <pre className="text-xs">{JSON.stringify(graphData, null, 2)}</pre>
                </div>
            ) : (
                <div className="text-center z-0 flex flex-col items-center gap-4 opacity-50">
                    <p className="text-sm text-on-surface-variant">Search for an IOC to see relationships.</p>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}
