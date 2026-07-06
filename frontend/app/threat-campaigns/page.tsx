"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function ThreatCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await api.getCampaigns();
        setCampaigns(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">track_changes</span>
          Threat Campaign Tracker
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Monitor known APT groups and their ongoing campaigns.
        </p>
      </motion.div>

      {loading && <div className="text-white">Loading campaigns...</div>}
      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      {!loading && !error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {campaigns.length === 0 ? <div className="text-white">No campaigns found.</div> : campaigns.map((campaign, i) => (
              <div key={i} className="bg-surface-container-low border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all group">
                 <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{campaign.name}</h3>
                 <p className="text-sm text-on-surface-variant mb-4">{campaign.description}</p>
                 <div className="flex justify-between items-end pt-4 border-t border-white/5">
                    <div className="flex flex-col gap-1">
                       <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Created</span>
                       <span className="text-xs text-white">{new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>
           ))}
        </motion.div>
      )}
    </div>
  );
}
