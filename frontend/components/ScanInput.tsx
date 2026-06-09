import React, { useState } from "react";
import { motion } from "framer-motion";

interface ScanInputProps {
  onScan: (indicator: string, type: ScanType) => void;
  isLoading?: boolean;
}

export type ScanType = "ip" | "url" | "domain" | "hash" | "bulk" | "cve";

export const ScanInput: React.FC<ScanInputProps> = ({ onScan, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState<ScanType>("ip");
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const tabConfig: Record<ScanType, any> = {
    ip: {
      label: "IP Address",
      placeholder: "Enter IPv4 address (e.g., 192.0.2.1)...",
      icon: <span className="material-symbols-outlined text-[18px]">sensors</span>,
      validate: (val: string) => {
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        return ipRegex.test(val.trim()) ? "" : "Invalid IPv4 address format.";
      },
    },
    domain: {
      label: "Domain",
      placeholder: "Enter domain (e.g., malicious-dns.io)...",
      icon: <span className="material-symbols-outlined text-[18px]">language</span>,
      validate: (val: string) => {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
        return domainRegex.test(val.trim()) ? "" : "Invalid domain format.";
      },
    },
    url: {
      label: "URL",
      placeholder: "Enter full URL (e.g., https://phishing-update.net/login)...",
      icon: <span className="material-symbols-outlined text-[18px]">link</span>,
      validate: (val: string) => {
        try {
          // Check if valid URL structure
          const parsed = new URL(val.trim());
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
             return "Invalid URL protocol. Must be http:// or https://.";
          }
          return "";
        } catch {
          return "Invalid URL format. Must include protocol (e.g. http:// or https://).";
        }
      },
    },
    hash: {
      label: "File Hash",
      placeholder: "Enter file signature (MD5, SHA-1, SHA-256)...",
      icon: <span className="material-symbols-outlined text-[18px]">tag</span>,
      validate: (val: string) => {
        const hashRegex = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
        return hashRegex.test(val.trim()) ? "" : "Invalid hash. Must be MD5, SHA-1 or SHA-256.";
      },
    },
    bulk: {
      label: "Bulk Scan",
      placeholder: "Enter up to 20 indicators separated by commas or newlines...",
      icon: <span className="material-symbols-outlined text-[18px]">library_add</span>,
      validate: (val: string) => {
        const count = val.split(/[\n,]+/).filter(i => i.trim().length > 0).length;
        if (count === 0) return "Please enter at least one indicator.";
        if (count > 20) return `Maximum 20 indicators allowed. You provided ${count}.`;
        return "";
      },
    },
    cve: {
      label: "CVE Lookup",
      placeholder: "Enter CVE ID (e.g., CVE-2021-44228)...",
      icon: <span className="material-symbols-outlined text-[18px]">bug_report</span>,
      validate: (val: string) => {
        const cveRegex = /^CVE-\d{4}-\d{4,}$/i;
        return cveRegex.test(val.trim()) ? "" : "Invalid format. Expected format: CVE-YYYY-NNNNN";
      },
    },
  };

  const handleTabChange = (tab: ScanType) => {
    setActiveTab(tab);
    setError("");
    setInputValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError("Please input a threat indicator.");
      return;
    }

    const validationError = tabConfig[activeTab].validate(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    onScan(inputValue.trim(), activeTab);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto glass-panel p-md rounded-xl transition-all duration-300 ${!isLoading ? 'scan-pulse-idle' : 'border-primary/50 shadow-[0_0_20px_rgba(20,184,166,0.3)]'}`}>
      {/* Tabs */}
      <div className="flex flex-wrap bg-surface-container-low rounded-lg p-1 border border-white/5 mb-4 max-w-3xl mx-auto gap-1 justify-center">
        {(Object.keys(tabConfig) as ScanType[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center gap-2 font-label-caps text-label-caps text-[12px] transition-all duration-150 min-w-[110px] ${
              activeTab === tab
                ? "bg-primary/20 text-primary border border-primary/20 shadow-lg"
                : "text-on-surface-variant hover:text-on-surface hover:bg-white/5 border border-transparent"
            }`}
          >
            {tabConfig[tab].icon}
            {tabConfig[tab].label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant/60 text-[20px]">
            {activeTab === "bulk" ? "format_list_bulleted" : "search"}
          </span>
          
          {activeTab === "bulk" ? (
            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              rows={4}
              className="w-full bg-surface-container-lowest border border-white/10 rounded-lg pl-12 pr-32 py-3.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all font-body-sm text-body-sm resize-y"
              placeholder={tabConfig[activeTab].placeholder}
            />
          ) : (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              className="w-full bg-surface-container-lowest border border-white/10 rounded-lg pl-12 pr-32 py-3.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all font-body-sm text-body-sm"
              placeholder={tabConfig[activeTab].placeholder}
            />
          )}

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(20, 184, 166, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`absolute right-2 top-2 bg-primary text-on-primary font-bold py-2 px-6 rounded-lg text-label-caps font-label-caps text-[12px] flex items-center gap-2 ${
              activeTab === "bulk" ? "" : "top-1/2 -translate-y-1/2"
            } ${isLoading ? "opacity-80" : ""}`}
          >
            {isLoading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full" />
            ) : (
              <span className="material-symbols-outlined text-[16px]">biotech</span>
            )}
            {isLoading ? "ANALYZING" : "SCAN NOW"}
          </motion.button>
        </div>
        {error && <p className="text-error text-xs mt-2 px-2 font-mono-sm">{error}</p>}
      </form>
    </div>
  );
};
export default ScanInput;
