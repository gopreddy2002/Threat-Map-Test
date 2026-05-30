"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { WatchlistResponse } from "@/types";
import RiskBadge from "@/components/RiskBadge";
import { Eye, RefreshCw, Trash2, ArrowRight, Notebook } from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function WatchlistPage() {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading, error: queryError } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.getWatchlist(),
    staleTime: 10000, // 10s cache
  });

  const removeMutation = useMutation({
    mutationFn: (indicator: string) => api.removeFromWatchlist(indicator),
    onSuccess: (_, variables) => {
      setMessage(`Removed ${variables} from watchlist.`);
      setTimeout(() => setMessage(""), 3000);
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
    onError: (err) => {
      console.error(err);
    }
  });

  const scanMutation = useMutation({
    mutationFn: () => api.scanWatchlistAll(),
    onMutate: () => {
      setMessage("Triggering parallel OSINT scanner updates across watched IOC targets...");
    },
    onSuccess: () => {
      setMessage("Scanner job completed. Watchlist threat scores updated.");
      setTimeout(() => setMessage(""), 4000);
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
    onError: (err) => {
      console.error(err);
    }
  });

  const handleRemove = (indicator: string) => {
    removeMutation.mutate(indicator);
  };

  const handleScanAll = () => {
    scanMutation.mutate();
  };

  const isScanning = scanMutation.isPending;
  const error = queryError ? "Failed to fetch watchlist registry." : scanMutation.isError ? "Scanner job failed." : "";

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 py-8 animate-pulse">
        <div className="h-14 bg-white/5 rounded-xl border border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-md rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">visibility</span>
            <h2 className="text-xl font-black text-white tracking-tight font-headline-lg">
              Monitored Watchlist Hub
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant/80 font-body-sm">
            Continuous threat auditing on target indicators. Shifts in reputation trigger incident alerts.
          </p>
        </div>

        <div>
          <button
            onClick={handleScanAll}
            disabled={isScanning || watchlist.length === 0}
            className="py-2.5 px-4 bg-primary text-on-primary font-bold text-xs font-label-caps rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
          >
            <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
            {isScanning ? "SCANNING IOCS..." : "AUDIT WATCHLIST"}
          </button>
        </div>
      </div>

      {/* Action Messages */}
      {message && (
        <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg text-xs font-mono-sm transition-all">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-error-container/20 border border-error-container/30 text-error px-4 py-3 rounded-lg text-xs font-mono-sm transition-all">
          {error}
        </div>
      )}

      {/* Watchlist Cards Bento Grid */}
      {watchlist.length === 0 ? (
        <div className="glass-panel p-3xl rounded-xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-white/5 border border-white/10 text-on-surface-variant/40 flex items-center justify-center">
            <Eye size={48} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-md font-headline-sm">Watchlist is Empty</h3>
            <p className="text-xs text-on-surface-variant/80 max-w-sm leading-relaxed">
              No IOC targets are currently being monitored. Add assets from dynamic threat scan pages to track reputation deviations.
            </p>
          </div>
          <Link href="/" className="bg-primary/20 text-primary border border-primary/25 py-2 px-6 rounded-lg text-xs font-bold font-label-caps hover:bg-primary/30 transition-all">
            SCAN NEW IOC
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((item) => {
            // Determine risk level category strictly from score
            let level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
            if (item.last_risk_score >= 90) level = "CRITICAL";
            else if (item.last_risk_score >= 70) level = "HIGH";
            else if (item.last_risk_score >= 35) level = "MEDIUM";

            return (
              <div
                key={item.id}
                className="glass-panel p-md rounded-xl flex flex-col justify-between hover:border-white/20 transition-all duration-300 min-h-[190px]"
              >
                {/* Top Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <span className="inline-block text-[9px] font-mono-sm uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-on-surface-variant">
                        {item.type}
                      </span>
                      <h4 className="font-bold text-white text-sm tracking-wide break-all font-mono-md select-all truncate">
                        {item.indicator}
                      </h4>
                    </div>
                    <RiskBadge level={level} score={item.last_risk_score} />
                  </div>

                  {/* Notes Section */}
                  {item.notes && (
                    <div className="flex items-start gap-2 bg-surface-container-low p-2 rounded border border-white/5">
                      <Notebook size={12} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono-sm text-on-surface-variant">
                  <div className="space-y-0.5">
                    <p>Scanned: {item.last_scanned_at ? new Date(item.last_scanned_at).toLocaleDateString() : "Never"}</p>
                    <p>Added: {new Date(item.added_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemove(item.indicator)}
                      className="p-1.5 hover:bg-error-container/20 border border-transparent hover:border-error-container/30 rounded text-on-surface-variant hover:text-error transition-all"
                      title="Remove from watch"
                    >
                      <Trash2 size={14} />
                    </button>
                    {/* View Report Link */}
                    {/* Note: since watchlist doesn't store scanId, we redirect user to scan indicator via / to force cache query */}
                    <button
                      onClick={async () => {
                        // Request scan to retrieve target scan ID and open it
                        try {
                          const scanResult = await api.analyzeIndicator(item.indicator, item.type as "ip" | "url" | "domain" | "hash");
                          window.location.href = `/results/${scanResult.id}`;
                        } catch (err) {
                          console.error("Redirect failed:", err);
                        }
                      }}
                      className="p-1.5 hover:bg-white/5 border border-transparent hover:border-white/10 rounded text-primary hover:text-white transition-all flex items-center gap-0.5"
                    >
                      REPORT
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
