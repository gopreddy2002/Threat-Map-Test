"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronRight, ChevronLeft, RotateCcw, CheckCircle, XCircle, Clock, Trophy } from "lucide-react";

// 12 High-Quality Security Questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    topic: "Phishing",
    question: "You receive an urgent email from your bank asking you to verify your credentials via an attached link. What should you do?",
    options: [
      "Click the link immediately and update your details to secure the account.",
      "Reply to the email asking if it is a legitimate message from the bank.",
      "Ignore the email and contact your bank directly through their official phone number or website.",
      "Forward the email to all your colleagues to warn them about the security issue."
    ],
    correctAnswerIndex: 2,
    explanation: "Legitimate organizations, especially banks, will never ask for credentials via email links. Always communicate through official, independent verification channels."
  },
  {
    id: 2,
    topic: "Ransomware",
    question: "What is the primary objective of a Ransomware attack?",
    options: [
      "To steal your unused internet bandwidth for background cryptomining.",
      "To encrypt local server files and demand payment for the decryption key.",
      "To inject advertisement scripts directly into your browser display.",
      "To hijack your device's hardware webcam to record keystrokes."
    ],
    correctAnswerIndex: 1,
    explanation: "Ransomware encrypts target systems or files, rendering them unusable until the victim pays a ransom (usually in cryptocurrency) to get the decryption keys."
  },
  {
    id: 3,
    topic: "DDoS",
    question: "What does a Distributed Denial of Service (DDoS) attack aim to achieve?",
    options: [
      "Brute-forcing admin credentials on a local database node.",
      "Infecting locally stored system files with a self-replicating virus.",
      "Overwhelming a target server or network with garbage traffic to make it unavailable to legitimate users.",
      "Intercepting local wireless data transmissions on a public Wi-Fi network."
    ],
    correctAnswerIndex: 2,
    explanation: "DDoS attacks coordinate a botnet (network of compromised systems) to flood a target server with traffic, causing downtime or resource depletion."
  },
  {
    id: 4,
    topic: "Password Security",
    question: "Which of the following is considered the most secure password management practice?",
    options: [
      "Using a short, memorable word with one capital letter and a number.",
      "Reusing the same strong password across all personal and work logins.",
      "Using long, unique passphrases for each account, stored in a secure password manager.",
      "Writing passwords on a sticky note kept under your keyboard."
    ],
    correctAnswerIndex: 2,
    explanation: "A password manager enables you to generate and store complex, unique passwords for every application, reducing credentials stuffing risks."
  },
  {
    id: 5,
    topic: "Social Engineering",
    question: "What is 'Tailgating' in the context of physical cybersecurity?",
    options: [
      "Sending deceptive spear-phishing emails disguised as direct team managers.",
      "Following an authorized person into a secure physical area without scanning credentials.",
      "Intercepting data packets on a local corporate network switch.",
      "Overclocking GPU clusters to perform rapid offline password cracking."
    ],
    correctAnswerIndex: 1,
    explanation: "Tailgating involves physically entering a restricted area by closely following an authorized employee through security checkpoints."
  },
  {
    id: 6,
    topic: "Firewalls",
    question: "What is the primary security function of a network firewall?",
    options: [
      "To automatically backup files to secure cloud databases.",
      "To monitor and filter inbound and outbound network traffic based on predefined security rules.",
      "To scan local storage disk drives for trojans and adware.",
      "To optimize internet throughput speeds across network terminals."
    ],
    correctAnswerIndex: 1,
    explanation: "A firewall functions as a gateway boundary, analyzing network headers and packets to block unauthorized traffic based on security policies."
  },
  {
    id: 7,
    topic: "VPN",
    question: "How does a Virtual Private Network (VPN) enhance security for remote connections?",
    options: [
      "By removing duplicate temp and cache files from web browsers.",
      "By encrypting your data packets and masking your actual public IP address.",
      "By performing automated antivirus sweeps on email attachments.",
      "By physically disconnecting your device hardware from local networks."
    ],
    correctAnswerIndex: 1,
    explanation: "VPNs create a secure encrypted tunnel between the user's terminal and a remote gateway server, hiding browsing activity from network eavesdroppers."
  },
  {
    id: 8,
    topic: "Zero-Day Vulnerabilities",
    question: "What is a 'Zero-Day' vulnerability in cybersecurity?",
    options: [
      "A security bug that has been patched for zero days.",
      "A vulnerability that is known to software developers but has not yet been exploited in the wild.",
      "A software flaw that is actively exploited before the vendor is aware of it or has released a patch.",
      "A bug that only affects operating systems installed within the last 24 hours."
    ],
    correctAnswerIndex: 2,
    explanation: "A Zero-Day vulnerability is a software flaw that attackers exploit before the developer knows about it, meaning there are 'zero days' of protection or patching available."
  },
  {
    id: 9,
    topic: "Safe Browsing",
    question: "What does the secure protocol 'HTTPS' signify relative to standard 'HTTP'?",
    options: [
      "It speeds up website asset downloads on cloud distributions.",
      "It encrypts the communication channel between your browser and the web server using SSL/TLS.",
      "It guarantees that all content on the website is verified clean and malware-free.",
      "It represents a local network caching configuration."
    ],
    correctAnswerIndex: 1,
    explanation: "HTTPS (Hypertext Transfer Protocol Secure) uses cryptography to encrypt HTTP traffic, preventing man-in-the-middle attacks on the transmitted data."
  },
  {
    id: 10,
    topic: "Email Security",
    question: "Which file type represents the highest risk when received in an email attachment from an unknown sender?",
    options: [
      "A standard document format like '.txt'.",
      "An image asset file like '.png'.",
      "An executable script file like '.exe'.",
      "An audio playback track like '.mp3'."
    ],
    correctAnswerIndex: 2,
    explanation: "Executable files (.exe, .scr, .js) run command code directly on your operating system and can install malware immediately when double-clicked."
  },
  {
    id: 11,
    topic: "Cyber Hygiene",
    question: "What is the best practice for applying software patches and system updates?",
    options: [
      "Apply updates only when the device or application crashes.",
      "Apply security patches once a year during audits.",
      "Apply updates regularly and promptly when released by the vendor.",
      "Ignore updates entirely, as updates generally introduce operating system slowdowns."
    ],
    correctAnswerIndex: 2,
    explanation: "Timely patching closes known vulnerabilities that security researchers or hackers discover, preventing automated exploit campaigns."
  },
  {
    id: 12,
    topic: "Multi-Factor Authentication",
    question: "Which of the following is considered the most secure multi-factor authentication implementation?",
    options: [
      "Standard SMS-based OTP verification codes.",
      "Hardware security keys (FIDO2) or authentication apps.",
      "Traditional static security questions.",
      "Email recovery notification links."
    ],
    correctAnswerIndex: 1,
    explanation: "SMS codes are vulnerable to SIM-swapping or interception. FIDO2 security keys and authenticator apps use secure key exchanges, making them much more robust."
  }
];

