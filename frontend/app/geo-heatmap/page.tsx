"use client";

import React from "react";
import { motion } from "framer-motion";

export default function GeoHeatmapPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-[85vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 shrink-0"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">map</span>
          Geo Threat Heatmap
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Live visualization of global threat activity, attack origins, and targeted regions.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-surface-container-low border border-white/5 rounded-2xl relative overflow-hidden flex flex-col"
      >
         {/* Map Overlay HUD */}
         <div className="absolute top-4 left-4 z-20 flex flex-col gap-4 w-64 pointer-events-none">
             <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl pointer-events-auto">
                 <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Live Feed</h3>
                 <div className="flex flex-col gap-2">
                     {[
                         { loc: "Moscow, RU", target: "Frankfurt, DE", type: "DDoS" },
                         { loc: "Pyongyang, KP", target: "Tokyo, JP", type: "Malware Drop" },
                         { loc: "Unknown (Tor)", target: "New York, US", type: "SQLi Attempt" }
                     ].map((atk, i) => (
                         <div key={i} className="flex flex-col border-l-2 border-error pl-2 py-1">
                             <div className="flex justify-between items-center text-[10px]">
                                 <span className="text-white/60">{atk.loc}</span>
                                 <span className="material-symbols-outlined text-[12px] text-error">arrow_forward</span>
                                 <span className="text-white">{atk.target}</span>
                             </div>
                             <span className="text-[10px] font-bold text-error mt-0.5">{atk.type}</span>
                         </div>
                     ))}
                 </div>
             </div>
         </div>

         <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
             <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                 <span className="text-[10px] text-white/50 uppercase">Intensity</span>
                 <div className="w-24 h-2 bg-gradient-to-r from-success via-warning to-error rounded-full"></div>
             </div>
         </div>

         {/* Map Area */}
         <div className="flex-1 bg-[#0a0f1a] relative flex items-center justify-center">
             {/* Fake Map Grid */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 0%, #0a0f1a 100%)' }}></div>
             
             {/* Fake Nodes / Heat */}
             <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-error/30 blur-[40px] rounded-full animate-pulse"></div>
             <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-warning/20 blur-[50px] rounded-full"></div>
             <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-primary/40 blur-[30px] rounded-full"></div>

             <div className="text-center z-10 flex flex-col items-center gap-4">
                 <span className="material-symbols-outlined text-[64px] text-white/10 animate-spin" style={{ animationDuration: '10s' }}>public</span>
                 <h2 className="text-xl font-semibold text-white/30">Global Threat Map (Placeholder)</h2>
             </div>
         </div>
      </motion.div>
    </div>
  );
}
