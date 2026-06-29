"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function IncidentBoardPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/incidents/");
        if (!response.ok) throw new Error("Failed to fetch incidents");
        const data = await response.json();
        setIncidents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  const columns = ["Open", "Investigating", "Resolved"];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">assignment</span>
          Incident Case Board
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Track, manage, and investigate active security incidents.
        </p>
      </motion.div>

      {loading && <div className="text-white">Loading incidents...</div>}
      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {columns.map((col, i) => (
            <div key={col} className="bg-surface-container-low border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-white/80">{col}</h2>
              <div className="flex flex-col gap-3">
                {incidents.filter(inc => inc.status === col).length === 0 ? (
                  <div className="text-xs text-on-surface-variant/50 text-center p-4">No incidents</div>
                ) : (
                  incidents.filter(inc => inc.status === col).map((card: any) => (
                    <div key={card.id} className="bg-surface border border-white/10 p-3 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className={`text-[10px] font-mono-sm px-2 py-0.5 rounded-full ${card.priority === 'Critical' || card.priority === 'High' ? 'bg-error/20 text-error' : card.priority === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                          {card.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-on-surface-variant">#INC-{card.id}</span>
                      </div>
                      <h3 className="text-sm font-medium text-white mb-1 relative z-10">{card.title}</h3>
                      <p className="text-xs text-on-surface-variant/70 mb-3 relative z-10">{card.description || 'No description provided.'}</p>
                      <div className="flex justify-between items-center text-xs text-on-surface-variant relative z-10">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">person</span> {card.reporter}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
