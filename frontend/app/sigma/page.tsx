"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SigmaRuleGenerator() {
  const [ruleData, setRuleData] = useState({
    title: "Suspicious PowerShell Download",
    description: "Detects suspicious PowerShell download cradles",
    author: "ThreatMap",
    date: new Date().toISOString().split('T')[0],
    logsourceCategory: "process_creation",
    logsourceProduct: "windows",
    selectionName: "selection",
    selectionField: "CommandLine",
    selectionValue: "Net.WebClient",
    condition: "selection",
    level: "high"
  });

  const generateYaml = () => {
    return `title: ${ruleData.title}
id: ${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}-4444-8888-1234567890ab
description: ${ruleData.description}
author: ${ruleData.author}
date: ${ruleData.date}
logsource:
    category: ${ruleData.logsourceCategory}
    product: ${ruleData.logsourceProduct}
detection:
    ${ruleData.selectionName}:
        ${ruleData.selectionField}|contains: '${ruleData.selectionValue}'
    condition: ${ruleData.condition}
level: ${ruleData.level}
tags:
    - attack.execution
    - attack.t1059.001
`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRuleData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="relative min-h-full flex flex-col gap-6">
      <div className="flex items-center justify-between z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Sigma Rule Generator</h1>
          <p className="text-on-surface-variant max-w-2xl text-sm">
            Quickly create Sigma rules for SIEM deployment using our visual builder.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 z-10">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface-container-low border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/5 pb-2">Rule Metadata</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Title</label>
              <input 
                type="text" name="title" value={ruleData.title} onChange={handleInputChange}
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Description</label>
              <textarea 
                name="description" value={ruleData.description} onChange={handleInputChange} rows={2}
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Log Category</label>
                <input 
                  type="text" name="logsourceCategory" value={ruleData.logsourceCategory} onChange={handleInputChange}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Log Product</label>
                <input 
                  type="text" name="logsourceProduct" value={ruleData.logsourceProduct} onChange={handleInputChange}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-6 mt-8 border-b border-white/5 pb-2">Detection Logic</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Field</label>
                <input 
                  type="text" name="selectionField" value={ruleData.selectionField} onChange={handleInputChange}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Contains Value</label>
                <input 
                  type="text" name="selectionValue" value={ruleData.selectionValue} onChange={handleInputChange}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Condition</label>
              <input 
                type="text" name="condition" value={ruleData.condition} onChange={handleInputChange}
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Severity Level</label>
              <select 
                name="level" value={ruleData.level} onChange={handleInputChange}
                className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [&>option]:bg-surface [&>option]:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">code</span>
              Generated YAML
            </h2>
            <button 
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white rounded transition-colors"
              onClick={() => navigator.clipboard.writeText(generateYaml())}
            >
              Copy
            </button>
          </div>
          
          <pre className="flex-1 bg-transparent text-sm font-mono text-[#a6e22e] overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {generateYaml()}
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
