"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type IncidentCase = {
  id: string;
  title: string;
  severity: string;
  status: string;
  assignee: string;
  updatedAt: string;
  iocs: number;
};

export default function CasesPage() {
  const [cases] = useState<IncidentCase[]>([]);
  const [filter, setFilter] = useState("All");

  const filteredCases = filter === "All" ? cases : cases.filter(c => c.status === filter);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "high": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-green-500 bg-green-500/10 border-green-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "investigating": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "closed": return "text-gray-400 bg-gray-400/10 border-gray-400/20";
      default: return "text-white/70 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="relative min-h-full flex flex-col gap-6">
      <div className="flex items-center justify-between z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Case Management</h1>
          <p className="text-on-surface-variant max-w-2xl text-sm">
            Track and manage active security incidents, investigations, and remediation tasks.
          </p>
        </div>
        <button disabled title="Case persistence API is not configured" className="px-4 py-2 bg-primary/40 text-black/60 font-semibold rounded-lg flex items-center gap-2 cursor-not-allowed">
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Case
        </button>
      </div>

      <div className="flex items-center gap-2 z-10">
        {["All", "Open", "Investigating", "Closed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filter === f 
                ? "bg-primary/20 text-primary border-primary/50" 
                : "bg-white/5 text-on-surface-variant border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 z-10">
        <AnimatePresence>
          {filteredCases.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-low border border-white/10 rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono font-bold text-primary">{c.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(c.severity)}`}>
                      {c.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${getStatusColor(c.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {c.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">{c.title}</h3>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span>{c.assignee}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">bug_report</span>
                    <span>{c.iocs} IOCs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>{c.updatedAt}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredCases.length === 0 && (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <span className="material-symbols-outlined text-[48px] text-white/20 mb-3">inbox</span>
            <p className="text-on-surface-variant text-sm">No cases found matching the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
