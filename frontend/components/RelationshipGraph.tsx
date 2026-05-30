"use client";

import React, { useState } from "react";

interface Node {
  id: string;
  label: string;
  type: "ioc" | "asn" | "country" | "actor" | "subnet";
  risk?: number;
}

interface Edge {
  from: string;
  to: string;
  label?: string;
}

interface RelationshipGraphProps {
  nodes: Node[];
  edges: Edge[];
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  ioc:    { bg: "bg-indigo-500/10",  border: "border-indigo-500/40",  text: "text-indigo-300",  dot: "bg-indigo-500" },
  asn:    { bg: "bg-sky-500/10",     border: "border-sky-500/40",     text: "text-sky-300",     dot: "bg-sky-500" },
  country:{ bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-300", dot: "bg-emerald-500" },
  actor:  { bg: "bg-red-500/10",     border: "border-red-500/40",     text: "text-red-300",     dot: "bg-red-500" },
  subnet: { bg: "bg-amber-500/10",   border: "border-amber-500/40",   text: "text-amber-300",   dot: "bg-amber-500" },
};

const TYPE_ICONS: Record<string, string> = {
  ioc: "sensors", asn: "account_tree", country: "public", actor: "person_alert", subnet: "lan",
};

export const RelationshipGraph: React.FC<RelationshipGraphProps> = ({ nodes, edges }) => {
  const [selected, setSelected] = useState<string | null>(null);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant/40 text-sm gap-2">
        <span className="material-symbols-outlined text-[40px] opacity-30">hub</span>
        <p>No relationship data available for this IOC.</p>
      </div>
    );
  }

  // Build adjacency map for highlighting connected edges
  const connectedNodes = new Set<string>();
  if (selected) {
    edges.forEach(e => {
      if (e.from === selected) connectedNodes.add(e.to);
      if (e.to === selected) connectedNodes.add(e.from);
    });
  }

  // Group nodes by type for tree layout
  const grouped: Record<string, Node[]> = {};
  nodes.forEach(n => {
    if (!grouped[n.type]) grouped[n.type] = [];
    grouped[n.type].push(n);
  });

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(TYPE_COLORS).map(([type, c]) => (
          <div key={type} className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-mono">
            <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
            {type.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Relationship Cards */}
      <div className="space-y-3">
        {Object.entries(grouped).map(([type, typeNodes]) => {
          const c = TYPE_COLORS[type] || TYPE_COLORS.ioc;
          return (
            <div key={type}>
              <p className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${c.text}`}>
                <span className="material-symbols-outlined text-[12px] align-middle mr-1">{TYPE_ICONS[type] || "circle"}</span>
                {type} ({typeNodes.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {typeNodes.map(node => {
                  const isSelected = selected === node.id;
                  const isConnected = connectedNodes.has(node.id);
                  const dimmed = selected && !isSelected && !isConnected;

                  // Find edges for this node
                  const nodeEdges = edges.filter(e => e.from === node.id || e.to === node.id);

                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelected(isSelected ? null : node.id)}
                      className={`text-left p-3 rounded-xl border transition-all duration-200 ${c.bg} ${
                        isSelected
                          ? `${c.border} ring-1 ring-inset ${c.border.replace("border-", "ring-")}`
                          : isConnected
                          ? "border-white/20 bg-white/5"
                          : dimmed
                          ? "border-white/5 opacity-30"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`material-symbols-outlined text-[14px] ${c.text}`}>
                          {TYPE_ICONS[type] || "circle"}
                        </span>
                        <span className={`text-xs font-bold truncate ${c.text}`}>{node.label}</span>
                        {node.risk !== undefined && (
                          <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            node.risk >= 70 ? "bg-red-500/20 text-red-300 border-red-500/30" :
                            node.risk >= 40 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                            "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          }`}>{node.risk}</span>
                        )}
                      </div>
                      {nodeEdges.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {nodeEdges.map((e, i) => {
                            const other = e.from === node.id
                              ? nodes.find(n => n.id === e.to)
                              : nodes.find(n => n.id === e.from);
                            return (
                              <span key={i} className="text-[9px] text-on-surface-variant/60 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded font-mono">
                                {e.label ? `${e.label}: ` : "→ "}{other?.label?.substring(0, 12) || "?"}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edge summary when node selected */}
      {selected && connectedNodes.size > 0 && (
        <div className="mt-2 p-3 rounded-lg bg-white/3 border border-white/10 text-[11px] text-on-surface-variant font-mono">
          <span className="text-primary font-bold">{nodes.find(n => n.id === selected)?.label}</span>
          {" "}is connected to {connectedNodes.size} node{connectedNodes.size > 1 ? "s" : ""}.{" "}
          <button onClick={() => setSelected(null)} className="text-white/50 hover:text-white underline">Clear</button>
        </div>
      )}
    </div>
  );
};

export default RelationshipGraph;
