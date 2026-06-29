"use client";

import React from "react";
import { motion } from "framer-motion";

export default function DarkWebPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">visibility_off</span>
          Dark Web Monitor
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Scan and monitor dark web marketplaces and forums for mentions of your organization.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 bg-surface-container-low border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white/80 border-b border-white/5 pb-2">Recent Mentions</h2>
            <div className="flex flex-col gap-3">
                {[
                    { source: "BreachForums", date: "2 hrs ago", threat: "High", title: "DB Dump Sale", preview: "Selling access to 500k customer records..." },
                    { source: "Exploit.in", date: "5 hrs ago", threat: "Medium", title: "New vulnerability discussion", preview: "Looking for exploits related to..." },
                    { source: "Tor Market", date: "1 day ago", threat: "Low", title: "General Discussion", preview: "Has anyone targeted them before?" }
                ].map((item, i) => (
                    <div key={i} className="bg-surface border border-white/10 p-4 rounded-xl flex flex-col gap-2 hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded">{item.source}</span>
                            <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">schedule</span> {item.date}
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{item.title}</h3>
                        <p className="text-xs text-on-surface-variant/70 italic line-clamp-2">"{item.preview}"</p>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
             <h2 className="text-lg font-semibold text-white/80 border-b border-white/5 pb-2">Threat Intelligence</h2>
             <div className="flex flex-col gap-4 mt-2">
                 <div className="bg-error/10 border border-error/30 p-4 rounded-xl text-center">
                     <span className="material-symbols-outlined text-[32px] text-error mb-2">warning</span>
                     <p className="text-error font-bold text-lg mb-1">2 Active Threats</p>
                     <p className="text-error/70 text-xs">Immediate action required</p>
                 </div>
                 
                 <div className="bg-surface border border-white/10 p-4 rounded-xl flex flex-col gap-3 mt-4">
                     <h3 className="text-xs font-semibold text-on-surface-variant uppercase">Keywords Monitored</h3>
                     <div className="flex flex-wrap gap-2">
                         {["@ThreatMap", "ThreatMap DB", "Nova-SC", "Employee Credentials"].map((kw, i) => (
                             <span key={i} className="text-[10px] bg-white/5 text-white/80 px-2 py-1 rounded-full border border-white/10">
                                 {kw}
                             </span>
                         ))}
                     </div>
                     <button className="text-primary text-xs font-medium hover:underline mt-2 self-start flex items-center gap-1">
                         <span className="material-symbols-outlined text-[14px]">add</span> Add Keyword
                     </button>
                 </div>
             </div>
        </div>
      </motion.div>
    </div>
  );
}
