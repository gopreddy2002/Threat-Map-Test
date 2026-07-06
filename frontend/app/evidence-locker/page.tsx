"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

export default function EvidenceLockerPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/evidence/`);
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
      const res = await fetch(`${API_BASE_URL}/evidence/upload`, {
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
      const res = await fetch(`${API_BASE_URL}/evidence/${id}`, { method: "DELETE" });
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
