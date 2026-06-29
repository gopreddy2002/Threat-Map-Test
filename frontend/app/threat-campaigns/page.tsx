"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ThreatCampaignsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">track_changes</span>
          Threat Campaign Tracker
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Monitor known APT groups and their ongoing campaigns.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
         {[
           { name: "Operation Phantom", actor: "APT 29", status: "Active", risk: "High", date: "Oct 2026" },
           { name: "Silent Whisper", actor: "Lazarus Group", status: "Monitoring", risk: "Critical", date: "Sep 2026" },
           { name: "Shadow Drop", actor: "FIN7", status: "Dormant", risk: "Medium", date: "Aug 2026" },
           { name: "Night Hawk", actor: "Sandworm", status: "Active", risk: "High", date: "Nov 2026" },
         ].map((campaign, i) => (
            <div key={i} className="bg-surface-container-low border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all group">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${campaign.status === 'Active' ? 'bg-error animate-pulse' : campaign.status === 'Monitoring' ? 'bg-warning' : 'bg-on-surface-variant'}`} />
                     <span className="text-xs text-on-surface-variant uppercase tracking-wider">{campaign.status}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded bg-surface border border-white/10 ${campaign.risk === 'Critical' ? 'text-error' : campaign.risk === 'High' ? 'text-warning' : 'text-primary'}`}>{campaign.risk} RISK</span>
               </div>
               <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{campaign.name}</h3>
               <p className="text-sm text-on-surface-variant mb-4">Attributed to: <span className="font-semibold text-white/80">{campaign.actor}</span></p>
               
               <div className="flex justify-between items-end pt-4 border-t border-white/5">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Last Activity</span>
                     <span className="text-xs text-white">{campaign.date}</span>
                  </div>
                  <button className="text-primary text-sm hover:underline flex items-center gap-1 font-medium">
                     View Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
               </div>
            </div>
         ))}
      </motion.div>
    </div>
  );
}
