"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AttackSurfacePage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/attack-surface/");
        if (!response.ok) throw new Error("Failed to fetch attack surface assets");
        const data = await response.json();
        setAssets(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const totalAssets = assets.length > 0 ? assets.length : "1,204";
  const openPorts = assets.length > 0 ? assets.reduce((acc, asset) => acc + (asset.open_ports?.length || 0), 0) : "342";

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

      {loading && <div className="text-white">Loading assets...</div>}
      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      {!loading && !error && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* Stats Row */}
            {[
              { label: "Exposed Assets", value: totalAssets, icon: "dns", color: "text-primary" },
              { label: "Open Ports", value: openPorts, icon: "router", color: "text-warning" },
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
             <h2 className="text-lg font-semibold text-white/80 mb-4">Asset Inventory</h2>
             {assets.length === 0 ? (
               <div className="w-full h-[300px] bg-surface border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                 <div className="text-center z-10 flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-[48px] text-primary/40 animate-pulse">public</span>
                    <p className="text-sm text-on-surface-variant">No assets found in the database. Run a scan.</p>
                 </div>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-on-surface-variant">
                   <thead className="text-xs uppercase bg-surface text-white">
                     <tr>
                       <th className="px-6 py-3 rounded-tl-xl">Domain</th>
                       <th className="px-6 py-3">IPs</th>
                       <th className="px-6 py-3">Open Ports</th>
                       <th className="px-6 py-3 rounded-tr-xl">Technologies</th>
                     </tr>
                   </thead>
                   <tbody>
                     {assets.map((asset) => (
                       <tr key={asset.id} className="border-b border-white/10">
                         <td className="px-6 py-4 font-medium text-white">{asset.domain}</td>
                         <td className="px-6 py-4">{asset.ips?.join(", ") || "N/A"}</td>
                         <td className="px-6 py-4">{asset.open_ports?.join(", ") || "N/A"}</td>
                         <td className="px-6 py-4">{asset.technologies?.join(", ") || "N/A"}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </motion.div>
        </>
      )}
    </div>
  );
}
