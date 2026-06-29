"use client";

import React from "react";
import { motion } from "framer-motion";

export default function IncidentBoardPage() {
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Kanban Board Columns */}
        {["Triage", "Investigating", "Resolved"].map((col, i) => (
          <div key={col} className="bg-surface-container-low border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white/80">{col}</h2>
            <div className="flex flex-col gap-3">
              {[1, 2].map((card) => (
                <div key={card} className="bg-surface border border-white/10 p-3 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <span className={`text-[10px] font-mono-sm px-2 py-0.5 rounded-full ${i === 0 ? 'bg-error/20 text-error' : i === 1 ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                      {i === 0 ? "HIGH" : i === 1 ? "MED" : "LOW"}
                    </span>
                    <span className="text-xs text-on-surface-variant">#INC-2026-{col[0]}{card}</span>
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1 relative z-10">Suspicious Login Attempt</h3>
                  <p className="text-xs text-on-surface-variant/70 mb-3 relative z-10">Detected anomalous login from unfamiliar IP.</p>
                  <div className="flex justify-between items-center text-xs text-on-surface-variant relative z-10">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> 2h ago</span>
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">JD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
