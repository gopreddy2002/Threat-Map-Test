import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, className }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 1000;
    const incrementTime = Math.max(duration / end, 10);

    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <motion.span className={className}>{displayValue}</motion.span>;
};

export default AnimatedCounter;
