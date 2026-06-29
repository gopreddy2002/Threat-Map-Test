"use client";

import React from "react";
import { motion } from "framer-motion";

export default function IocGraphPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 shrink-0"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          IOC Relationship Graph
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Visualize complex relationships between Indicators of Compromise.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-surface-container-low border border-white/5 rounded-2xl p-4 flex flex-col"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
           <div className="flex items-center gap-2">
              <input type="text" placeholder="Search node..." className="bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 w-64" />
              <button className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Search</button>
           </div>
           <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant transition-colors" title="Zoom In"><span className="material-symbols-outlined text-[20px]">zoom_in</span></button>
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant transition-colors" title="Zoom Out"><span className="material-symbols-outlined text-[20px]">zoom_out</span></button>
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant transition-colors" title="Reset View"><span className="material-symbols-outlined text-[20px]">center_focus_strong</span></button>
           </div>
        </div>

        {/* Graph Area */}
        <div className="flex-1 bg-surface border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center">
            {/* Fake Graph Nodes */}
            <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-error/20 border border-error flex items-center justify-center z-10 shadow-[0_0_15px_rgba(255,0,0,0.2)]">
                <span className="material-symbols-outlined text-error">bug_report</span>
            </div>
            <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full bg-primary/20 border border-primary flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-primary text-3xl">dns</span>
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-14 h-14 rounded-full bg-warning/20 border border-warning flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-warning">public</span>
            </div>

            {/* Fake Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
               <line x1="28%" y1="28%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-white" strokeDasharray="4" />
               <line x1="50%" y1="50%" x2="72%" y2="62%" stroke="currentColor" strokeWidth="2" className="text-white" />
            </svg>

            <div className="text-center z-0 flex flex-col items-center gap-4 opacity-50 mt-40">
                <p className="text-sm text-on-surface-variant">Interactive Node Graph Placeholder</p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
