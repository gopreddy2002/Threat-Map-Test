"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function RemediationPlaybookPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/playbooks/")
      .then(res => res.json())
      .then(data => setPlaybooks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">menu_book</span>
          Remediation Playbook Builder
        </h1>
      </motion.div>
      {loading ? <div className="text-white">Loading playbooks...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playbooks.map(p => (
            <div key={p.id} className="bg-surface-container-low p-5 rounded-xl border border-white/5">
              <h3 className="text-lg font-bold text-white">{p.title}</h3>
              <p className="text-xs text-on-surface-variant mb-4">Owner: {p.owner} • Status: {p.status}</p>
              <div className="space-y-2">
                {p.steps?.map((step: any, i: number) => (
                  <div key={i} className="flex gap-2 text-sm text-on-surface-variant bg-surface p-2 rounded border border-white/5">
                    <span className="text-primary">{i+1}.</span>
                    <span>{step.action || JSON.stringify(step)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {playbooks.length === 0 && <div className="text-white/50">No playbooks found. Create one to get started.</div>}
        </div>
      )}
    </div>
  );
}
