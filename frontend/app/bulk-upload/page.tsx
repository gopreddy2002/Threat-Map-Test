"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { 
  Upload, 
  Download, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  FileText,
  RefreshCw,
  X
} from "lucide-react";

interface UploadStats {
  total: number;
  imported: number;
  duplicates: number;
  invalid: number;
  errors: string[];
}

interface BulkIndicator {
  id: string;
  indicator: string;
  type: string;
  risk_score: number;
  risk_level: string;
  summary: string;
  threat_type: string;
  severity: string;
  source: string;
  country: string;
  created_at: string;
}

export default function BulkUploadPage() {
  // Upload States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  
  // Notification States
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Indicators Table States
  const [indicators, setIndicators] = useState<BulkIndicator[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch bulk uploaded indicators
  const fetchIndicators = async () => {
    setIsLoading(true);
    try {
      const res = await api.getBulkIndicators({
        page,
        size: pageSize,
        search: search.trim() || undefined,
        sort_by: sortBy,
        order,
      });
      setIndicators(res.items);
      setTotalItems(res.total);
      setTotalPages(res.pages);
    } catch (err: any) {
      console.error(err);
      showNotification("error", "Failed to load uploaded indicators.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [page, pageSize, sortBy, order]);

  // Handle Search submit/trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchIndicators();
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    setTimeout(() => {
      fetchIndicators();
    }, 0);
  };

  // Helper for setting temporary notifications
  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 8000); // 8 seconds
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const validateAndSelectFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv", "xls", "xlsx"].includes(ext)) {
      showNotification("error", "Unsupported file type. Please upload a .csv, .xls, or .xlsx file.");
      setSelectedFile(null);
      return;
    }
    
    if (file.size === 0) {
      showNotification("error", "The selected file is empty.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadStats(null); // Clear previous results
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    
    setUploadProgress(0);
    setUploadStats(null);
    
    try {
      const stats = await api.uploadBulkFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploadStats(stats);
      setUploadProgress(null);
      setSelectedFile(null);
      
      if (stats.imported > 0) {
        showNotification("success", `Successfully imported ${stats.imported} indicators!`);
        setPage(1);
        fetchIndicators();
      } else if (stats.total === 0) {
        showNotification("error", "No records found in the uploaded file.");
      } else if (stats.invalid > 0 && stats.imported === 0) {
        showNotification("error", "Failed to import records due to validation errors.");
      } else {
        showNotification("info", "Upload processed. No new indicators were imported.");
      }
    } catch (err: any) {
      setUploadProgress(null);
      const errMsg = err.response?.data?.detail || "An error occurred during file upload.";
      showNotification("error", errMsg);
    }
  };

  const triggerSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("desc");
    }
    setPage(1);
  };

  // Severity color mapper
  const getSeverityStyles = (severity: string) => {
    const s = severity.toLowerCase().trim();
    if (s === "critical" || s === "red") {
      return "bg-red-500/10 text-red-400 border border-red-500/20";
    }
    if (s === "high" || s === "orange") {
      return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    }
    if (s === "medium" || s === "yellow") {
      return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    }
    if (s === "low" || s === "green") {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
    return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  };

  // Formatting date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 px-4 md:px-8 mt-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-headline-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">upload_file</span>
            CSV / Excel Bulk Upload
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Upload custom threat feeds, scan histories, or batch reports directly into ThreatMap scans.
          </p>
        </div>
        
        {/* Actions */}
        <a 
          href={api.getBulkTemplateUrl()}
          className="inline-flex items-center gap-2 bg-surface-container-low border border-white/10 hover:bg-white/5 text-primary hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:border-primary/50"
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </a>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : notification.type === "error" 
            ? "bg-red-500/10 border-red-500/20 text-red-400"
            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
        }`}>
          {notification.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
          {notification.type === "error" && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
          {notification.type === "info" && <Info className="w-5 h-5 shrink-0 mt-0.5" />}
          
          <div className="flex-1 text-sm font-medium">{notification.message}</div>
          <button onClick={() => setNotification(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Upload Zone and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel border border-white/5 rounded-2xl p-6">
            <h2 className="text-md font-bold text-white mb-4 font-headline-md flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">publish</span>
              File Uploader
            </h2>

            {/* Drag & Drop Area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive 
                  ? "border-primary bg-primary/5 scale-[0.99]" 
                  : "border-white/10 hover:border-primary/50 hover:bg-white/5"
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".csv, .xls, .xlsx"
                onChange={handleFileChange}
              />
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    Drag and drop your file here, or <span className="text-primary hover:underline">browse</span>
                  </p>
                  <p className="text-on-surface-variant text-xs mt-1 font-mono-sm">
                    Supports .csv, .xlsx, .xls up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Selected File Details */}
            {selectedFile && (
              <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{selectedFile.name}</p>
                    <p className="text-on-surface-variant text-[10px] font-mono-sm">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="p-1.5 text-on-surface-variant hover:text-white rounded-lg hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadSubmit();
                    }}
                    className="bg-primary text-on-primary hover:bg-primary/95 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    IMPORT
                  </button>
                </div>
              </div>
            )}

            {/* Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="mt-4 space-y-2 animate-in fade-in duration-200">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-on-surface-variant">Uploading file and validating records...</span>
                  <span className="text-primary font-mono-sm">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Column */}
        <div>
          <div className="glass-panel border border-white/5 rounded-2xl p-6 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-md font-bold text-white mb-4 font-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">equalizer</span>
                Import Statistics
              </h2>

              {uploadStats ? (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                  
                  {/* Total */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                    <span className="text-on-surface-variant text-[10px] font-bold tracking-wider uppercase font-label-caps block mb-1">
                      Total Records
                    </span>
                    <span className="text-2xl font-black text-white font-headline-lg">
                      {uploadStats.total}
                    </span>
                  </div>

                  {/* Imported */}
                  <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 text-center">
                    <span className="text-emerald-400/80 text-[10px] font-bold tracking-wider uppercase font-label-caps block mb-1">
                      Imported
                    </span>
                    <span className="text-2xl font-black text-emerald-400 font-headline-lg">
                      {uploadStats.imported}
                    </span>
                  </div>

                  {/* Duplicate */}
                  <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10 text-center">
                    <span className="text-yellow-400/80 text-[10px] font-bold tracking-wider uppercase font-label-caps block mb-1">
                      Duplicates
                    </span>
                    <span className="text-2xl font-black text-yellow-400 font-headline-lg">
                      {uploadStats.duplicates}
                    </span>
                  </div>

                  {/* Invalid */}
                  <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10 text-center">
                    <span className="text-red-400/80 text-[10px] font-bold tracking-wider uppercase font-label-caps block mb-1">
                      Invalid
                    </span>
                    <span className="text-2xl font-black text-red-400 font-headline-lg">
                      {uploadStats.invalid}
                    </span>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5 text-on-surface-variant text-xs">
                  <Info className="w-5 h-5 mb-2 text-primary/50" />
                  No upload stats active.<br />Upload a threat list file to display metrics.
                </div>
              )}
            </div>

            {/* Error logs collapse */}
            {uploadStats && uploadStats.errors.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/5 animate-in fade-in duration-300">
                <span className="text-red-400 text-xs font-bold flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Validation Logs ({uploadStats.errors.length})
                </span>
                <div className="bg-black/40 border border-white/5 p-3 rounded-lg max-h-36 overflow-y-auto space-y-1.5 font-mono-sm text-[10px] text-on-surface-variant">
                  {uploadStats.errors.map((err, i) => (
                    <div key={i} className="flex gap-1.5">
                      <span className="text-red-500 shrink-0">⚠</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Uploaded Indicators Table Panel */}
      <div className="glass-panel border border-white/5 rounded-2xl p-6">
        
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-md font-bold text-white font-headline-md flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">table_rows</span>
              Uploaded Intel Database
            </h2>
            <span className="text-[10px] font-mono-sm font-bold bg-white/5 border border-white/10 text-on-surface-variant py-0.5 px-2 rounded-full">
              {totalItems} RECORDS
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:min-w-[280px]">
              <input
                type="text"
                placeholder="Search indicator, threat type, source..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-8 text-xs text-white placeholder-on-surface-variant/60 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-3 top-3" />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 p-0.5 text-on-surface-variant hover:text-white rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Refresh Button */}
            <button
              onClick={fetchIndicators}
              disabled={isLoading}
              className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 p-2 rounded-lg text-on-surface-variant hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-primary" : ""}`} />
            </button>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-on-surface-variant text-[10px] font-bold tracking-wider uppercase font-mono-sm">
                <th className="py-3 px-4 min-w-[200px]">
                  <button onClick={() => triggerSort("indicator")} className="flex items-center gap-1 hover:text-white">
                    Indicator Value
                    <ArrowUpDown className="w-3 h-3 text-primary/70" />
                  </button>
                </th>
                <th className="py-3 px-4 min-w-[100px]">
                  <button onClick={() => triggerSort("type")} className="flex items-center gap-1 hover:text-white">
                    Type
                    <ArrowUpDown className="w-3 h-3 text-primary/70" />
                  </button>
                </th>
                <th className="py-3 px-4 min-w-[160px]">Threat Type</th>
                <th className="py-3 px-4 min-w-[100px]">
                  <button onClick={() => triggerSort("risk_level")} className="flex items-center gap-1 hover:text-white">
                    Severity
                    <ArrowUpDown className="w-3 h-3 text-primary/70" />
                  </button>
                </th>
                <th className="py-3 px-4 min-w-[130px]">Source</th>
                <th className="py-3 px-4 min-w-[100px]">Country</th>
                <th className="py-3 px-4 min-w-[160px]">
                  <button onClick={() => triggerSort("created_at")} className="flex items-center gap-1 hover:text-white">
                    Upload Time
                    <ArrowUpDown className="w-3 h-3 text-primary/70" />
                  </button>
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-white/5 text-xs text-on-background">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-white/5 rounded w-3/4" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-white/5 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-white/5 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-6 bg-white/5 rounded-full w-16" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-white/5 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-white/5 rounded w-8" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-white/5 rounded w-32" /></td>
                  </tr>
                ))
              ) : indicators.length > 0 ? (
                indicators.map((ind) => (
                  <tr key={ind.id} className="hover:bg-white/[0.02] transition-colors border-b border-white/5">
                    <td className="py-4 px-4 font-mono-sm font-semibold text-white break-all max-w-xs">
                      {ind.indicator}
                    </td>
                    <td className="py-4 px-4 font-bold text-[10px] tracking-wider uppercase font-mono-sm">
                      <span className={`px-1.5 py-0.5 rounded border ${
                        ind.type === "ip" 
                          ? "bg-sky-500/10 text-sky-400 border-sky-500/20" 
                          : ind.type === "domain"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : ind.type === "url"
                          ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                          : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      }`}>
                        {ind.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant font-medium">
                      {ind.threat_type}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-label-caps uppercase ${getSeverityStyles(ind.severity)}`}>
                        {ind.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant font-medium">
                      {ind.source}
                    </td>
                    <td className="py-4 px-4 font-bold font-mono-sm text-white">
                      {ind.country || "—"}
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant font-medium">
                      {formatDate(ind.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    <Info className="w-6 h-6 mx-auto mb-2 text-primary/50" />
                    No indicators found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <span className="text-xs text-on-surface-variant font-medium">
              Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalItems} total items)
            </span>
            
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 p-1.5 rounded-lg text-on-surface-variant hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Numeric Page indicators (simple limit to 5 visible page bubbles) */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Only show around current page
                if (totalPages > 5 && Math.abs(page - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                  return pageNum === 2 || pageNum === totalPages - 1 ? <span key={pageNum} className="text-on-surface-variant text-xs">...</span> : null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono-sm transition-all border ${
                      page === pageNum
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 p-1.5 rounded-lg text-on-surface-variant hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
