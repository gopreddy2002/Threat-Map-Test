"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AttackSurfacePage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">radar</span>
          Company Attack Surface
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Monitor your organization's external footprint and exposed assets.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* Stats Row */}
        {[
          { label: "Exposed Assets", value: "1,204", icon: "dns", color: "text-primary" },
          { label: "Open Ports", value: "342", icon: "router", color: "text-warning" },
          { label: "Critical Vulnerabilities", value: "12", icon: "bug_report", color: "text-error" },
          { label: "Leaked Credentials", value: "89", icon: "key", color: "text-error" },
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-low border border-white/5 p-4 rounded-2xl flex items-center gap-4">
             <div className={`w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center ${stat.color}`}>
                <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
             </div>
             <div>
                <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
             </div>
          </div>
        ))}
      </motion.div>

      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.2 }}
         className="bg-surface-container-low border border-white/5 rounded-2xl p-6 min-h-[400px]"
      >
         <h2 className="text-lg font-semibold text-white/80 mb-4">Asset Inventory Map</h2>
         <div className="w-full h-[300px] bg-surface border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="text-center z-10 flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-[48px] text-primary/40 animate-pulse">public</span>
                <p className="text-sm text-on-surface-variant">Interactive Asset Map Visualization Placeholder</p>
             </div>
         </div>
      </motion.div>
    </div>
  );
}
