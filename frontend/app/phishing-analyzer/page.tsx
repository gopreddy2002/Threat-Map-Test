"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PhishingAnalyzerPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-2xl font-bold text-white tracking-wide font-headline-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">phishing</span>
          Phishing URL Analyzer
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Deeply scan and sandbox suspicious URLs to detect credential harvesting and malicious payloads.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-container-low border border-white/5 rounded-2xl p-6"
      >
        <div className="flex gap-4 mb-6">
            <input type="text" placeholder="Enter suspicious URL to analyze (e.g., http://login-update-secure.com)" className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" defaultValue="http://secure-paypal-update-login2026.com/verify" />
            <button className="bg-primary hover:bg-primary/90 text-background px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(var(--color-primary),0.3)]">
                <span className="material-symbols-outlined">analytics</span> Analyze URL
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
               <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                       <span className="material-symbols-outlined text-error text-2xl">warning</span>
                   </div>
                   <div>
                       <h3 className="text-error font-bold text-lg">Phishing Detected (98% Confidence)</h3>
                       <p className="text-error/80 text-xs mt-1">This URL is impersonating PayPal and attempting to harvest credentials.</p>
                   </div>
               </div>
               
               <div className="bg-surface border border-white/10 rounded-xl p-4 min-h-[300px] relative overflow-hidden flex flex-col">
                   <h3 className="text-xs font-semibold text-on-surface-variant uppercase mb-3">Screenshot Analysis</h3>
                   <div className="flex-1 border border-white/5 rounded bg-black/50 flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-scales.png')" }}></div>
                        <span className="material-symbols-outlined text-[64px] text-white/20">image_not_supported</span>
                        <div className="absolute top-2 right-2 bg-error text-error-content text-[10px] font-bold px-2 py-1 rounded">Spoofed Logo Detected</div>
                   </div>
               </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="bg-surface border border-white/10 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-on-surface-variant uppercase mb-3 border-b border-white/5 pb-2">Analysis Results</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center justify-between">
                            <span className="text-white/80">Domain Age</span>
                            <span className="text-error font-mono">2 Days</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-white/80">SSL Certificate</span>
                            <span className="text-warning font-mono">Let's Encrypt (Free)</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-white/80">Hosting Provider</span>
                            <span className="text-on-surface-variant font-mono">Unknown VPS</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-white/80">Redirect Chain</span>
                            <span className="text-primary font-mono">3 Hops</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-surface border border-white/10 rounded-xl p-4 flex-1">
                    <h3 className="text-xs font-semibold text-on-surface-variant uppercase mb-3 border-b border-white/5 pb-2">Heuristic Flags</h3>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2 text-xs">
                            <span className="material-symbols-outlined text-error text-[16px]">flag</span>
                            <span className="text-white/80">Suspicious keywords in domain (secure, update, login)</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                            <span className="material-symbols-outlined text-error text-[16px]">flag</span>
                            <span className="text-white/80">Hidden input fields for password harvesting</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                            <span className="material-symbols-outlined text-warning text-[16px]">flag</span>
                            <span className="text-white/80">Includes external scripts from unverified sources</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
