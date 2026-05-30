import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

interface ScanSequenceProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const STEPS = [
  "Initializing security engines...",
  "Querying VirusTotal reputation...",
  "Checking AbuseIPDB records...",
  "Running WHOIS & DNS lookups...",
  "Fetching geographic coordinates...",
  "Generating AI analysis brief...",
  "Finalizing threat report..."
];

export const ScanSequence: React.FC<ScanSequenceProps> = ({ isVisible, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStepIndex(0);
      return;
    }

    // Simulate progress through the steps while the actual API call is happening
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface-container border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <h2 className="text-xl font-bold text-white font-headline-sm">Analyzing Target...</h2>
            </div>

            <div className="space-y-4">
              {STEPS.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                const isUpcoming = index > currentStepIndex;

                if (isUpcoming && index > currentStepIndex + 1) return null; // Only show one upcoming step

                return (
                  <motion.div
                    key={step}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`flex items-center gap-3 ${
                      isActive ? "text-primary" : isCompleted ? "text-emerald-400" : "text-white/30"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-white/10 shrink-0" />
                    )}
                    <span className="text-sm font-mono-sm">{step}</span>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                transition={{ ease: "linear", duration: 1.5 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScanSequence;
