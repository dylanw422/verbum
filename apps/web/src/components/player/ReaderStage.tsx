import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import type { WordData } from "./types";

import { ProgressBar } from "./ProgressBar";
import { RSVPWordDisplay } from "./RSVPWordDisplay";
import { MagicalTransition } from "./MagicalTransition";
import { TextSelectionMenu } from "./TextSelectionMenu";

interface ReaderStageProps {
  words: WordData[];
  wordIndex: number;
  readingMode: boolean;
  playing: boolean;
  chapterData?: any;
  savedHighlights?: Array<{ _id: string; indices: number[] }>;
  book: string;
  chapter: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRestart: () => void;
  onWordClick: (index: number) => void;
  onAction?: (action: string, data: any) => void;
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
  onAction,
  savedHighlights = [],
  book,
  chapter,
}: ReaderStageProps) {
  const progress = words.length ? (wordIndex / words.length) * 100 : 0;
  const currentWord = words[wordIndex];
  
  // Ref for auto-scrolling to active verse in Reading Mode
  const activeVerseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Selection State
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [menuOrientation, setMenuOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [selectedContext, setSelectedContext] = useState<{ text: string; verse: string; indices: number[] } | null>(null);
  const [optimisticHighlights, setOptimisticHighlights] = useState<Record<number, boolean>>({});
  
  // Verse Selection State (Replacing Drag Selection)
  const [selectedVerses, setSelectedVerses] = useState<Set<string>>(new Set());

  const [matchingHighlightId, setMatchingHighlightId] = useState<string | null>(null);
  const [removedHighlightIds, setRemovedHighlightIds] = useState<Set<string>>(new Set());

  // Reset optimistic state when chapter changes
  useEffect(() => {
    setOptimisticHighlights({});
    setRemovedHighlightIds(new Set());
    setSelectedVerses(new Set());
    setMenuPosition(null);
  }, [words[0]?.verse]); 

  // Derived highlights map (Optimistic + Saved)
  const highlights = useMemo(() => {
    const map = { ...optimisticHighlights };
    
    savedHighlights.forEach(h => {
        if (!removedHighlightIds.has(h._id)) {
            h.indices.forEach(i => map[i] = true);
        }
    });
    return map;
  }, [optimisticHighlights, savedHighlights, removedHighlightIds]);

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

  // Derived Live Selection (All indices of selected verses)
  const liveSelection = useMemo(() => {
      const indices = new Set<number>();
      selectedVerses.forEach(vNum => {
          verses[vNum]?.forEach(item => indices.add(item.index));
      });
      return indices;
  }, [selectedVerses, verses]);

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


  // --- Verse Selection Logic ---
  const handleVerseClick = useCallback((vNum: string) => {
      const newSet = new Set(selectedVerses);
      if (newSet.has(vNum)) {
          newSet.delete(vNum);
      } else {
          newSet.add(vNum);
      }
      setSelectedVerses(newSet);

      // Clear menu if empty
      if (newSet.size === 0) {
          setMenuPosition(null);
          setMatchingHighlightId(null);
          return;
      }

      // -- Calculate Context & Menu Position --
      
      // 1. Sort verses numerically
      const sortedVerses = Array.from(newSet).sort((a, b) => parseInt(a) - parseInt(b));
      
      // 2. Build Text & Indices
      let fullText = "";
      let fullIndices: number[] = [];
      
      sortedVerses.forEach((v, i) => {
          const vWords = verses[v];
          if (!vWords) return;
          
          const vText = vWords.map(vw => vw.word.text).join(" ");
          if (i > 0) fullText += "\n\n"; // Gap between verses
          fullText += vText;
          
          vWords.forEach(vw => fullIndices.push(vw.index));
      });

      // 3. Check for Highlights (Exact match of ANY selected verse? Or the whole block?)
      // Current logic: Exact match of indices.
      const selectedSet = new Set(fullIndices);
      const existing = savedHighlights.find(h => {
          if (h.indices.length !== fullIndices.length) return false;
          return h.indices.every(i => selectedSet.has(i));
      });
      setMatchingHighlightId(existing?._id || null);

      // 4. Position Menu
      // Always position below the last (highest numbered) selected verse.
      const targetVerse = sortedVerses[sortedVerses.length - 1];
      
      if (containerRef.current && targetVerse) {
          // Find the verse number span specifically for positioning
          const node = containerRef.current.querySelector(`[data-verse-click-id="${targetVerse}"]`);
          
          if (node) {
              const rect = node.getBoundingClientRect();
              const isMobile = window.innerWidth < 768; // MD breakpoint
              
              let newPos;
              if (isMobile) {
                  newPos = {
                      x: rect.left, // Left aligned with verse number
                      y: rect.top - 10, // Above the verse number
                  };
                  setMenuOrientation("horizontal");
              } else {
                  newPos = {
                      x: rect.left - 50, // To the left of the verse number
                      y: rect.top + rect.height / 2, // Centered vertically on the verse number
                  };
                  setMenuOrientation("vertical");
              }
              setMenuPosition(newPos);
          }
      }

      setSelectedContext({
          text: fullText,
          verse: sortedVerses.join(", "), 
          indices: fullIndices
      });

  }, [selectedVerses, verses, savedHighlights]);


  // Close menu on click elsewhere
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('[role="dialog"]')) return;
        
        // Check if click is on a verse number or word
        const target = e.target as HTMLElement;
        if (target.closest('[data-verse-click]')) return; // Identifier for our clickables

        // If clicking background, clear selection
        // But we want to allow clicking multiple verses.
        // So only clear if clicking *outside* the reader stage entirely?
        // Or if clicking on empty space in reader stage?
        // Let's say: Click on empty space = Clear.
        // Click on Verse Num = Toggle.
        
        if (!target.closest('.cursor-pointer')) {
             setSelectedVerses(new Set());
             setMenuPosition(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuAction = (action: "highlight" | "remove_highlight" | "note" | "concordance" | "copy" | "share") => {
    if (!selectedContext) return;

    switch (action) {
      case "highlight":
        // Optimistic update
        const newHighlights = { ...optimisticHighlights };
        selectedContext.indices.forEach(i => newHighlights[i] = true);
        setOptimisticHighlights(newHighlights);
        
        if (onAction) {
            // We need to pass the *first* verse as the canonical one? 
            // Or change the API to accept multi-verse highlights?
            // `createHighlight` takes `verse: string`. We can pass "1-3".
            // Let's calculate the range string.
            const sortedIndices = selectedContext.indices.sort((a,b) => a-b);
            const startVerse = words[sortedIndices[0]].verse;
            const endVerse = words[sortedIndices[sortedIndices.length-1]].verse;
            const range = startVerse === endVerse ? startVerse : `${startVerse}-${endVerse}`;
            
            onAction("highlight", { ...selectedContext, verse: range });
        } else {
            toast.success("Highlight saved (Local)");
        }
        
        setMenuPosition(null);
        setSelectedVerses(new Set());
        break;
      
      case "remove_highlight":
        if (matchingHighlightId && onAction) {
            onAction("remove_highlight", { id: matchingHighlightId });
            setRemovedHighlightIds(prev => new Set([...prev, matchingHighlightId]));
            const updatedOptimistic = { ...optimisticHighlights };
            selectedContext.indices.forEach(i => delete updatedOptimistic[i]);
            setOptimisticHighlights(updatedOptimistic);
            toast.success("Highlight removed");
        }
        setMenuPosition(null);
        setSelectedVerses(new Set());
        break;

      case "copy":
        // Logic to format "1, 3, 5" or "1-5"
        // We can just use the `selectedVerses` set
        const sortedV = Array.from(selectedVerses).sort((a,b) => parseInt(a)-parseInt(b));
        // Simple range formatter
        let refStr = "";
        if (sortedV.length > 0) {
            refStr = sortedV[0];
            let inRange = false;
            for (let i = 1; i < sortedV.length; i++) {
                const prev = parseInt(sortedV[i-1]);
                const curr = parseInt(sortedV[i]);
                if (curr === prev + 1) {
                    inRange = true;
                } else {
                    if (inRange) refStr += `-${prev}`; // Close previous range
                    refStr += `, ${curr}`;
                    inRange = false;
                }
            }
            if (inRange) refStr += `-${sortedV[sortedV.length-1]}`;
        }

        const displayBook = book.charAt(0).toUpperCase() + book.slice(1);
        const reference = `${displayBook} ${chapter}:${refStr}`;

        const copyText = `"${selectedContext.text}"\n\n${reference}`;
        navigator.clipboard.writeText(copyText);
        toast.success("Copied to clipboard");
        setMenuPosition(null);
        setSelectedVerses(new Set());
        break;

      case "concordance":
        toast.info(`Searching for: ${selectedContext.text}`);
        if (onAction) onAction("concordance", selectedContext.text);
        setMenuPosition(null);
        setSelectedVerses(new Set());
        break;
      case "note":
        toast.info("Note created (placeholder)");
        setMenuPosition(null);
        break;
      case "share":
        if (onAction) {
             // Use same ref logic as Copy
            const sortedV = Array.from(selectedVerses).sort((a,b) => parseInt(a)-parseInt(b));
            let refStr = "";
            if (sortedV.length > 0) {
                refStr = sortedV[0];
                let inRange = false;
                for (let i = 1; i < sortedV.length; i++) {
                    const prev = parseInt(sortedV[i-1]);
                    const curr = parseInt(sortedV[i]);
                    if (curr === prev + 1) {
                        inRange = true;
                    } else {
                        if (inRange) refStr += `-${prev}`;
                        refStr += `, ${curr}`;
                        inRange = false;
                    }
                }
                if (inRange) refStr += `-${sortedV[sortedV.length-1]}`;
            }
            const displayBook = book.charAt(0).toUpperCase() + book.slice(1);
            const reference = `${displayBook} ${chapter}:${refStr}`;
            
            onAction("share", { text: selectedContext.text, indices: selectedContext.indices, referenceOverride: reference });
        }
        setMenuPosition(null);
        setSelectedVerses(new Set());
        break;
    }
  };


  return (
    <div className="relative z-30 flex flex-col items-center justify-center w-full max-w-5xl h-full md:h-auto">
      
      {/* Magical Transition Overlay */}
      <MagicalTransition readingMode={readingMode} />

      {/* Floating Menu */}
      <AnimatePresence>
        {menuPosition && (
          <TextSelectionMenu 
            position={menuPosition} 
            onAction={handleMenuAction} 
            onClose={() => setMenuPosition(null)}
            isHighlightActive={!!matchingHighlightId}
            orientation={menuOrientation}
          />
        )}
      </AnimatePresence>

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
            className="w-full h-[60vh] md:h-[70vh] overflow-y-auto px-6 py-12 scrollbar-hide mask-image-edges bg-zinc-950/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-2xl relative z-20 selection:bg-transparent select-none"
            ref={containerRef}
          >
            <div className="max-w-2xl mx-auto pb-20">
              {Object.entries(verses).map(([vNum, vWords]) => {
                const isCurrentVerse = currentWord && currentWord.verse === vNum;
                const isVerseSelected = selectedVerses.has(vNum);
                
                return (
                  <div
                    key={vNum}
                    ref={isCurrentVerse ? activeVerseRef : null}
                    className={`mb-6 text-lg md:text-xl font-serif leading-relaxed ${
                      isCurrentVerse ? "text-zinc-100" : "text-zinc-500"
                    }`}
                  >
                    <span 
                        data-verse-click="true"
                        data-verse-click-id={vNum}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVerseClick(vNum);
                        }}
                        className={`text-xs font-sans mr-3 select-none font-bold align-top mt-1 inline-block cursor-pointer transition-colors ${
                            isVerseSelected ? "text-rose-500 scale-110" : "text-rose-500/50 hover:text-rose-400"
                        }`}
                    >
                      {vNum}
                    </span>
                    
                    {vWords.map(({ word: w, index: globalIndex }, i) => {
                      const isActive = currentWord && w === currentWord;
                      const isHighlighted = highlights[globalIndex];
                      const isSelected = liveSelection.has(globalIndex);
                      
                      // Neighbor checks for rounding logic (primarily for saved highlights)
                      const prevWord = words[globalIndex - 1];
                      const nextWord = words[globalIndex + 1];
                      const isSameVersePrev = prevWord?.verse === w.verse;
                      const isSameVerseNext = nextWord?.verse === w.verse;

                      let bgClass = "";
                      let roundedClass = "rounded-none";

                      if (isSelected) {
                        bgClass = "underline decoration-dotted decoration-rose-500/60 underline-offset-4 text-rose-100";
                      } else if (isHighlighted) {
                        bgClass = "bg-rose-500/20 text-rose-200";
                        roundedClass = "rounded-sm";
                        const prevConnected = isSameVersePrev && highlights[globalIndex - 1];
                        const nextConnected = isSameVerseNext && highlights[globalIndex + 1];

                        if (prevConnected && nextConnected) roundedClass = "rounded-none";
                        else if (prevConnected) roundedClass = "rounded-l-none rounded-r-sm";
                        else if (nextConnected) roundedClass = "rounded-r-none rounded-l-sm";
                      }

                      return (
                        <span 
                          key={`${vNum}-${i}`} 
                          data-word-index={globalIndex}
                          data-verse={vNum}
                          className={`inline decoration-clone py-0.5 cursor-pointer hover:text-zinc-300 transition-colors ${roundedClass} ${bgClass}`}
                          onClick={() => onWordClick(globalIndex)}
                        >
                          {isActive ? (
                            <motion.span
                              layoutId="active-word"
                              className="text-rose-500 font-medium relative inline-block"
                              transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            >
                              {w.text}
                            </motion.span>
                          ) : (
                            <span>{w.text}</span>
                          )}
                          {" "}
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
                    <button onClick={onRestart} className="text-xs text-rose-500 hover:underline hover:cursor-pointer">
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
