import { useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

import type { WordData } from "./types";

import { ProgressBar } from "./ProgressBar";
import { RSVPWordDisplay } from "./RSVPWordDisplay";
import { MagicalTransition } from "./MagicalTransition";

interface ReaderStageProps {
  words: WordData[];
  wordIndex: number;
  readingMode: boolean;
  playing: boolean;
  chapterData?: any;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRestart: () => void;
  onWordClick: (index: number) => void;
}

/**
 * Main reading area. Switches between RSVP display and Reading Mode (full text).
 */
export function ReaderStage({
  words,
  wordIndex,
  readingMode,
  playing,
  onSeek,
  onRestart,
  onWordClick,
}: ReaderStageProps) {
  const progress = words.length ? (wordIndex / words.length) * 100 : 0;
  const currentWord = words[wordIndex];
  
  // Ref for auto-scrolling to active verse in Reading Mode
  const activeVerseRef = useRef<HTMLDivElement>(null);

  // Group words by verse for Reading Mode text reconstruction
  const verses = useMemo(() => {
    const grouped: Record<string, { word: WordData; index: number }[]> = {};
    words.forEach((w, i) => {
      if (!grouped[w.verse]) {
        grouped[w.verse] = [];
      }
      grouped[w.verse].push({ word: w, index: i });
    });
    return grouped;
  }, [words]);

  // Auto-scroll effect when entering Reading Mode
  useEffect(() => {
    if (readingMode && activeVerseRef.current) {
      activeVerseRef.current.scrollIntoView({ behavior: "auto", block: "center" });
    }
  }, [readingMode]);

  // Auto-scroll effect while playing in Reading Mode
  useEffect(() => {
    if (readingMode && playing && activeVerseRef.current) {
      activeVerseRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [readingMode, playing, currentWord?.verse]);

  return (
    <div className="relative z-30 flex flex-col items-center justify-center w-full max-w-5xl h-full md:h-auto">
      
      {/* Magical Transition Overlay */}
      <MagicalTransition readingMode={readingMode} />

      <AnimatePresence mode="popLayout">
        {readingMode ? (
          // --- READING MODE VIEW ---
          <motion.div
            layout
            key="reading-mode"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="w-full h-[60vh] md:h-[70vh] overflow-y-auto px-6 py-12 scrollbar-hide mask-image-edges bg-zinc-950/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-2xl relative z-20"
          >
            <div className="max-w-2xl mx-auto pb-20">
              {Object.entries(verses).map(([vNum, vWords]) => {
                const isCurrentVerse = currentWord && currentWord.verse === vNum;
                
                return (
                  <div
                    key={vNum}
                    ref={isCurrentVerse ? activeVerseRef : null}
                    className={`mb-6 text-lg md:text-xl font-serif leading-relaxed ${
                      isCurrentVerse ? "text-zinc-100" : "text-zinc-500"
                    }`}
                  >
                    <span className="text-xs text-rose-500/50 font-sans mr-3 select-none font-bold align-top mt-1 inline-block">
                      {vNum}
                    </span>
                    
                    {vWords.map(({ word: w, index: globalIndex }, i) => {
                      const isActive = currentWord && w === currentWord;
                      
                      return (
                        <span 
                          key={`${vNum}-${i}`} 
                          className="inline-block mr-1.5 cursor-pointer hover:text-zinc-300 transition-colors"
                          onClick={() => onWordClick(globalIndex)}
                        >
                          {isActive ? (
                            <motion.span
                              layoutId="active-word"
                              className="text-rose-500 font-medium relative block"
                              transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            >
                              {w.text}
                            </motion.span>
                          ) : (
                            <span>{w.text}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          // --- RSVP VIEW ---
          <motion.div
            key="rsvp-mode"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center w-full h-64 md:h-96 relative z-10"
          >
            {/* Optical Guide Line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 md:h-20 w-px bg-gradient-to-b from-transparent via-rose-500/20 to-transparent mx-auto z-0" />

            {/* Word Display Area */}
            <div className="relative h-40 w-full flex items-center justify-center mb-8">
              <AnimatePresence mode="wait">
                {currentWord ? (
                  <RSVPWordDisplay 
                    key="word-display" 
                    wordData={currentWord} 
                    layoutId="active-word" 
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <RefreshCw className="w-8 h-8 text-zinc-700 animate-spin-slow" />
                    <span className="text-zinc-600 font-mono text-sm tracking-widest uppercase">
                      End of Chapter
                    </span>
                    <button onClick={onRestart} className="text-xs text-rose-500 hover:underline">
                      Restart
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <ProgressBar
              progress={progress}
              wordIndex={wordIndex}
              totalWords={words.length}
              onSeek={onSeek}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
