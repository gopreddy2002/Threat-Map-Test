"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

export default function MitreNavigatorPage() {
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/mitre/`)
      .then(res => res.json())
      .then(data => setTechs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">account_tree</span>
          MITRE Technique Navigator
        </h1>
      </motion.div>
      {loading ? <div className="text-white">Loading MITRE DB...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techs.map(t => (
            <div key={t.id} className="bg-surface-container-low p-5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
              <h3 className="text-lg font-bold text-white">{t.technique_id}: {t.name}</h3>
              <p className="text-sm text-primary mb-2">{t.tactics?.join(", ")}</p>
              <p className="text-xs text-on-surface-variant">{t.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
