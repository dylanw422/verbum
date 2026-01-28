"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenTool, CheckCircle } from "lucide-react";

interface DailyVerse {
  book: string;
  chapter: number;
  verse: string;
  verseText: string;
  reference: string;
}

interface MeditationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyVerse: DailyVerse | null | undefined;
  onJournal: () => void;
}

export function MeditationModal({
  isOpen,
  onClose,
  dailyVerse,
  onJournal,
}: MeditationModalProps) {
  const [phase, setPhase] = useState<"meditating" | "completed">("meditating");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [breathState, setBreathState] = useState<"in" | "out">("in");

  // Timer
  useEffect(() => {
    if (!isOpen || phase !== "meditating") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPhase("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, phase]);

  // Breathing Rhythm (5s in, 5s out)
  useEffect(() => {
    if (!isOpen || phase !== "meditating") return;

    const breathInterval = setInterval(() => {
      setBreathState((prev) => (prev === "in" ? "out" : "in"));
    }, 5000);

    return () => clearInterval(breathInterval);
  }, [isOpen, phase]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPhase("meditating");
      setTimeLeft(120);
      setBreathState("in");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-zinc-100 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-2 text-zinc-500 hover:text-rose-500 transition-colors rounded-full border border-transparent hover:border-zinc-800"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Background Gradient & Noise */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

          {/* BREATHING CIRCLE ANIMATION */}
          {phase === "meditating" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{
                  scale: breathState === "in" ? 1.5 : 1,
                  opacity: breathState === "in" ? 0.5 : 0.25,
                  borderColor: breathState === "in" ? "rgba(244, 63, 94, 0.6)" : "rgba(244, 63, 94, 0.2)",
                }}
                transition={{ duration: 5, ease: "easeInOut" }}
                className="w-64 h-64 md:w-96 md:h-96 rounded-full border-2 border-rose-500/20 bg-rose-500/10 blur-3xl"
              />
              <motion.div
                animate={{
                  scale: breathState === "in" ? 1.2 : 0.8,
                  opacity: breathState === "in" ? 0.8 : 0.4,
                  borderColor: breathState === "in" ? "rgba(244, 63, 94, 0.5)" : "rgba(244, 63, 94, 0.2)",
                }}
                transition={{ duration: 5, ease: "easeInOut" }}
                className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full border border-rose-500/30"
              />
            </div>
          )}

          {/* CONTENT CONTAINER */}
          <div className="relative z-10 max-w-4xl px-8 text-center flex flex-col items-center gap-8">
            
            {phase === "meditating" ? (
              <>
                {/* Timer & Breath Text */}
                <div className="flex flex-col items-center gap-2 mb-8">
                  <motion.span
                    key={breathState}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 1 }}
                    className="text-xs font-mono uppercase tracking-[0.3em] text-rose-500"
                  >
                    {breathState === "in" ? "Breathe In" : "Breathe Out"}
                  </motion.span>
                  {/* Timer Bar */}
                   <div className="w-32 h-1 bg-zinc-900 rounded-full overflow-hidden mt-2">
                      <motion.div 
                        className="h-full bg-zinc-800"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((120 - timeLeft) / 120) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                   </div>
                </div>

                {/* Verse Text */}
                <blockquote className="space-y-6">
                  <p className="text-3xl md:text-5xl font-serif italic text-zinc-100 leading-snug md:leading-relaxed drop-shadow-2xl">
                    "{dailyVerse?.verseText || "Loading..."}"
                  </p>
                  <cite className="block text-sm font-mono text-zinc-500 uppercase tracking-widest not-italic">
                    — {dailyVerse?.reference || ""}
                  </cite>
                </blockquote>
              </>
            ) : (
              // COMPLETION STATE
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800 text-rose-500 mb-2">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
                  Meditation Complete.
                </h2>
                <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
                  What is the Spirit speaking to you through this scripture? Capture your thoughts while they are fresh.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center">
                  <button
                    onClick={onJournal}
                    className="px-8 py-3 bg-rose-600 text-white font-mono text-xs uppercase tracking-widest rounded hover:bg-rose-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20"
                  >
                    <PenTool className="w-4 h-4" />
                    Journal Reflection
                  </button>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-transparent border border-zinc-800 text-zinc-400 font-mono text-xs uppercase tracking-widest rounded hover:text-zinc-200 hover:border-zinc-700 transition-all"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
