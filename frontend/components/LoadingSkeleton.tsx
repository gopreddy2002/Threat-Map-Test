"use client";

import React, { useEffect, useState } from "react";

const stages = [
  "Collecting provider data",
  "Calculating risk score",
  "Generating AI analysis",
  "Preparing report",
];

export const LoadingSkeleton: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStage((current) => Math.min(current + 1, stages.length - 1));
    }, 2200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-8" role="status" aria-live="polite">
      <div className="glass-panel rounded-xl border border-primary/20 p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-bold text-white">Analyzing indicator</h2>
            <p className="text-xs text-on-surface-variant">This report will appear automatically when processing completes.</p>
          </div>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stages.map((stage, index) => (
            <li key={stage} className={`rounded-lg border px-3 py-3 text-xs ${index < activeStage ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : index === activeStage ? "border-primary/40 bg-primary/10 text-primary" : "border-white/5 bg-white/[0.02] text-on-surface-variant"}`}>
              <span className="font-bold mr-2">{index < activeStage ? "✓" : index + 1}</span>{stage}
            </li>
          ))}
        </ol>
      </div>
      <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Risk Gauge and top summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-panel p-lg rounded-xl flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-32 h-32 rounded-full bg-white/5 mb-4" />
          <div className="h-4 w-24 bg-white/5 rounded" />
        </div>
        <div className="md:col-span-2 glass-panel p-lg rounded-xl flex flex-col justify-between min-h-[300px]">
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-white/5 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-5/6 bg-white/5 rounded" />
            <div className="h-4 w-4/6 bg-white/5 rounded" />
          </div>
          <div className="h-10 w-36 bg-white/5 rounded mt-6" />
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel p-md rounded-xl h-40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-white/5 rounded" />
                  <div className="h-3 w-16 bg-white/5 rounded" />
                </div>
              </div>
            </div>
            <div className="h-4 w-full bg-white/5 rounded" />
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