export default function QuizPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  
  const timerRef = useRef<any>(null);

  // Timer logic
  useEffect(() => {
    if (timerActive && !quizFinished) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, quizFinished]);

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx
    }));
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Finish quiz
      setTimerActive(false);
      setQuizFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setTimer(0);
    setTimerActive(true);
  };

  // Calculations for results page
  const getScoreDetails = () => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });
    const incorrect = QUIZ_QUESTIONS.length - correct;
    const percentage = Math.round((correct / QUIZ_QUESTIONS.length) * 100);
    
    let rating = "Beginner";
    let ratingColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (percentage >= 90) {
      rating = "Expert";
      ratingColor = "text-red-400 bg-red-500/10 border-red-500/20";
    } else if (percentage >= 70) {
      rating = "Advanced";
      ratingColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
    } else if (percentage >= 40) {
      rating = "Intermediate";
      ratingColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    }

    return { correct, incorrect, percentage, rating, ratingColor };
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 pt-6 px-4 md:px-8">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="material-symbols-outlined text-[36px] text-primary mb-2">quiz</span>
        <h1 className="text-3xl font-black text-white tracking-tight font-headline-lg">Cybersecurity IQ Assessment</h1>
        <p className="text-on-surface-variant text-sm mt-2 max-w-2xl mx-auto">
          Test your defensive credentials across standard vectors: Phishing, Ransomware, MFA, and general cyber safety practices.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!quizFinished ? (
          <motion.div
            key="quiz-body"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Top Toolbar (Progress & Timer) */}
            <div className="glass-panel p-md rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono-sm text-on-surface-variant uppercase">
                  Question <span className="text-white font-bold">{currentIdx + 1}</span> of {QUIZ_QUESTIONS.length}
                </span>
                {/* Visual Progress Bar */}
                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                  <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary font-mono-sm font-semibold bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg">
                <Clock size={14} className="animate-pulse" />
                <span>ELAPSED: {formatTime(timer)}</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="glass-panel p-lg rounded-xl flex flex-col space-y-6">
              <div className="flex items-start gap-3">
                <span className="text-[10px] font-mono-sm uppercase text-primary border border-primary/25 bg-primary/5 px-2.5 py-0.5 rounded font-bold">
                  {currentQuestion.topic}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
                {currentQuestion.question}
              </h2>

              {/* Answers */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentIdx] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all text-xs font-semibold leading-relaxed flex items-center justify-between ${
                        isSelected
                          ? "bg-primary/10 border-primary text-white font-bold shadow-[0_0_12px_rgba(173,198,255,0.15)]"
                          : "bg-surface-container-low border-white/5 text-on-surface-variant hover:border-white/10 hover:text-white"
                      }`}
                    >
                      <span>{option}</span>
                      <div className={`w-4 h-4 rounded-full border shrink-0 ml-3 flex items-center justify-center ${
                        isSelected ? "border-primary bg-primary text-black" : "border-white/20"
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-low border border-white/5 hover:border-white/10 text-on-surface-variant hover:text-white rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none text-xs font-bold font-mono-sm uppercase tracking-wider"
              >
                <ChevronLeft size={16} />
                BACK
              </button>

              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentIdx] === undefined}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-lg transition-all disabled:opacity-40 disabled:pointer-events-none text-xs font-black tracking-widest uppercase font-mono-sm shadow-md"
              >
                {currentIdx === QUIZ_QUESTIONS.length - 1 ? "FINISH" : "NEXT"}
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Results Dashboard */
          <motion.div
            key="quiz-results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Score Summary Card */}
            {(() => {
              const details = getScoreDetails();
              return (
                <div className="glass-panel p-lg rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden space-y-6">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                  <Trophy size={48} className="text-primary animate-bounce mt-4" />
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase">Final Performance</span>
                    <h2 className="text-3xl font-black text-white">Assessment Complete</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl py-4 border-y border-white/5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase">Score</span>
                      <div className="text-2xl font-black text-white">{details.correct} / {QUIZ_QUESTIONS.length}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase">Percentage</span>
                      <div className="text-2xl font-black text-primary font-mono-md">{details.percentage}%</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase">Total Time</span>
                      <div className="text-2xl font-black text-white font-mono-md">{formatTime(timer)}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono-sm text-on-surface-variant uppercase">Defensive Rating</span>
                      <div className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${details.ratingColor} mt-1`}>
                        {details.rating}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest rounded-lg hover:opacity-90 transition-all font-mono-sm"
                  >
                    <RotateCcw size={14} />
                    RESTART QUIZ
                  </button>
                </div>
              );
            })()}

            {/* Answer Key Review Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2 font-headline-sm">
                <HelpCircle size={18} className="text-primary" />
                Defensive Knowledge Review
              </h3>

              <div className="space-y-4">
                {QUIZ_QUESTIONS.map((q, idx) => {
                  const userAns = selectedAnswers[idx];
                  const isCorrect = userAns === q.correctAnswerIndex;
                  return (
                    <div key={q.id} className="glass-panel p-md rounded-xl space-y-3.5 hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono-sm font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-on-surface-variant">
                            Q{q.id} - {q.topic}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isCorrect ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-mono-sm uppercase">
                              <CheckCircle size={12} /> Correct
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 font-mono-sm uppercase">
                              <XCircle size={12} /> Incorrect
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-sm font-bold text-white leading-snug">
                        {q.question}
                      </p>

                      <div className="space-y-2 text-xs">
                        <div className={`p-2.5 rounded-lg border ${
                          isCorrect 
                            ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-300"
                            : "bg-red-500/5 border-red-500/10 text-red-300"
                        }`}>
                          <span className="font-bold uppercase tracking-wider block text-[9px] text-on-surface-variant mb-1">Your Answer:</span>
                          {q.options[userAns]}
                        </div>

                        {!isCorrect && (
                          <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-300">
                            <span className="font-bold uppercase tracking-wider block text-[9px] text-on-surface-variant mb-1">Correct Answer:</span>
                            {q.options[q.correctAnswerIndex]}
                          </div>
                        )}

                        <div className="p-3 rounded-lg bg-surface-container-low border border-white/5 text-on-surface-variant leading-relaxed text-xs">
                          <span className="font-bold text-white block text-[9px] uppercase tracking-wider mb-1">Analysis & Explanation:</span>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
