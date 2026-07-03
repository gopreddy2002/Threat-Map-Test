"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, ShieldAlert, Shield, AlertTriangle, TrendingUp, HelpCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// List of supported comparison countries
const COUNTRIES_LIST = [
  { code: "US", name: "United States" },
  { code: "CN", name: "China" },
  { code: "RU", name: "Russia" },
  { code: "IN", name: "India" },
  { code: "DE", name: "Germany" },
  { code: "GB", name: "United Kingdom" },
  { code: "BR", name: "Brazil" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "UA", name: "Ukraine" }
];

export default function CompareThreatsPage() {
  const [countryA, setCountryA] = useState("US");
  const [countryB, setCountryB] = useState("CN");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async (c1: string, c2: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCountryComparison(c1, c2);
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch threat comparison metrics. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(countryA, countryB);
  }, [countryA, countryB]);

  const handleSwap = () => {
    setCountryA(countryB);
    setCountryB(countryA);
  };

  const getThreatBadgeStyles = (level: string) => {
    const lvl = level.toUpperCase();
    if (lvl === "CRITICAL") return "bg-red-500/10 text-red-400 border-red-500/30";
    if (lvl === "HIGH") return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    if (lvl === "MEDIUM") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  };

  // Prepare chart data by merging day by day
  const getChartData = () => {
    if (!data) return [];
    const actA = data.country_a.recent_activity || [];
    const actB = data.country_b.recent_activity || [];
    const merged = [];
    for (let i = 0; i < actA.length; i++) {
      merged.push({
        date: actA[i].date,
        [data.country_a.name]: actA[i].attacks,
        [data.country_b.name]: actB[i].attacks,
      });
    }
    return merged;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 pt-6 px-4 md:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="material-symbols-outlined text-[36px] text-primary mb-2">compare</span>
        <h1 className="text-3xl font-black text-white tracking-tight font-headline-lg">Global Threat Comparison</h1>
        <p className="text-on-surface-variant text-sm mt-2 max-w-2xl mx-auto font-body-md">
          Compare side-by-side threat density, attack distributions, and historical activity profiles between two target regions.
        </p>
      </div>

      {/* Selectors and Swap button */}
      <div className="glass-panel p-md rounded-xl max-w-3xl mx-auto shadow-lg hover:border-white/10 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Country A */}
          <div className="flex-1 w-full space-y-1">
            <label className="text-[10px] font-mono-sm uppercase text-primary font-bold">Country A</label>
            <select
              value={countryA}
              onChange={(e) => {
                const val = e.target.value;
                if (val === countryB) {
                  setCountryB(countryA);
                }
                setCountryA(val);
              }}
              className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 cursor-pointer font-semibold"
            >
              {COUNTRIES_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="p-3 bg-surface-container-low border border-white/10 hover:border-primary/40 text-on-surface-variant hover:text-white rounded-full transition-all shrink-0 mt-4 md:mt-5 flex items-center justify-center hover:scale-105"
            title="Swap countries"
          >
            <ArrowLeftRight size={18} />
          </button>

          {/* Country B */}
          <div className="flex-1 w-full space-y-1">
            <label className="text-[10px] font-mono-sm uppercase text-tertiary-container font-bold text-orange-400">Country B</label>
            <select
              value={countryB}
              onChange={(e) => {
                const val = e.target.value;
                if (val === countryA) {
                  setCountryA(countryB);
                }
                setCountryB(val);
              }}
              className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 cursor-pointer font-semibold"
            >
              {COUNTRIES_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="text-xs font-mono-sm text-on-surface-variant uppercase tracking-widest">LOADING COMPARATIVE MATRIX...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto py-16 text-center glass-panel p-lg rounded-xl border-error/20">
          <span className="material-symbols-outlined text-[64px] text-error mb-4 font-light">report_problem</span>
          <h2 className="text-xl font-bold text-white mb-2 font-headline-sm">Telemetry Retrieval Error</h2>
          <p className="text-on-surface-variant text-sm mb-6">{error}</p>
          <button
            onClick={() => fetchComparison(countryA, countryB)}
            className="bg-primary text-on-primary py-2 px-6 rounded-lg text-xs font-bold font-mono-sm uppercase tracking-wider"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {!loading && !error && data && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Threat Leaderboard Banner */}
            <div className="bg-surface-container-low border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                  <ShieldAlert size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Comparative Threat Summary</h3>
                  <p className="text-xs text-on-surface-variant">
                    {data.comparison.higher_threat_country} exhibits the higher overall threat index.
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div className="text-xs font-mono-sm text-on-surface-variant uppercase">
                  Score Margin:{" "}
                  <span className="text-white font-bold font-mono-md text-sm">
                    {data.comparison.score_difference} points
                  </span>
                </div>
                <div className="text-xs font-mono-sm text-on-surface-variant uppercase border-l border-white/10 pl-4">
                  Attacks Differential:{" "}
                  <span className={`font-bold font-mono-md text-sm ${data.comparison.attacks_difference_percent >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {data.comparison.attacks_difference_percent >= 0 ? "+" : ""}
                    {data.comparison.attacks_difference_percent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Country A Profile Card */}
              <div className="glass-panel p-lg rounded-xl flex flex-col space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-mono-sm uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded text-on-surface-variant">
                      Country A
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">{data.country_a.name}</h2>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 border rounded-lg font-mono-sm uppercase tracking-wide ${getThreatBadgeStyles(data.country_a.threat_level)}`}>
                    {data.country_a.threat_level} Level
                  </span>
                </div>

                {/* KPI block */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-surface-container-low border border-white/5 rounded-lg">
                    <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase">Total Attacks</span>
                    <div className="text-lg font-black text-white mt-1">
                      {data.country_a.total_attacks.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-surface-container-low border border-white/5 rounded-lg">
                    <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase">Threat Score</span>
                    <div className="text-lg font-black text-primary mt-1 font-mono-md">
                      {data.country_a.threat_score} / 100
                    </div>
                  </div>
                </div>

                {/* Sub KPI details */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center bg-surface-container-lowest p-2.5 rounded border border-white/5 text-xs font-semibold">
                    <span className="text-on-surface-variant uppercase font-mono-sm text-[10px]">Critical Threats</span>
                    <span className="text-red-400">{data.country_a.critical_attacks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container-lowest p-2.5 rounded border border-white/5 text-xs font-semibold">
                    <span className="text-on-surface-variant uppercase font-mono-sm text-[10px]">High Severity</span>
                    <span className="text-orange-400">{data.country_a.high_attacks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container-lowest p-2.5 rounded border border-white/5 text-xs font-semibold">
                    <span className="text-on-surface-variant uppercase font-mono-sm text-[10px]">Dominant Vector</span>
                    <span className="text-white truncate max-w-[200px]" title={data.country_a.most_common_type}>
                      {data.country_a.most_common_type}
                    </span>
                  </div>
                </div>

                {/* Attack distribution progress bars */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase font-bold block mb-1">Attack Distribution</span>
                  {data.country_a.distribution.map((dist: any) => (
                    <div key={dist.name} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-on-surface">{dist.name}</span>
                        <span className="text-primary font-mono-sm">{dist.value}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${dist.value}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Country B Profile Card */}
              <div className="glass-panel p-lg rounded-xl flex flex-col space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-mono-sm uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded text-orange-400">
                      Country B
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">{data.country_b.name}</h2>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 border rounded-lg font-mono-sm uppercase tracking-wide ${getThreatBadgeStyles(data.country_b.threat_level)}`}>
                    {data.country_b.threat_level} Level
                  </span>
                </div>

                {/* KPI block */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-surface-container-low border border-white/5 rounded-lg">
                    <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase">Total Attacks</span>
                    <div className="text-lg font-black text-white mt-1">
                      {data.country_b.total_attacks.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-surface-container-low border border-white/5 rounded-lg">
                    <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase">Threat Score</span>
                    <div className="text-lg font-black text-orange-400 mt-1 font-mono-md">
                      {data.country_b.threat_score} / 100
                    </div>
                  </div>
                </div>

                {/* Sub KPI details */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center bg-surface-container-lowest p-2.5 rounded border border-white/5 text-xs font-semibold">
                    <span className="text-on-surface-variant uppercase font-mono-sm text-[10px]">Critical Threats</span>
                    <span className="text-red-400">{data.country_b.critical_attacks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container-lowest p-2.5 rounded border border-white/5 text-xs font-semibold">
                    <span className="text-on-surface-variant uppercase font-mono-sm text-[10px]">High Severity</span>
                    <span className="text-orange-400">{data.country_b.high_attacks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container-lowest p-2.5 rounded border border-white/5 text-xs font-semibold">
                    <span className="text-on-surface-variant uppercase font-mono-sm text-[10px]">Dominant Vector</span>
                    <span className="text-white truncate max-w-[200px]" title={data.country_b.most_common_type}>
                      {data.country_b.most_common_type}
                    </span>
                  </div>
                </div>

                {/* Attack distribution progress bars */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase font-bold block mb-1">Attack Distribution</span>
                  {data.country_b.distribution.map((dist: any) => (
                    <div key={dist.name} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-on-surface">{dist.name}</span>
                        <span className="text-orange-400 font-mono-sm">{dist.value}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-orange-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${dist.value}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Historical Activity Trend Chart */}
            <div className="glass-panel p-lg rounded-xl flex flex-col space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">timeline</span>
                <div>
                  <h3 className="font-bold text-white text-md font-headline-sm">14-Day Attack Activity Trend</h3>
                  <p className="text-[10px] text-on-surface-variant">Comparative historical attack volumes over past 14 days</p>
                </div>
              </div>

              <div className="h-[320px] w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#adc6ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#adc6ff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#ffffff40"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#ffffff40"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                    />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#ffffff20", borderRadius: "8px", fontSize: "12px" }}
                      labelFormatter={(label) => `📅 ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Area
                      type="monotone"
                      dataKey={data.country_a.name}
                      stroke="#adc6ff"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorA)"
                    />
                    <Area
                      type="monotone"
                      dataKey={data.country_b.name}
                      stroke="#ea580c"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorB)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
