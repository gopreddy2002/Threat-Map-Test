"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function DarkWebPage() {
  const [keyword, setKeyword] = useState("");
  const [mentions, setMentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMentions = async () => {
    if (!keyword) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/dark-web/${keyword}`);
      if (!response.ok) throw new Error("Failed to fetch dark web mentions");
      const data = await response.json();
      setMentions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">visibility_off</span>
          Dark Web Mention Monitor
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2">
          <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Search domain or brand..." className="flex-1 bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50" />
          <button onClick={searchMentions} disabled={loading} className="bg-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {loading ? "Searching..." : "Search"}
          </button>
      </motion.div>

      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      <div className="grid gap-4 mt-4">
          {mentions.map((mention, i) => (
              <div key={i} className="bg-surface-container-low border border-white/5 p-4 rounded-xl">
                  <div className="flex justify-between text-sm mb-2">
                      <span className="text-primary font-mono">{mention.source}</span>
                      <span className="text-on-surface-variant">{new Date(mention.date_found).toLocaleString()}</span>
                  </div>
                  <p className="text-white text-sm">{mention.snippet}</p>
              </div>
          ))}
          {mentions.length === 0 && !loading && !error && keyword && <p className="text-on-surface-variant">No mentions found for this keyword.</p>}
      </div>
    </div>
  );
}
