"use client";

import React from "react";
import Link from "next/link";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      className="ml-2 bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/10 text-xs font-mono transition-all text-on-surface-variant flex items-center gap-1"
      title="Copy to clipboard"
    >
      <span className="material-symbols-outlined text-[14px]">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

export default function AboutPage() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    { name: "IP Address Scanner", what: "Analyzes any IPv4/IPv6 address against multiple security feeds and returns a unified risk score.", how: "Go to IOC Scanner → select 'IP Address' tab → enter IP → click Scan Now", example: "185.220.101.34", expected: "HIGH risk, Tor exit node, Frankfurt Germany location, multiple malicious detections." },
    { name: "Domain Scanner", what: "Investigates domain names for malicious reputation, phishing reports, and passive DNS records.", how: "Go to IOC Scanner → select 'Domain' tab → enter domain → click Scan Now", example: "malware.wicar.org", expected: "CRITICAL risk, categorized as malicious/malware serving." },
    { name: "URL Scanner", what: "Checks specific web URLs for phishing, malware delivery, and embedded threats.", how: "Go to IOC Scanner → select 'URL' tab → enter URL → click Scan Now", example: "http://malware.wicar.org/data/eicar.com", expected: "CRITICAL risk, high detection rate across AV engines." },
    { name: "File Hash Scanner", what: "Looks up MD5, SHA-1, or SHA-256 hashes to determine if a file is known malware.", how: "Go to IOC Scanner → select 'Hash' tab → enter Hash → click Scan Now", example: "44d88612fea8a8f36de82e1278abb02f", expected: "HIGH risk, identified as EICAR test file." },
    { name: "Watchlist Management", what: "Allows saving specific IOCs to a watchlist for ongoing tracking and quick reference.", how: "Go to Watchlist & Alerts → Add New IOC or click 'Watch' on any scan result.", example: "Save an APT C2 IP", expected: "Appears in Watchlist dashboard with current status." },
    { name: "Export Functionality", what: "Generates downloadable reports of threat analysis in PDF, CSV, or JSON formats.", how: "On any scan result page → click the Export dropdown → select format.", example: "Export scan as JSON", expected: "Downloads a detailed machine-readable JSON file." },
    { name: "Community Notes", what: "Enables analysts to leave collaborative notes on specific IOCs to share context.", how: "On any scan result page → select 'Community Notes' tab → Add note.", example: "Add 'Observed in recent phishing campaign'", expected: "Note is saved and visible to all users querying that IOC." },
    { name: "Bulk Scanner", what: "Concurrently scans a large list of IOCs (IPs, domains, hashes) for rapid triaging.", how: "Go to Bulk Analytics → paste list of IOCs → Start Bulk Scan.", example: "Paste 10 IPs from a firewall log", expected: "Table displaying risk scores for all 10 IPs simultaneously." },
    { name: "Compare Scans", what: "Side-by-side comparison of two different IOCs or two historical scans of the same IOC.", how: "Go to Compare IOCs → select two historical scans → View Comparison.", example: "Compare two suspicious domains", expected: "Highlights shared infrastructure or differing threat levels." },
    { name: "Threat Actors Directory", what: "Tracks known Advanced Persistent Threat (APT) groups, their aliases, and common TTPs.", how: "Go to Threat Actors → Search or browse the directory.", example: "Search 'Lazarus'", expected: "Details on Lazarus Group, associated countries, and known IOCs." },
    { name: "Campaigns Tracking", what: "Correlates isolated indicators into broader, named cyberattack campaigns.", how: "Go to Campaigns → view active campaigns and linked indicators.", example: "View 'Log4Shell Exploitation'", expected: "Timeline and list of IPs exploiting the vulnerability." },
    { name: "Dashboard & Telemetry", what: "Provides high-level platform statistics, recent scan history, and active alerts.", how: "Click 'Dashboard' in the sidebar.", example: "View dashboard", expected: "Graphs showing scan volume, average risk, and recent activity." },
    { name: "Global Threat Map", what: "Plots the geolocation of scanned IP addresses on an interactive world map.", how: "Visible on the Dashboard and IP scan result pages.", example: "Scan an IP in Russia", expected: "Map centers on Russia with a high-risk pin." },
    { name: "Relationship Network Graph", what: "Visualizes connected infrastructure (IP to ASN to Domain) using an interactive Cytoscape graph.", how: "On any scan result page → select 'Relationship Graph' tab.", example: "Scan an IP", expected: "Interactive node graph showing IP, hosting provider, and related domains." },
    { name: "Threat Radar", what: "Renders a radar chart showing the multi-dimensional threat profile (Malware, Phishing, Spam, etc).", how: "Visible on scan result pages.", example: "Scan a phishing domain", expected: "Radar chart heavily skewed towards 'Phishing' and 'Social Engineering'." },
    { name: "Risk Gauge", what: "Displays a real-time, unified risk score (0-100) combining all API intelligence.", how: "Visible on all scan result pages.", example: "Scan 8.8.8.8", expected: "Gauge shows a very low score (e.g., 0-5) in the green zone." },
    { name: "Reverse DNS Lookup", what: "Resolves an IP address back to its associated hostname.", how: "Automatically queried during Advanced OSINT scans.", example: "Advanced OSINT on 8.8.8.8", expected: "Returns 'dns.google'." },
    { name: "WHOIS Lookup", empty: false, what: "Retrieves domain registration records, creation dates, and registrar info.", how: "Automatically queried during Domain scans.", example: "Scan github.com", expected: "Shows registered via MarkMonitor, created in 2007." },
    { name: "SSL Certificate Scanner", what: "Analyzes certificate transparency, issuer, and expiration dates for domains.", how: "Automatically queried during Domain/URL scans.", example: "Scan a domain", expected: "Shows Let's Encrypt or DigiCert details and validity period." },
    { name: "Open Ports Scanner", what: "Checks for commonly exposed and vulnerable ports on target IP addresses.", how: "Triggered via Advanced OSINT panel.", example: "Advanced OSINT on server IP", expected: "Lists open ports like 22, 80, 443." },
    { name: "Subdomain Enumeration", what: "Finds associated subdomains for a given apex domain to map attack surface.", how: "Triggered via Advanced OSINT on a domain.", example: "Advanced OSINT on example.com", expected: "Lists subdomains like dev.example.com, mail.example.com." },
    { name: "ASN Info Lookup", what: "Retrieves Autonomous System Number details, routing info, and ownership.", how: "Automatically queried during IP scans.", example: "Scan 8.8.8.8", expected: "Identifies ASN AS15169 (Google LLC)." },
    { name: "Email Breach Lookup", what: "Checks if an email address was involved in known public data breaches.", how: "Enter email in the Advanced OSINT panel.", example: "Check test@example.com", expected: "Lists breaches where the email was found." },
    { name: "CVE Info Lookup", what: "Fetches detailed intelligence on known Common Vulnerabilities and Exposures.", how: "Search a CVE ID in the global search or click a CVE tag.", example: "Search CVE-2021-44228", expected: "Shows Log4Shell details, CVSS score, and affected software." },
    { name: "Web Vulnerability Scanner", what: "Performs basic non-intrusive heuristic checks for common web vulnerabilities.", how: "Click 'Analyze Vulnerabilities' on a URL scan.", example: "Scan a test vulnerable site", expected: "Highlights missing security headers or exposed directories." },
    { name: "Technology Stack Analyzer", what: "Identifies web frameworks, CMS, and libraries used by a target domain.", how: "Automatically queried during URL scans.", example: "Scan a WordPress site", expected: "Detects WordPress, PHP, and specific plugins." },
    { name: "SpiderFoot Deep OSINT", what: "Runs a comprehensive deep scan utilizing SpiderFoot's 200+ OSINT modules to uncover emails, subdomains, dark web mentions, and more.", how: "Go to Deep OSINT from sidebar or click 'Start Deep Scan' on a result page.", example: "Scan github.com", expected: "Shows a long-running scan that surfaces emails, related IPs, and SSL certs." },
  ];

  const dataSources = [
    { name: "VirusTotal", desc: "Aggregates malicious reputation across 90+ security engines.", limit: "4 requests / minute", link: "https://virustotal.com" },
    { name: "AbuseIPDB", desc: "Community-driven IP abuse reports and threat scoring.", limit: "1000 requests / day", link: "https://abuseipdb.com" },
    { name: "IPinfo", desc: "Reliable IP geolocation and ASN context data.", limit: "50000 requests / month", link: "https://ipinfo.io" },
    { name: "AlienVault OTX", desc: "Global open threat exchange feeds and pulses.", limit: "Generous free tier", link: "https://otx.alienvault.com" },
    { name: "URLScan.io", desc: "Sandbox analysis for URLs and website infrastructure.", limit: "5000 requests / day", link: "https://urlscan.io" },
    { name: "GreyNoise", desc: "Classifies internet background noise vs targeted threats.", limit: "Community tier limits", link: "https://greynoise.io" },
    { name: "Google Gemini", desc: "AI-powered threat summarization and contextualization.", limit: "15 requests / minute", link: "https://ai.google.dev" },
    { name: "MITRE ATT&CK", desc: "Adversary tactic mapping and knowledge base.", limit: "Open Source Data", link: "https://attack.mitre.org" },
    { name: "crt.sh", desc: "SSL certificate transparency log search.", limit: "No hard limits (rate limited)", link: "https://crt.sh" },
    { name: "HackerTarget", desc: "Passive DNS history and network intelligence.", limit: "100 requests / day", link: "https://hackertarget.com" },
    { name: "SpiderFoot", desc: "Open-source intelligence automation tool with 200+ modules.", limit: "Local instance", link: "https://github.com/smicallef/spiderfoot" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Sticky Internal Nav */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 py-3 -mx-lg px-lg mb-8 flex gap-4 overflow-x-auto hide-scrollbar text-xs font-mono font-semibold tracking-wider uppercase text-on-surface-variant">
        <button onClick={() => scrollTo('hero')} className="hover:text-primary whitespace-nowrap">Hero</button>
        <button onClick={() => scrollTo('what-is')} className="hover:text-primary whitespace-nowrap">What is it</button>
        <button onClick={() => scrollTo('features')} className="hover:text-primary whitespace-nowrap">Features ({features.length})</button>
        <button onClick={() => scrollTo('sources')} className="hover:text-primary whitespace-nowrap">Data Sources</button>
        <button onClick={() => scrollTo('tech-stack')} className="hover:text-primary whitespace-nowrap">Tech Stack</button>
        <button onClick={() => scrollTo('quick-start')} className="hover:text-primary whitespace-nowrap">Quick Start</button>
        <button onClick={() => scrollTo('limitations')} className="hover:text-primary whitespace-nowrap">Limitations</button>
      </div>

      {/* SECTION 1 — HERO */}
      <section id="hero" className="text-center space-y-6 pt-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="material-symbols-outlined text-primary text-[64px] animate-pulse">shield_lock</span>
        </div>
        <h1 className="text-5xl font-black tracking-widest text-white font-headline-lg">
          THREAT<span className="text-primary font-light">MAP</span>
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto">
          Open-source AI-powered threat intelligence platform for cybersecurity professionals and researchers.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-mono font-bold border border-primary/30">v1.0.0</span>
          <span className="text-sm text-on-surface-variant font-mono">Built with: Next.js + FastAPI + PostgreSQL</span>
        </div>
      </section>

      <hr className="border-white/5" />

      {/* SECTION 2 — WHAT IS THREATMAP */}
      <section id="what-is" className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="material-symbols-outlined text-primary text-[28px]">travel_explore</span>
          <h2 className="text-2xl font-bold text-white font-headline-md tracking-wide">What is ThreatMap?</h2>
        </div>
        <div className="space-y-4 text-on-surface leading-relaxed">
          <p>
            ThreatMap is a centralized OSINT (Open Source Intelligence) aggregation platform designed to streamline incident response and threat hunting. Instead of manually querying dozens of separate security websites, ThreatMap queries them all simultaneously, correlates the data, and utilizes a deterministic Risk Engine paired with AI summarization to deliver a single, unified threat report.
          </p>
          <p>
            This platform is built for <strong>Security Researchers, SOC Analysts, Students, and Developers</strong> who need rapid, accurate intelligence on suspicious IP addresses, domains, URLs, and file hashes. It provides enterprise-grade visualization tools like interactive network graphs, global threat maps, and radar charts.
          </p>
          <p>
            Behind the scenes, ThreatMap leverages asynchronous Python architecture (FastAPI) to parallelize external API calls, ensuring high-speed data retrieval. The Next.js frontend presents this dense data in an intuitive, dark-themed dashboard modeled after professional security operations centers.
          </p>
        </div>
      </section>

      {/* SECTION 3 — ALL FEATURES */}
      <section id="features" className="space-y-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="material-symbols-outlined text-primary text-[28px]">list_alt</span>
          <h2 className="text-2xl font-bold text-white font-headline-md tracking-wide">Complete Feature List</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-surface border border-white/5 rounded-xl p-6 hover:bg-white/[0.02] transition-colors flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary text-background font-black font-mono w-8 h-8 rounded flex items-center justify-center shrink-0">
                  #{index + 1}
                </span>
                <h3 className="text-lg font-bold text-white">{feature.name}</h3>
              </div>
              <div className="space-y-3 text-sm text-on-surface-variant flex-1">
                <p><strong className="text-on-surface">What:</strong> {feature.what}</p>
                <p><strong className="text-on-surface">How to use:</strong> {feature.how}</p>
                <div className="bg-background/50 border border-white/10 p-3 rounded text-[13px]">
                  <div className="flex items-center mb-1">
                    <strong className="text-on-surface w-24">Example:</strong> 
                    <code className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded">{feature.example}</code>
                    <CopyButton text={feature.example} />
                  </div>
                  <div className="flex items-start">
                    <strong className="text-on-surface w-24 shrink-0">Expected:</strong> 
                    <span>{feature.expected}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — DATA SOURCES & CREDITS */}
      <section id="sources" className="space-y-8">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="material-symbols-outlined text-primary text-[28px]">database</span>
          <h2 className="text-2xl font-bold text-white font-headline-md tracking-wide">Data Sources & APIs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataSources.map((source, idx) => (
            <a key={idx} href={source.link} target="_blank" rel="noreferrer" className="block bg-surface border border-white/5 rounded-xl p-5 hover:border-primary/50 transition-all group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-background border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined">api</span>
                </div>
                <h3 className="font-bold text-white text-lg">{source.name}</h3>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">{source.desc}</p>
              <div className="text-xs font-mono text-primary/80 bg-primary/10 px-2 py-1 rounded inline-block">
                {source.limit}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SECTION 5 — TECH STACK */}
      <section id="tech-stack" className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="material-symbols-outlined text-primary text-[28px]">terminal</span>
          <h2 className="text-2xl font-bold text-white font-headline-md tracking-wide">Technology Stack</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-400">desktop_windows</span> Frontend
            </h3>
            <ul className="space-y-2 text-on-surface-variant list-disc list-inside">
              <li>Next.js 14 (App Router)</li>
              <li>React 18 & TypeScript</li>
              <li>Tailwind CSS (Custom Dark Theme)</li>
              <li>Leaflet.js (GeoMap)</li>
              <li>Cytoscape.js (Network Graph)</li>
              <li>Recharts (Threat Radar)</li>
              <li>Framer Motion (Animations)</li>
            </ul>
          </div>
          <div className="bg-surface border border-white/5 rounded-xl p-6">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">dns</span> Backend & Data
            </h3>
            <ul className="space-y-2 text-on-surface-variant list-disc list-inside">
              <li>FastAPI (Asynchronous Python 3.11)</li>
              <li>SQLAlchemy & PostgreSQL</li>
              <li>Redis (Caching Layer)</li>
              <li>httpx (Async API Client)</li>
              <li>asyncio (Parallel Execution)</li>
              <li>Google Gemini 1.5 Flash (AI Engine)</li>
              <li>Vercel + Railway + Supabase (Deployment)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 6 — QUICK START EXAMPLES */}
      <section id="quick-start" className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="material-symbols-outlined text-primary text-[28px]">bolt</span>
          <h2 className="text-2xl font-bold text-white font-headline-md tracking-wide">Quick Start Examples</h2>
        </div>
        <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 font-bold text-white w-1/4">Type</th>
                <th className="p-4 font-bold text-white w-1/2">Input Indicator</th>
                <th className="p-4 font-bold text-white w-1/4">Expected Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-on-surface-variant">
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4">Known safe IP (Google DNS)</td>
                <td className="p-4 font-mono text-primary flex items-center gap-2">
                  8.8.8.8 <CopyButton text="8.8.8.8" />
                </td>
                <td className="p-4 text-emerald-400 font-bold">SAFE (0-5)</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4">Known malicious IP (Tor Exit)</td>
                <td className="p-4 font-mono text-primary flex items-center gap-2">
                  185.220.101.34 <CopyButton text="185.220.101.34" />
                </td>
                <td className="p-4 text-red-400 font-bold">HIGH (80-100)</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4">Safe domain</td>
                <td className="p-4 font-mono text-primary flex items-center gap-2">
                  github.com <CopyButton text="github.com" />
                </td>
                <td className="p-4 text-emerald-400 font-bold">SAFE</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4">Suspicious URL</td>
                <td className="p-4 font-mono text-primary flex items-center gap-2">
                  <span className="truncate w-48 block">http://malware.wicar.org/data/eicar.com</span>
                  <CopyButton text="http://malware.wicar.org/data/eicar.com" />
                </td>
                <td className="p-4 text-red-400 font-bold">CRITICAL</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4">Known malware hash (EICAR)</td>
                <td className="p-4 font-mono text-primary flex items-center gap-2">
                  <span className="truncate w-48 block">44d88612fea8a8f36de82e1278abb02f</span>
                  <CopyButton text="44d88612fea8a8f36de82e1278abb02f" />
                </td>
                <td className="p-4 text-red-400 font-bold">CRITICAL</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 7 — LIMITATIONS & DISCLAIMER */}
      <section id="limitations" className="space-y-6 bg-error-container/10 border border-error/20 p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-error" />
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-error text-[28px]">warning</span>
          <h2 className="text-2xl font-bold text-white font-headline-md tracking-wide">Limitations & Disclaimer</h2>
        </div>
        <ul className="space-y-3 text-on-surface-variant list-disc list-inside">
          <li><strong>Rate Limits:</strong> This instance may rely on free-tier API keys. Heavy usage will trigger 429 errors and result in fallback data being displayed.</li>
          <li><strong>Research Only:</strong> Results generated by ThreatMap are for educational and research purposes only.</li>
          <li><strong>Not a Replacement:</strong> This tool is not a replacement for professional, paid security enterprise tools or dedicated SOC analysts.</li>
          <li><strong>False Positives/Negatives:</strong> No threat intelligence feed is 100% accurate. False flags can and will occur. Always manually verify critical findings.</li>
          <li><strong>Data Freshness:</strong> Indicator scores are dependent entirely on the freshness of the upstream API providers (e.g., VirusTotal, AbuseIPDB).</li>
        </ul>
      </section>

    </div>
  );
}
