"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

const TOOLS = [
  { id: 'email', name: 'Email Header Analyzer', icon: 'mail', desc: 'Extract and analyze email headers for spoofing' },
  { id: 'typo', name: 'Typosquatting Detector', icon: 'spellcheck', desc: 'Find active variations of a domain' },
  { id: 'decode', name: 'Base64/Hex Decoder', icon: 'code_blocks', desc: 'Decode malicious payloads' },
  { id: 'dns', name: 'Full DNS Enumerator', icon: 'dns', desc: 'Dump all DNS records for a domain' },
  { id: 'shodan', name: 'Shodan Host Lookup', icon: 'radar', desc: 'Authenticated Shodan host, ports, services, and CVE lookup' },
  { id: 'mac', name: 'MAC Vendor Lookup', icon: 'router', desc: 'Identify hardware vendor from MAC address' },
  { id: 'network', name: 'Network Range Scanner', icon: 'hub', desc: 'Analyze CIDR blocks and sample host reputation' },
  { id: 'http', name: 'HTTP Security Headers', icon: 'http', desc: 'Check HSTS, CSP, X-Frame-Options' },
  { id: 'dorks', name: 'Google Dorking', icon: 'manage_search', desc: 'Generate advanced search queries for OSINT research' },
  { id: 'spiderfoot', name: 'SpiderFoot Scan', icon: 'travel_explore', desc: 'Start a SpiderFoot OSINT scan from ThreatMap' },
  { id: 'awesome-ti', name: 'Awesome TI Hub', icon: 'hub', desc: 'Query working feeds from awesome-threat-intelligence' },
  { id: 'soc', name: 'SOC Workbench', icon: 'policy', desc: 'Extract IOCs, enrich alerts, and generate hunt content' }
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState(TOOLS[0].id);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Decoder specific
  const [decodeType, setDecodeType] = useState("auto");
  const [dorkMode, setDorkMode] = useState("domain");
  const [spiderFootType, setSpiderFootType] = useState("domain");
  const [spiderFootUseCase, setSpiderFootUseCase] = useState("passive");
  const [spiderFootScanId, setSpiderFootScanId] = useState("");
  const [spiderFootEventType, setSpiderFootEventType] = useState("ALL");
  const [awesomeTiType, setAwesomeTiType] = useState("auto");
  const [socType, setSocType] = useState("auto");
  const [socSeverity, setSocSeverity] = useState("");

  const activeToolDef = TOOLS.find(t => t.id === activeTool);

  const handleToolChange = (id: string) => {
    setActiveTool(id);
    setInput("");
    setResult(null);
    setError(null);
  };

  const handleRun = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      let res;
      switch (activeTool) {
        case 'email':
          res = await api.toolsEmailHeaders(input);
          break;
        case 'typo':
          res = await api.toolsTyposquatting(input);
          break;
        case 'decode':
          res = await api.toolsDecode(input, decodeType);
          break;
        case 'dns':
          res = await api.toolsDns(input);
          break;
        case 'shodan':
          res = await api.toolsShodan(input);
          break;
        case 'mac':
          res = await api.toolsMac(input);
          break;
        case 'network':
          res = await api.toolsNetworkRange(input);
          break;
        case 'http':
          res = await api.toolsHttpHeaders(input);
          break;
        case 'dorks':
          res = await api.toolsGoogleDorks(input, dorkMode);
          break;
        case 'spiderfoot':
          res = await api.toolsSpiderFoot(input, spiderFootType, spiderFootUseCase);
          break;
        case 'awesome-ti':
          res = await api.awesomeTiLookup(input, awesomeTiType);
          break;
        case 'soc':
          res = await api.socTriagePack(input, socType, socSeverity || undefined);
          break;
      }
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const runSpiderFootAction = async (action: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      let res;
      const scanId = spiderFootScanId.trim();

      switch (action) {
        case "health":
          res = await api.spiderFootHealth();
          break;
        case "modules":
          res = await api.spiderFootModules();
          break;
        case "types":
          res = await api.spiderFootEventTypes();
          break;
        case "rules":
          res = await api.spiderFootCorrelationRules();
          break;
        case "scans":
          res = await api.spiderFootScans();
          break;
        case "info":
          if (!scanId) throw new Error("Enter a SpiderFoot scan ID first.");
          res = await api.spiderFootScanInfo(scanId);
          break;
        case "logs":
          if (!scanId) throw new Error("Enter a SpiderFoot scan ID first.");
          res = await api.spiderFootScanLogs(scanId, 100);
          break;
        case "summary":
          if (!scanId) throw new Error("Enter a SpiderFoot scan ID first.");
          res = await api.spiderFootScanSummary(scanId);
          break;
        case "results":
          if (!scanId) throw new Error("Enter a SpiderFoot scan ID first.");
          res = await api.spiderFootScanResults(scanId, spiderFootEventType || "ALL");
          break;
        case "unique":
          if (!scanId) throw new Error("Enter a SpiderFoot scan ID first.");
          res = await api.spiderFootScanResults(scanId, spiderFootEventType || "ALL", true);
          break;
        case "correlations":
          if (!scanId) throw new Error("Enter a SpiderFoot scan ID first.");
          res = await api.spiderFootScanCorrelations(scanId);
          break;
        case "export":
          if (!scanId) throw new Error("Enter a SpiderFoot scan ID first.");
          res = await api.spiderFootScanExport(scanId, "json");
          break;
        case "search":
          if (!input.trim()) throw new Error("Enter a search value in the main input first.");
          res = await api.spiderFootSearch(input.trim(), scanId || undefined, spiderFootEventType || undefined);
          break;
        case "stop":
          if (!scanId) throw new Error("Enter a SpiderFoot scan ID first.");
          res = await api.spiderFootStopScan(scanId);
          break;
        case "delete":
          if (!scanId) throw new Error("Enter a SpiderFoot scan ID first.");
          res = await api.spiderFootDeleteScan(scanId);
          break;
        case "config":
          res = await api.spiderFootConfig();
          break;
      }

      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "SpiderFoot request failed");
    } finally {
      setIsLoading(false);
    }
  };

  const runAwesomeTiAction = async (action: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = action === "catalog" ? await api.awesomeTiCatalog() : await api.awesomeTiHealth();
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Awesome TI request failed");
    } finally {
      setIsLoading(false);
    }
  };

  const runSocAction = async (action: string) => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      let res;
      if (action === "extract") {
        res = await api.socExtract(input, socType);
      } else if (action === "detect") {
        res = await api.socDetectionPack(input, socType);
      } else {
        res = await api.socTriagePack(input, socType, socSeverity || undefined);
      }
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "SOC request failed");
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse">Running tool...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-error-container/20 border border-error/50 p-4 rounded-xl text-error text-sm">
          <strong>Error:</strong> {error}
        </div>
      );
    }

    if (!result) return null;

    if (activeTool === 'decode') {
      return (
        <div className="space-y-4">
          <div className="flex gap-4 mb-2 text-xs">
            <span className="bg-primary/20 text-primary px-2 py-1 rounded">Detected Type: {result.type}</span>
          </div>
          <div className="bg-[#111827] border border-white/5 p-4 rounded-xl">
            <pre className="whitespace-pre-wrap break-all text-sm text-emerald-400 font-mono">{result.decoded}</pre>
          </div>
        </div>
      );
    }

    // Default JSON renderer for tools where custom UI isn't strictly necessary yet
    // I will build out nicer views for them gradually if requested, but for now a formatted JSON or structured view is best.
    if (activeTool === 'typo') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Variations Checked</div>
              <div className="text-2xl font-bold text-white">{result.variations_checked}</div>
            </div>
            <div className="bg-error-container/10 p-4 rounded-xl border border-error/20">
              <div className="text-xs text-error uppercase tracking-wider mb-1">Active Typosquats</div>
              <div className="text-2xl font-bold text-error">{result.active_typosquats?.length || 0}</div>
            </div>
          </div>

          {result.active_typosquats?.length > 0 && (
            <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-error/10 border-b border-error/20 text-error font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                Active Resolving Domains
              </div>
              <ul className="divide-y divide-white/5">
                {result.active_typosquats.map((t: any, i: number) => (
                  <li key={i} className="p-4 flex justify-between items-center hover:bg-white/[0.02]">
                    <span className="text-white font-mono">{t.domain}</span>
                    <div className="flex gap-2">
                      {t.ips.map((ip: string) => (
                        <span key={ip} className="bg-white/5 text-xs text-on-surface-variant px-2 py-1 rounded border border-white/10">{ip}</span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (activeTool === 'http') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${
                        result.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 
                        result.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                        {result.score}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Security Score</h3>
                        <p className="text-sm text-on-surface-variant">Based on presence of standard security headers.</p>
                    </div>
                </div>

                {result.missing_headers?.length > 0 && (
                    <div className="bg-error-container/10 border border-error/20 p-4 rounded-xl">
                        <h4 className="text-error font-bold text-sm mb-2">Missing Headers (-20 pts each)</h4>
                        <div className="flex flex-wrap gap-2">
                            {result.missing_headers.map((h: string) => (
                                <span key={h} className="bg-error/20 text-error text-xs px-2 py-1 rounded font-mono">{h}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-white/5">
                            {Object.entries(result.security_headers).map(([k, v]) => (
                                <tr key={k}>
                                    <td className="p-3 font-mono text-on-surface-variant w-1/3">{k}</td>
                                    <td className={`p-3 font-mono ${v ? 'text-emerald-400' : 'text-on-surface-variant/30'}`}>
                                        {v ? (v as string) : 'Not Present'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    if (activeTool === 'dorks') {
      return (
        <div className="space-y-4">
          {result.note && (
            <div className="bg-primary/10 border border-primary/20 text-primary text-xs rounded-lg p-3">
              {result.note}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.dorks?.map((dork: any) => (
              <div key={dork.name} className="bg-surface-container-low border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-white">{dork.name}</h4>
                  <a href={dork.url} target="_blank" rel="noreferrer" className="text-xs bg-primary text-black font-bold px-3 py-1.5 rounded-lg">
                    Open
                  </a>
                </div>
                <code className="block text-xs text-primary bg-[#111827] border border-white/10 rounded-lg p-3 break-all">{dork.query}</code>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTool === 'shodan') {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Source</div>
              <div className="text-lg font-bold text-white">{result.source || "shodan"}</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Open Ports</div>
              <div className="text-lg font-bold text-primary">{result.ports?.length || 0}</div>
            </div>
            <div className="bg-error-container/10 p-4 rounded-xl border border-error/20">
              <div className="text-xs text-error uppercase tracking-wider mb-1">CVEs</div>
              <div className="text-lg font-bold text-error">{result.vulns?.length || 0}</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">ASN</div>
              <div className="text-sm font-bold text-white truncate">{result.asn || "Unknown"}</div>
            </div>
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-xl p-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-on-surface-variant">
              <div><span className="text-white/50">Org:</span> {result.org || result.isp || "Unknown"}</div>
              <div><span className="text-white/50">Location:</span> {[result.city, result.country].filter(Boolean).join(", ") || "Unknown"}</div>
              <div><span className="text-white/50">Hostnames:</span> {(result.hostnames || []).join(", ") || "None"}</div>
              <div><span className="text-white/50">Last Update:</span> {result.last_update || "Unknown"}</div>
            </div>
          </div>

          {result.vulns?.length > 0 && (
            <div className="bg-error-container/10 border border-error/20 p-4 rounded-xl">
              <h4 className="text-error font-bold text-sm mb-2">Vulnerabilities</h4>
              <div className="flex flex-wrap gap-2">
                {result.vulns.map((v: string) => (
                  <span key={v} className="bg-error/20 text-error text-xs px-2 py-1 rounded font-mono">{v}</span>
                ))}
              </div>
            </div>
          )}

          {result.services?.length > 0 && (
            <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-white/5 border-b border-white/10 text-white font-bold text-sm">Services</div>
              <div className="divide-y divide-white/5">
                {result.services.map((svc: any, index: number) => (
                  <div key={`${svc.port}-${index}`} className="p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-primary font-mono font-bold">{svc.port}/{svc.transport || "tcp"}</span>
                      {svc.product && <span className="text-white text-sm">{svc.product}</span>}
                      {svc.version && <span className="text-on-surface-variant text-xs">{svc.version}</span>}
                    </div>
                    {svc.banner && <pre className="text-[11px] text-on-surface-variant whitespace-pre-wrap break-all font-mono">{svc.banner}</pre>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.shodan_error && (
            <div className="text-xs text-on-surface-variant bg-white/5 border border-white/10 rounded-lg p-3">
              Shodan fallback note: {result.shodan_error}
            </div>
          )}
        </div>
      );
    }

    if (activeTool === 'spiderfoot') {
      const started = result.status === "started";
      const healthy = result.status === "success" || result.status === "online";
      const failed = result.status === "unavailable" || result.status === "error";
      const apiData = result.data ?? result.api_response;
      const statusTitle = started
        ? "SpiderFoot scan started"
        : healthy
          ? "SpiderFoot response received"
          : failed
            ? "SpiderFoot request needs attention"
            : "SpiderFoot response";

      return (
        <div className="space-y-5">
          <div className={`border p-4 rounded-xl ${started || healthy ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
            <div className="flex items-start gap-3">
              <span className={`material-symbols-outlined text-[22px] ${started || healthy ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {started || healthy ? "task_alt" : "info"}
              </span>
              <div>
                <h4 className={`font-bold text-sm ${started || healthy ? 'text-emerald-300' : 'text-yellow-300'}`}>
                  {statusTitle}
                </h4>
                <p className="text-sm text-on-surface-variant mt-1">
                  {result.note || result.detail || `Endpoint: ${result.endpoint || "SpiderFoot"}`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Target</div>
              <div className="text-sm font-mono text-white break-all">{result.target || "Not applicable"}</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Type</div>
              <div className="text-sm font-bold text-primary capitalize">{result.target_type || result.endpoint || "SpiderFoot"}</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Scan ID</div>
              <div className="text-sm font-mono text-white break-all">{result.scan_id || "Not returned"}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {result.web_url && (
              <a href={result.web_url} target="_blank" rel="noreferrer" className="bg-primary text-black font-bold px-4 py-2 rounded-lg text-sm">
                Open SpiderFoot
              </a>
            )}
            {result.scan_url && (
              <a href={result.scan_url} target="_blank" rel="noreferrer" className="bg-white/10 text-white border border-white/10 font-bold px-4 py-2 rounded-lg text-sm">
                View Scan
              </a>
            )}
            {result.new_scan_url && (
              <a href={result.new_scan_url} target="_blank" rel="noreferrer" className="bg-white/10 text-white border border-white/10 font-bold px-4 py-2 rounded-lg text-sm">
                New Scan
              </a>
            )}
          </div>

          {result.setup?.length > 0 && (
            <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">Setup</h4>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                {result.setup.map((item: string) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {result.last_error && (
                <code className="block text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-4 break-all">
                  {result.last_error}
                </code>
              )}
            </div>
          )}

          {apiData && (
            <div className="bg-[#111827] border border-white/5 p-4 rounded-xl overflow-auto max-h-[520px] custom-scrollbar">
              <pre className="text-xs text-emerald-400 font-mono">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      );
    }

    if (activeTool === 'awesome-ti') {
      const results = result.results || result.sources || result.checks || [];

      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Status</div>
              <div className="text-lg font-bold text-primary capitalize">{result.status}</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Checked</div>
              <div className="text-lg font-bold text-white">{result.checked_count ?? results.length}</div>
            </div>
            <div className="bg-error-container/10 p-4 rounded-xl border border-error/20">
              <div className="text-xs text-error uppercase tracking-wider mb-1">Matches</div>
              <div className="text-lg font-bold text-error">{result.matched_count ?? results.filter((r: any) => r.matched).length}</div>
            </div>
          </div>

          {result.note && (
            <div className="bg-primary/10 border border-primary/20 text-primary text-xs rounded-lg p-3">
              {result.note}
            </div>
          )}

          <div className="space-y-3">
            {results.map((item: any) => (
              <div key={item.id || item.name} className="bg-surface-container-low border border-white/5 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">{item.description || item.detail || item.category}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.matched && <span className="text-xs bg-error/20 text-error px-2 py-1 rounded">match</span>}
                    <span className="text-xs bg-white/5 text-on-surface-variant px-2 py-1 rounded">{item.status || (item.enabled ? "enabled" : "needs key")}</span>
                    {item.api_key_required && <span className="text-xs bg-yellow-500/10 text-yellow-300 px-2 py-1 rounded">Auth-Key</span>}
                  </div>
                </div>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-primary break-all mt-3 block">
                    {item.url}
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="bg-[#111827] border border-white/5 p-4 rounded-xl overflow-auto max-h-[420px] custom-scrollbar">
            <pre className="text-xs text-emerald-400 font-mono">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      );
    }

    if (activeTool === 'soc') {
      const observables = result.observables || {};
      const detection = result.detection_pack || result.content;
      const feedResults = result.open_source_enrichment?.feed_results || [];
      const vulnResults = result.open_source_enrichment?.vulnerabilities || [];
      const severity = result.severity || "INFO";
      const sevClass = severity === "CRITICAL" || severity === "HIGH"
        ? "bg-error-container/10 border-error/20 text-error"
        : severity === "MEDIUM"
          ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";

      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-4 rounded-xl border ${sevClass}`}>
              <div className="text-xs uppercase tracking-wider mb-1">SOC Severity</div>
              <div className="text-2xl font-black">{severity}</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Primary IOC</div>
              <div className="text-sm font-mono text-white break-all">{result.primary_indicator || result.indicator || "None"}</div>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
              <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Feed Matches</div>
              <div className="text-lg font-bold text-primary">{feedResults.filter((item: any) => item.matched).length}</div>
            </div>
          </div>

          {Object.keys(observables).length > 0 && (
            <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">Extracted Observables</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(observables).map(([key, values]: [string, any]) => (
                  <div key={key} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">{key.replaceAll("_", " ")}</div>
                    <div className="flex flex-wrap gap-2">
                      {(values || []).length > 0 ? values.map((value: string) => (
                        <span key={value} className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded break-all">
                          {value}
                        </span>
                      )) : <span className="text-xs text-on-surface-variant">None</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.playbook?.length > 0 && (
            <div className="bg-surface-container-low border border-white/5 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">SOC Playbook</h4>
              <ol className="space-y-2">
                {result.playbook.map((step: string, idx: number) => (
                  <li key={step} className="flex gap-3 text-sm text-on-surface-variant">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {detection?.hunt_queries && (
            <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">Hunt Queries</h4>
              <div className="space-y-3">
                {Object.entries(detection.hunt_queries).map(([name, query]: [string, any]) => (
                  <div key={name}>
                    <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">{name.replaceAll("_", " ")}</div>
                    <code className="block text-xs text-emerald-400 bg-black/30 border border-white/10 rounded-lg p-3 break-all">{query}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detection && (
            <div className="grid grid-cols-1 gap-4">
              {["sigma", "suricata", "yara"].map((key) => detection[key] && (
                <div key={key} className="bg-[#111827] border border-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-white mb-3 uppercase">{key}</h4>
                  <pre className="text-xs text-primary whitespace-pre-wrap break-all font-mono">{detection[key]}</pre>
                </div>
              ))}
            </div>
          )}

          {(feedResults.length > 0 || vulnResults.length > 0) && (
            <div className="bg-surface-container-low border border-white/5 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">Open-Source Enrichment</h4>
              <pre className="text-xs text-emerald-400 whitespace-pre-wrap break-all font-mono">{JSON.stringify(result.open_source_enrichment, null, 2)}</pre>
            </div>
          )}
        </div>
      );
    }

    // Generic fallback for others (Email, DNS, Mac, Network Range)
    return (
      <div className="bg-[#111827] border border-white/5 p-4 rounded-xl overflow-auto max-h-[600px] custom-scrollbar">
        <pre className="text-xs text-emerald-400 font-mono">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  const getPlaceholder = () => {
      switch (activeTool) {
          case 'email': return "Paste raw email headers here...";
          case 'typo': return "example.com";
          case 'decode': return "Paste base64 or hex string...";
          case 'dns': return "example.com";
          case 'shodan': return "8.8.8.8";
          case 'mac': return "00:1A:2B:3C:4D:5E";
          case 'network': return "192.168.1.0/24";
          case 'http': return "https://example.com";
          case 'dorks': return dorkMode === "domain" ? "example.com" : dorkMode === "email" ? "analyst@example.com" : "Acme Corp";
          case 'spiderfoot': return spiderFootType === "ip" ? "8.8.8.8" : spiderFootType === "email" ? "analyst@example.com" : "example.com";
          case 'awesome-ti': return awesomeTiType === "hash" ? "44d88612fea8a8f36de82e1278abb02f" : awesomeTiType === "ip" ? "8.8.8.8" : "example.com";
          default: return "Enter input...";
      }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12 px-4 md:px-8 mt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-headline-lg tracking-wider">
            STANDALONE <span className="text-primary font-light">TOOLS</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Quick-access utilities for threat intelligence and forensic analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border flex items-center gap-3 transition-all ${
                activeTool === tool.id
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-surface-container border-white/5 text-on-surface-variant hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tool.icon}</span>
              <div className="flex flex-col">
                <span className="font-bold text-sm">{tool.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-surface glass-panel border border-white/5 rounded-2xl p-6 min-h-[500px] flex flex-col"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-[28px]">{activeToolDef?.icon}</span>
                <h2 className="text-2xl font-bold text-white">{activeToolDef?.name}</h2>
              </div>
              <p className="text-on-surface-variant text-sm mb-6 pb-6 border-b border-white/5">
                {activeToolDef?.desc}
              </p>

              <div className="space-y-6 flex-1">
                {activeTool === 'email' || activeTool === 'decode' ? (
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={getPlaceholder()}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl p-4 text-sm text-white font-mono focus:ring-1 focus:ring-primary focus:border-primary resize-y min-h-[150px]"
                  />
                ) : (
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={getPlaceholder()}
                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                  />
                )}

                {activeTool === 'decode' && (
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                      <input type="radio" name="dtype" value="auto" checked={decodeType==='auto'} onChange={e => setDecodeType(e.target.value)} className="text-primary focus:ring-primary bg-black border-white/20"/>
                      Auto-Detect
                    </label>
                    <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                      <input type="radio" name="dtype" value="base64" checked={decodeType==='base64'} onChange={e => setDecodeType(e.target.value)} className="text-primary focus:ring-primary bg-black border-white/20"/>
                      Base64
                    </label>
                    <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                      <input type="radio" name="dtype" value="hex" checked={decodeType==='hex'} onChange={e => setDecodeType(e.target.value)} className="text-primary focus:ring-primary bg-black border-white/20"/>
                      Hex
                    </label>
                  </div>
                )}

                {activeTool === 'dorks' && (
                  <div className="flex flex-wrap gap-4">
                    {["domain", "company", "email", "keyword"].map((mode) => (
                      <label key={mode} className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer capitalize">
                        <input type="radio" name="dork-mode" value={mode} checked={dorkMode === mode} onChange={e => setDorkMode(e.target.value)} className="text-primary focus:ring-primary bg-black border-white/20"/>
                        {mode}
                      </label>
                    ))}
                  </div>
                )}

                {activeTool === 'spiderfoot' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      {["domain", "hostname", "ip", "netblock", "email", "username", "phone"].map((type) => (
                        <label key={type} className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer capitalize">
                          <input type="radio" name="spiderfoot-type" value={type} checked={spiderFootType === type} onChange={e => setSpiderFootType(e.target.value)} className="text-primary focus:ring-primary bg-black border-white/20"/>
                          {type}
                        </label>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {["passive", "footprint", "investigate", "all"].map((mode) => (
                        <label key={mode} className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer capitalize">
                          <input type="radio" name="spiderfoot-usecase" value={mode} checked={spiderFootUseCase === mode} onChange={e => setSpiderFootUseCase(e.target.value)} className="text-primary focus:ring-primary bg-black border-white/20"/>
                          {mode === "passive" ? "Passive OSINT" : mode}
                        </label>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={spiderFootScanId}
                        onChange={(e) => setSpiderFootScanId(e.target.value)}
                        placeholder="SpiderFoot scan ID for scan actions"
                        className="bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <input
                        type="text"
                        value={spiderFootEventType}
                        onChange={(e) => setSpiderFootEventType(e.target.value)}
                        placeholder="Event type, e.g. ALL or IP_ADDRESS"
                        className="bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        ["health", "Health"],
                        ["scans", "Scans"],
                        ["modules", "Modules"],
                        ["types", "Types"],
                        ["rules", "Rules"],
                        ["info", "Info"],
                        ["logs", "Logs"],
                        ["summary", "Summary"],
                        ["results", "Results"],
                        ["unique", "Unique"],
                        ["correlations", "Correlations"],
                        ["export", "Export"],
                        ["search", "Search"],
                        ["config", "Config"],
                        ["stop", "Stop"],
                        ["delete", "Delete"],
                      ].map(([action, label]) => (
                        <button
                          key={action}
                          type="button"
                          onClick={() => runSpiderFootAction(action)}
                          disabled={isLoading}
                          className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 ${
                            action === "delete" || action === "stop"
                              ? "bg-error/10 border-error/20 text-error hover:bg-error/20"
                              : "bg-white/5 border-white/10 text-on-surface-variant hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTool === 'awesome-ti' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      {["auto", "ip", "domain", "url", "hash"].map((type) => (
                        <label key={type} className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer capitalize">
                          <input type="radio" name="awesome-ti-type" value={type} checked={awesomeTiType === type} onChange={e => setAwesomeTiType(e.target.value)} className="text-primary focus:ring-primary bg-black border-white/20"/>
                          {type}
                        </label>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => runAwesomeTiAction("catalog")}
                        disabled={isLoading}
                        className="text-xs font-bold px-3 py-2 rounded-lg border bg-white/5 border-white/10 text-on-surface-variant hover:text-white hover:bg-white/10 disabled:opacity-50"
                      >
                        Catalog
                      </button>
                      <button
                        type="button"
                        onClick={() => runAwesomeTiAction("health")}
                        disabled={isLoading}
                        className="text-xs font-bold px-3 py-2 rounded-lg border bg-white/5 border-white/10 text-on-surface-variant hover:text-white hover:bg-white/10 disabled:opacity-50"
                      >
                        Health
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRun}
                  disabled={isLoading || !input.trim()}
                  className="bg-primary text-black font-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                      Run Tool
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-white/5">
                  {renderResult()}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
