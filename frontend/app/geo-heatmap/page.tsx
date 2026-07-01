"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function GeoHeatmapPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/geo-heatmap/");
        if (!response.ok) throw new Error("Failed to fetch geo heatmap data");
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">map</span>
          Geo Threat Heatmap
        </h1>
      </motion.div>

      {loading && <div className="text-white">Loading map data...</div>}
      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      {!loading && !error && (
        <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 min-h-[500px]">
           <div className="w-full h-[400px] bg-surface border border-white/10 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 text-white overflow-auto w-full h-full">
                  <p className="mb-4 text-on-surface-variant">Geo Map Points Data (Map UI Placeholder):</p>
                  <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
