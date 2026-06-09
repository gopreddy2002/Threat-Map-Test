import React from "react";

interface RiskBadgeProps {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score?: number;
}

import { motion } from "framer-motion";

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score }) => {
  const getBadgeStyle = () => {
    switch (level.toUpperCase()) {
      case "CRITICAL":
        return {
          bg: "bg-[#93000a]/30 text-[#ffb4ab] border-[#ffb4ab]/25",
          icon: "brightness_high",
          text: "Critical",
        };
      case "HIGH":
        return {
          bg: "bg-[#df7412]/20 text-[#ffb786] border-[#ffb786]/20",
          icon: "warning",
          text: "High Risk",
        };
      case "MEDIUM":
        return {
          bg: "bg-secondary-container/30 text-on-secondary-container border-on-secondary-container/20",
          icon: "report",
          text: "Medium",
        };
      default:
        return {
          bg: "bg-surface-container-low text-primary border-primary/20",
          icon: "check_circle",
          text: "Low Risk",
        };
    }
  };

  const style = getBadgeStyle();
  const isCritical = level.toUpperCase() === "CRITICAL";

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [1.1, 1], opacity: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 15 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold font-mono-sm border rounded-full ${style.bg} ${isCritical ? "animate-pulse" : ""}`}
    >
      <span className="material-symbols-outlined text-[14px]">{style.icon}</span>
      {style.text} {score !== undefined && `(${score})`}
    </motion.span>
  );
};
export default RiskBadge;
