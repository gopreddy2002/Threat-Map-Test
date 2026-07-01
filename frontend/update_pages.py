import os

pages = {
    "threat-campaigns": """"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThreatCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/campaigns/");
        if (!response.ok) throw new Error("Failed to fetch campaigns");
        const data = await response.json();
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
""",
    "ioc-graph": """"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function IocGraphPage() {
  const [indicator, setIndicator] = useState("");
  const [graphData, setGraphData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraph = async () => {
    if (!indicator) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/ioc-graph/${indicator}`);
      if (!response.ok) throw new Error("Failed to fetch graph data");
      const data = await response.json();
      setGraphData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          IOC Relationship Graph
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 bg-surface-container-low border border-white/5 rounded-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
           <div className="flex items-center gap-2">
              <input type="text" value={indicator} onChange={e => setIndicator(e.target.value)} placeholder="Search node..." className="bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 w-64" />
              <button onClick={fetchGraph} className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">{loading ? "Loading..." : "Search"}</button>
           </div>
        </div>

        {error && <div className="text-error bg-error/10 p-4 rounded-xl mb-4">Error: {error}</div>}

        <div className="flex-1 bg-surface border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center">
            {graphData ? (
                <div className="p-4 text-white overflow-auto w-full h-full">
                    <pre className="text-xs">{JSON.stringify(graphData, null, 2)}</pre>
                </div>
            ) : (
                <div className="text-center z-0 flex flex-col items-center gap-4 opacity-50">
                    <p className="text-sm text-on-surface-variant">Search for an IOC to see relationships.</p>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}
""",
    "dark-web": """"use client";

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
""",
    "malware-explorer": """"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MalwareExplorerPage() {
  const [malware, setMalware] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMalware = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/malware/");
        if (!response.ok) throw new Error("Failed to fetch malware families");
        const data = await response.json();
        setMalware(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMalware();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">bug_report</span>
          Malware Family Explorer
        </h1>
      </motion.div>

      {loading && <div className="text-white">Loading malware data...</div>}
      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {malware.map((mw, i) => (
              <div key={i} className="bg-surface-container-low border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all">
                 <h3 className="text-xl font-bold text-error mb-1">{mw.name}</h3>
                 <p className="text-xs text-on-surface-variant mb-4">Aliases: {mw.aliases || "None"}</p>
                 <p className="text-sm text-white/80 mb-4">{mw.description}</p>
                 <div className="text-xs font-mono text-on-surface-variant bg-surface p-2 rounded">
                    Indicators: {mw.indicators?.join(", ")}
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
""",
    "phishing-analyzer": """"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function PhishingAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/phishing/analyze?url=${encodeURIComponent(url)}`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to analyze URL");
      const data = await response.json();
      setResult(data);
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
          <span className="material-symbols-outlined text-primary text-3xl">phishing</span>
          Phishing URL Analyzer
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://suspicious-link.com" className="flex-1 bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50" />
          <button onClick={analyze} disabled={loading} className="bg-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {loading ? "Analyzing..." : "Analyze"}
          </button>
      </motion.div>

      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      {result && (
        <div className={`mt-6 p-6 border rounded-xl ${result.is_phishing ? 'bg-error/10 border-error/50 text-error' : 'bg-success/10 border-success/50 text-success'}`}>
           <h2 className="text-xl font-bold mb-2">{result.is_phishing ? "⚠️ Phishing Detected" : "✅ Safe URL"}</h2>
           <p className="mb-4">Risk Score: {result.risk_score}</p>
           <ul className="list-disc pl-5">
              {result.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
           </ul>
        </div>
      )}
    </div>
  );
}
""",
    "cve-checker": """"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function CveCheckerPage() {
  const [cveId, setCveId] = useState("");
  const [cveData, setCveData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCve = async () => {
    if (!cveId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/cve/${cveId}`);
      if (!response.ok) throw new Error("Failed to fetch CVE data");
      const data = await response.json();
      setCveData(data);
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
          <span className="material-symbols-outlined text-primary text-3xl">security</span>
          CVE Impact Checker
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
          <input type="text" value={cveId} onChange={e => setCveId(e.target.value)} placeholder="CVE-2026-1234" className="flex-1 bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50" />
          <button onClick={fetchCve} disabled={loading} className="bg-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              {loading ? "Checking..." : "Check"}
          </button>
      </motion.div>

      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      {cveData && (
        <div className="mt-6 p-6 border border-white/10 bg-surface-container-low rounded-xl">
           <h2 className="text-2xl font-bold text-white mb-2">{cveData.cve_id} <span className="text-error text-lg bg-error/20 px-2 py-1 rounded">CVSS: {cveData.cvss_score}</span></h2>
           <p className="text-on-surface-variant mb-4">{cveData.description}</p>
           <h3 className="font-semibold text-white mt-4">Affected Products:</h3>
           <ul className="text-on-surface-variant text-sm mb-4">
              {cveData.affected_products.map((p: string, i: number) => <li key={i}>{p}</li>)}
           </ul>
           <h3 className="font-semibold text-white mt-4">Remediation:</h3>
           <p className="text-on-surface-variant text-sm">{cveData.remediation}</p>
        </div>
      )}
    </div>
  );
}
""",
    "geo-heatmap": """"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function GeoHeatmapPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/geo-heatmap/");
        if (!response.ok) throw new Error("Failed to fetch geo heatmap data");
        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">map</span>
          Geo Threat Heatmap
        </h1>
      </motion.div>

      {loading && <div className="text-white">Loading map data...</div>}
      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      {!loading && !error && (
        <div className="bg-surface-container-low border border-white/5 rounded-2xl p-6 min-h-[500px]">
           <div className="w-full h-[400px] bg-surface border border-white/10 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 text-white overflow-auto w-full h-full">
                  <p className="mb-4 text-on-surface-variant">Geo Map Points Data (Map UI Placeholder):</p>
                  <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
""",
    "evidence-locker": """"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function EvidenceLockerPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/evidence/");
      if (!response.ok) throw new Error("Failed to fetch evidence files");
      const data = await response.json();
      setFiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/evidence/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      fetchFiles();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/v1/evidence/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchFiles();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">folder_special</span>
          Analyst Evidence Locker
        </h1>
      </motion.div>

      <div className="flex gap-4">
          <label className="bg-primary text-surface px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer">
              Upload Evidence
              <input type="file" className="hidden" onChange={handleUpload} />
          </label>
      </div>

      {error && <div className="text-error bg-error/10 p-4 rounded-xl">Error: {error}</div>}

      <div className="bg-surface-container-low border border-white/5 rounded-2xl overflow-hidden mt-4">
        {loading && <div className="p-4 text-white">Loading...</div>}
        {!loading && files.length === 0 && <div className="p-4 text-on-surface-variant">No evidence files found.</div>}
        {!loading && files.length > 0 && (
          <table className="w-full text-left text-sm text-on-surface-variant">
             <thead className="text-xs uppercase bg-surface text-white">
                <tr>
                   <th className="px-6 py-3">Filename</th>
                   <th className="px-6 py-3">Uploader</th>
                   <th className="px-6 py-3">Date</th>
                   <th className="px-6 py-3 text-right">Actions</th>
                </tr>
             </thead>
             <tbody>
                {files.map((f: any) => (
                   <tr key={f.id} className="border-b border-white/10">
                      <td className="px-6 py-4 text-white font-medium">{f.filename}</td>
                      <td className="px-6 py-4">{f.uploader}</td>
                      <td className="px-6 py-4">{new Date(f.uploaded_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => handleDelete(f.id)} className="text-error hover:underline text-xs">Delete</button>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
"""
}

base_dir = r"c:\Users\Karan\Desktop\Threadmap\frontend\app"

for folder, content in pages.items():
    path = os.path.join(base_dir, folder, "page.tsx")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

print("Updated all 8 remaining frontend pages successfully!")
