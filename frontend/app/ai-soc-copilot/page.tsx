"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Copy, Check, Paperclip, X, Download, Trash2, Search } from "lucide-react";

export default function AISOCCopilotPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [copiedMessageIdx, setCopiedMessageIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/ai-copilot/history`);
      const data = await res.json();
      if (data.status === "success") {
        const formatted = data.data.flatMap((c: any) => [
          { role: "user", content: c.prompt, timestamp: c.timestamp },
          { role: "assistant", content: c.response, timestamp: c.timestamp }
        ]);
        setMessages(formatted);
      }
    } catch (e) {
      console.error("Failed to fetch history", e);
    }
  };

  const handleSend = async (promptText: string = input) => {
    if (!promptText.trim() && !file) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "user", content: promptText }]);
    setInput("");
    
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append("prompt", promptText);
        formData.append("file", file);
        res = await fetch(`${API_URL}/ai-copilot/upload`, {
          method: "POST",
          body: formData,
        });
        setFile(null);
      } else {
        const formData = new URLSearchParams();
        formData.append("prompt", promptText);
        res = await fetch(`${API_URL}/ai-copilot/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
        });
      }
      
      const data = await res.json();
      if (data.status === "success") {
        setMessages(prev => [...prev, { role: "assistant", content: data.data.response }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI Copilot." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await fetch(`${API_URL}/ai-copilot/history`, { method: "DELETE" });
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportTxt = () => {
    if (messages.length === 0) return;
    const txtContent = messages.map(m => `[${m.role.toUpperCase()}] \n${m.content}\n`).join("\n----------------------------------------\n\n");
    const blob = new Blob([txtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ThreatMap_Copilot_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIdx(idx);
    setTimeout(() => setCopiedMessageIdx(null), 2000);
  };

  const filteredMessages = messages.filter(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()));

  const SUGGESTIONS = [
    "Explain this IOC",
    "Generate Sigma Rule",
    "Explain this CVE",
    "Generate YARA Rule",
    "Explain this MITRE ATT&CK technique",
    "Suggest mitigations"
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col glass-panel rounded-xl border border-white/5 overflow-hidden">
        
        {/* Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface/50 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[24px]">local_police</span>
            <div>
              <h1 className="font-bold text-white text-md font-headline-sm">AI SOC Copilot</h1>
              <p className="text-[10px] text-on-surface-variant font-mono-sm">
                Advanced Security Operations Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
                onClick={handleExportTxt}
                className="text-[11px] font-mono-sm text-on-surface-variant hover:text-white px-3 py-1.5 rounded border border-white/5 hover:bg-white/5 transition-colors flex items-center gap-1.5"
                title="Export as TXT"
              >
                <Download size={14} />
                EXPORT
              </button>
              <button
                onClick={handleClear}
                className="text-[11px] font-mono-sm text-error hover:text-error/80 px-3 py-1.5 rounded border border-error/20 hover:bg-error/10 transition-colors flex items-center gap-1.5"
                title="Clear Chat"
              >
                <Trash2 size={14} />
                CLEAR
              </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[40px]">shield_person</span>
              </div>
              <div className="max-w-md space-y-2">
                <h2 className="text-xl font-bold text-white">How can I assist your investigation?</h2>
                <p className="text-sm text-on-surface-variant">
                  Upload logs, provide IOCs, or ask for detection rules.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="px-4 py-2 bg-surface-container-low hover:bg-white/5 border border-white/5 rounded-full text-xs text-on-surface transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              <AnimatePresence initial={false}>
                {filteredMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                        msg.role === "user"
                          ? "bg-primary text-on-primary font-medium"
                          : "bg-surface-container-high text-white border border-white/5 shadow-lg relative"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div>
                          <MarkdownRenderer content={msg.content} />
                          <button
                            onClick={() => handleCopyMessage(msg.content, idx)}
                            className="absolute -bottom-3 -right-3 p-2 bg-surface-container-high border border-white/10 rounded-lg text-on-surface-variant hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            title="Copy response"
                          >
                            {copiedMessageIdx === idx ? <Check size={14} className="text-primary"/> : <Copy size={14} />}
                          </button>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-surface-container-high border border-white/5 rounded-2xl px-5 py-4 shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface/80 backdrop-blur-md border-t border-white/5 relative">
           {file && (
            <div className="absolute bottom-full mb-3 left-6 bg-surface-container-high border border-white/10 p-2 rounded-lg flex items-center gap-3 shadow-xl">
              <span className="material-symbols-outlined text-on-surface-variant">draft</span>
              <span className="text-xs text-white truncate max-w-[150px]">{file.name}</span>
              <button onClick={() => setFile(null)} className="p-1 hover:bg-white/10 rounded-lg"><X size={14} className="text-red-400"/></button>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto flex items-end gap-2 bg-surface-container-low border border-white/10 rounded-xl p-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
            <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-on-surface-variant hover:text-white rounded-lg transition-colors">
              <Paperclip size={20} className={file ? "text-primary" : ""} />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Copilot for analysis, rules, or summaries..."
              className="flex-1 bg-transparent border-none text-white text-sm resize-none focus:ring-0 min-h-[44px] max-h-32 py-3 px-2 custom-scrollbar"
              rows={1}
              disabled={isLoading}
            />
            
            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && !file) || isLoading}
              className="h-11 w-11 shrink-0 bg-primary text-on-primary rounded-lg flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel for History & Context */}
      <div className="w-80 hidden lg:flex flex-col gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/5 flex-1 flex flex-col">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">history</span>
            Conversation Context
          </h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} />
            <input 
              type="text" 
              placeholder="Search conversation..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {messages.filter(m => m.role === "user").reverse().map((m, i) => (
              <div key={i} className="p-3 bg-surface-container-low rounded-lg border border-white/5 text-xs text-on-surface-variant truncate">
                "{m.content}"
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-xs text-on-surface-variant/50 mt-10">
                No history
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
