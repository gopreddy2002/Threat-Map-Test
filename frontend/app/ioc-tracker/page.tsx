"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function IocTrackerPage() {
  const [iocs, setIocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/ioc-tracker/")
      .then(res => res.json())
      .then(data => setIocs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">timer</span>
          IOC Expiry & Confidence Tracker
        </h1>
      </motion.div>
      {loading ? <div className="text-white">Loading...</div> : (
        <table className="w-full text-left text-sm text-on-surface-variant">
          <thead className="bg-surface-container-low text-white uppercase">
            <tr>
              <th className="px-4 py-3">Indicator</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {iocs.map(ioc => (
              <tr key={ioc.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 font-mono text-white">{ioc.indicator}</td>
                <td className="px-4 py-3">{ioc.type}</td>
                <td className="px-4 py-3">{ioc.confidence_score}%</td>
                <td className="px-4 py-3">{ioc.is_active ? <span className="text-success">Active</span> : <span className="text-error">Expired</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
