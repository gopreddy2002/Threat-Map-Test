"use client";

import React from "react";
import { motion } from "framer-motion";

export default function EvidenceLockerPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
          Analyst Evidence Locker
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Securely store, tag, and collaborate on malicious samples, PCAPs, and forensic evidence.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-container-low border border-white/5 rounded-2xl flex flex-col overflow-hidden min-h-[600px]"
      >
         {/* Toolbar */}
         <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surface/50">
             <div className="flex items-center gap-3">
                 <button className="bg-primary hover:bg-primary/90 text-background px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                     <span className="material-symbols-outlined text-[18px]">upload</span> Upload Evidence
                 </button>
                 <div className="h-6 w-px bg-white/10 mx-2"></div>
                 <button className="text-on-surface-variant hover:text-white px-3 py-1.5 rounded flex items-center gap-2 text-sm transition-colors">
                     <span className="material-symbols-outlined text-[18px]">filter_list</span> Filter
                 </button>
             </div>
             <div className="relative">
                 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                 <input type="text" placeholder="Search evidence..." className="bg-surface border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 w-64" />
             </div>
         </div>

         {/* File List */}
         <div className="flex-1 overflow-x-auto">
             <table className="w-full text-left text-sm text-on-surface-variant">
                 <thead className="text-xs uppercase bg-surface/30 border-b border-white/5">
                     <tr>
                         <th className="px-6 py-4 font-medium text-white/60">Name</th>
                         <th className="px-6 py-4 font-medium text-white/60">Type</th>
                         <th className="px-6 py-4 font-medium text-white/60">Date Uploaded</th>
                         <th className="px-6 py-4 font-medium text-white/60">Uploaded By</th>
                         <th className="px-6 py-4 font-medium text-white/60">Case ID</th>
                         <th className="px-6 py-4 font-medium text-white/60 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                     {[
                         { name: "suspicious_payload.exe", type: "PE32 Executable", date: "Oct 24, 2026", user: "Karan", case: "INC-2026-T1", icon: "terminal", color: "text-error" },
                         { name: "traffic_capture.pcap", type: "Network Capture", date: "Oct 23, 2026", user: "Alice", case: "INC-2026-T2", icon: "wifi", color: "text-primary" },
                         { name: "phishing_email.eml", type: "Email File", date: "Oct 20, 2026", user: "Karan", case: "INC-2026-I1", icon: "mail", color: "text-warning" },
                         { name: "memory_dump.raw", type: "Memory Dump", date: "Oct 19, 2026", user: "Bob", case: "INC-2026-R1", icon: "memory", color: "text-white" },
                     ].map((item, i) => (
                         <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                     <span className={`material-symbols-outlined text-[20px] ${item.color}`}>{item.icon}</span>
                                     <span className="font-medium text-white group-hover:text-primary transition-colors cursor-pointer">{item.name}</span>
                                 </div>
                             </td>
                             <td className="px-6 py-4 text-xs">{item.type}</td>
                             <td className="px-6 py-4 text-xs">{item.date}</td>
                             <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                     <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] font-bold">{item.user[0]}</div>
                                     <span className="text-xs">{item.user}</span>
                                 </div>
                             </td>
                             <td className="px-6 py-4">
                                 <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] font-mono text-white/70">{item.case}</span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button className="p-1.5 text-on-surface-variant hover:text-white hover:bg-white/5 rounded transition-colors" title="Download"><span className="material-symbols-outlined text-[16px]">download</span></button>
                                     <button className="p-1.5 text-on-surface-variant hover:text-white hover:bg-white/5 rounded transition-colors" title="Analyze"><span className="material-symbols-outlined text-[16px]">science</span></button>
                                     <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors" title="Delete"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                                 </div>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </motion.div>
    </div>
  );
}
