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
  const [selectedContext, setSelectedContext] = useState<{ text: string; verse: string; indices: number[] } | null>(null);
  const [optimisticHighlights, setOptimisticHighlights] = useState<Record<number, boolean>>({});
  const [liveSelection, setLiveSelection] = useState<Set<number>>(new Set());
  const [matchingHighlightId, setMatchingHighlightId] = useState<string | null>(null);
  const [removedHighlightIds, setRemovedHighlightIds] = useState<Set<string>>(new Set());

  // Reset optimistic state when chapter changes
  useEffect(() => {
    setOptimisticHighlights({});
    setRemovedHighlightIds(new Set());
  }, [words[0]?.verse]); // Using first word verse as a proxy for chapter change

  // Derived highlights map (Optimistic + Saved)
  const highlights = useMemo(() => {
    const map = { ...optimisticHighlights };
    
    savedHighlights.forEach(h => {
        // Only add if not optimistically removed
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

  // --- Real-time Selection Logic (Snap to Words) ---
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      // If no selection or collapsed, clear live selection
      // But ONLY if we are interacting with THIS container? 
      // Actually, if selection is elsewhere, `containsNode` will fail, which is fine.
      if (!selection || selection.isCollapsed) {
        setLiveSelection(new Set());
        return;
      }

      if (!containerRef.current) return;
      if (!containerRef.current.contains(selection.anchorNode)) {
          // Selection started outside
          return;
      }

      // Find all word spans in the container
      // Optimization: Could cache these spans if performance is an issue, but standard DOM query is usually ok.
      const wordSpans = Array.from(containerRef.current.querySelectorAll("span[data-word-index]"));
      
      // Filter to find which ones are selected
      const selectedIndices = new Set<number>();
      
      wordSpans.forEach(span => {
        if (selection.containsNode(span, true)) {
           const idx = parseInt(span.getAttribute("data-word-index") || "-1");
           if (idx !== -1) selectedIndices.add(idx);
        }
      });

      setLiveSelection(selectedIndices);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  // --- Finalize Selection (Menu) ---
  const handleSelectionEnd = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || liveSelection.size === 0) {
      setMenuPosition(null);
      setMatchingHighlightId(null);
      return;
    }

    // Calculate indices from live selection
    const indices = Array.from(liveSelection).sort((a, b) => a - b);
    if (indices.length === 0) return;

    const start = indices[0];
    const end = indices[indices.length - 1];
    
    // Fill gaps if any (though UI might show gaps, logically we usually want a block)
    // For now, let's trust the user selection or fill it? 
    // Standard text selection fills gaps. Let's fill.
    const fullIndices = [];
    for (let i = start; i <= end; i++) fullIndices.push(i);

    // Update Live Selection to be "Solid" block for visual consistency
    setLiveSelection(new Set(fullIndices));

    // Get text
    const selectedText = words.slice(start, end + 1).map(w => w.text).join(" ");

    // Check for EXACT match with existing highlights
    // We compare JSON stringified arrays for simplicity (since they are sorted integers)
    // Or set comparison
    const selectedSet = new Set(fullIndices);
    const existing = savedHighlights.find(h => {
        if (h.indices.length !== fullIndices.length) return false;
        return h.indices.every(i => selectedSet.has(i));
    });

    setMatchingHighlightId(existing?._id || null);

    // Calculate Menu Position
    // We try to use the bounding rect of the visual selection
    // Since native selection might be partial, let's use the first and last word elements
    if (!containerRef.current) return;
    
    const startNode = containerRef.current.querySelector(`span[data-word-index="${start}"]`);
    const endNode = containerRef.current.querySelector(`span[data-word-index="${end}"]`);
    
    if (startNode && endNode) {
        const startRect = startNode.getBoundingClientRect();
        const endRect = endNode.getBoundingClientRect();
        
        // Center of the top line usually, or center of the block? 
        // Let's go with: Horizontal center of the combined rect, Top of the first line.
        // Actually, simple average is often safest for multi-line.
        // Or just use the native selection rect as a proxy for position.
        const rangeRect = selection.getRangeAt(0).getBoundingClientRect();
        
        const newPos = {
          x: rangeRect.left + rangeRect.width / 2,
          y: rangeRect.top - 10,
        };
        setMenuPosition(newPos);
    }

    setSelectedContext({
      text: selectedText, 
      verse: words[start].verse, 
      indices: fullIndices
    });

  }, [liveSelection, words, savedHighlights]);

  // Close menu on click elsewhere (handled by blur/click listeners usually, but specific logic here)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        // If clicking inside the menu, don't close
        if ((e.target as HTMLElement).closest('[role="dialog"]')) return; // approximation
        
        // If selection is cleared, close
        if (window.getSelection()?.isCollapsed) {
            setMenuPosition(null);
            setLiveSelection(new Set()); // Clear visual selection too
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
            onAction("highlight", selectedContext);
        } else {
            toast.success("Highlight saved (Local)");
        }
        
        setMenuPosition(null);
        setLiveSelection(new Set());
        window.getSelection()?.removeAllRanges();
        break;
      
      case "remove_highlight":
        if (matchingHighlightId && onAction) {
            onAction("remove_highlight", { id: matchingHighlightId });
            
            // Optimistic removal
            setRemovedHighlightIds(prev => new Set([...prev, matchingHighlightId]));
            
            // Also clear these indices from optimistic highlights if they were there
            const updatedOptimistic = { ...optimisticHighlights };
            selectedContext.indices.forEach(i => delete updatedOptimistic[i]);
            setOptimisticHighlights(updatedOptimistic);

            toast.success("Highlight removed");
        }
        setMenuPosition(null);
        setLiveSelection(new Set());
        window.getSelection()?.removeAllRanges();
        break;

      case "copy":
        const startIdx = selectedContext.indices[0];
        const endIdx = selectedContext.indices[selectedContext.indices.length - 1];
        const startVerse = words[startIdx]?.verse;
        const endVerse = words[endIdx]?.verse;
        
        // Capitalize book for display
        const displayBook = book.charAt(0).toUpperCase() + book.slice(1);
        
        let reference = `${displayBook} ${chapter}:${startVerse}`;
        if (startVerse && endVerse && startVerse !== endVerse) {
            reference += `-${endVerse}`;
        }

        const copyText = `"${selectedContext.text}"\n\n${reference}`;
        navigator.clipboard.writeText(copyText);
        toast.success("Copied to clipboard");
        setMenuPosition(null);
        setLiveSelection(new Set());
        window.getSelection()?.removeAllRanges();
        break;
      case "concordance":
        toast.info(`Searching for: ${selectedContext.text}`);
        if (onAction) onAction("concordance", selectedContext.text);
        setMenuPosition(null);
        setLiveSelection(new Set()); // Maybe keep selection?
        // window.getSelection()?.removeAllRanges();
        break;
      case "note":
        toast.info("Note created (placeholder)");
        setMenuPosition(null);
        break;
      case "share":
        if (onAction) {
            onAction("share", selectedContext);
        } else {
            // fallback
            if (navigator.share) {
                navigator.share({ text: selectedContext.text }).catch(() => {});
            } else {
                toast.info("Share menu opened");
            }
        }
        setMenuPosition(null);
        setLiveSelection(new Set());
        window.getSelection()?.removeAllRanges();
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
            className="w-full h-[60vh] md:h-[70vh] overflow-y-auto px-6 py-12 scrollbar-hide mask-image-edges bg-zinc-950/50 backdrop-blur-sm rounded-xl border border-white/5 shadow-2xl relative z-20 selection:bg-transparent"
            ref={containerRef}
            onMouseUp={handleSelectionEnd}
            onTouchEnd={handleSelectionEnd} // Basic mobile support
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
                      const isHighlighted = highlights[globalIndex];
                      const isSelected = liveSelection.has(globalIndex);
                      
                      // Neighbor checks for rounding logic
                      const prevWord = words[globalIndex - 1];
                      const nextWord = words[globalIndex + 1];
                      const isSameVersePrev = prevWord?.verse === w.verse;
                      const isSameVerseNext = nextWord?.verse === w.verse;

                      let bgClass = "";
                      let roundedClass = "rounded-sm";

                      if (isSelected) {
                        bgClass = "bg-rose-500/40 text-rose-100";
                        const prevConnected = isSameVersePrev && liveSelection.has(globalIndex - 1);
                        const nextConnected = isSameVerseNext && liveSelection.has(globalIndex + 1);

                        if (prevConnected && nextConnected) roundedClass = "rounded-none";
                        else if (prevConnected) roundedClass = "rounded-l-none rounded-r-sm";
                        else if (nextConnected) roundedClass = "rounded-r-none rounded-l-sm";
                      } else if (isHighlighted) {
                        bgClass = "bg-rose-500/20 text-rose-200";
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
                          className={`inline-block pr-1.5 py-0.5 cursor-pointer hover:text-zinc-300 transition-colors ${roundedClass} ${bgClass}`}
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
