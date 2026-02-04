import { useState, useMemo, useEffect, useRef } from "react";
import { Loader2, BookOpen, ChevronDown, PanelRightClose, PanelRightOpen, Check } from "lucide-react";
import { useLibrary } from "@/hooks/use-library";
import { useOriginalLanguage } from "@/hooks/use-original-language";
import { LexiconCard } from "./lexicon-card";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { OT_BOOKS, NT_BOOKS } from "@/lib/constants";

interface InterlinearToolProps {
  initialBook: string;
  initialChapter: number;
}

interface InterlinearWord {
  i: number;
  text: string;
  word: string;
  number: string;
}

interface InterlinearVerse {
  verse: InterlinearWord[];
  id: string;
}

function ScrollAnchor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Small timeout to ensure the menu is mounted and layout is ready
    const timer = setTimeout(() => {
      ref.current?.scrollIntoView({ block: "center" });
    }, 50);
    return () => clearTimeout(timer);
  }, []);
  return <div ref={ref} className="absolute" />;
}

export function InterlinearTool({ initialBook, initialChapter }: InterlinearToolProps) {
  const [book, setBook] = useState(initialBook);
  const [chapter, setChapter] = useState(initialChapter);
  // selectedWord now stores the Strong's number directly
  const [selectedWord, setSelectedWord] = useState<{ text: string; word: string; number: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pronunciationMode, setPronunciationMode] = useState<"koine" | "classical">("koine");
  
  // Data Fetching
  const { isLoading: isLibLoading, availableChapters } = useLibrary(book);
  const { dictionary, isLoading: isDictLoading, isOT } = useOriginalLanguage(book);
  
  const [interlinearVerses, setInterlinearVerses] = useState<InterlinearVerse[]>([]);
  const [isTextLoading, setIsTextLoading] = useState(false);

  useEffect(() => {
    async function fetchInterlinear() {
      setIsTextLoading(true);
      try {
        const res = await fetch(`/api/interlinear?book=${encodeURIComponent(book)}&chapter=${chapter}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        // The API returns an array of verses or empty array
        setInterlinearVerses(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load interlinear text", e);
        setInterlinearVerses([]);
      } finally {
        setIsTextLoading(false);
      }
    }
    fetchInterlinear();
  }, [book, chapter]);

  // Identify Strong's Entry for Selected Word
  const selectedEntryData = useMemo(() => {
    if (!selectedWord || !dictionary) return null;
    
    // Normalize Strong's number to match dictionary keys (usually uppercase + number)
    // interlinear.json has "h7225", dictionary might have "H7225"
    const number = selectedWord.number;
    const cleanNumber = number.replace(/[^a-zA-Z0-9]/g, '');
    
    // Try explicit lookup
    let entry = dictionary[cleanNumber];
    if (!entry) {
        // Try uppercase
        entry = dictionary[cleanNumber.toUpperCase()];
    }
    if (!entry) {
        // Try lowercase
        entry = dictionary[cleanNumber.toLowerCase()];
    }

    if (entry) {
        return {
            entry: entry,
            id: cleanNumber.toUpperCase() // Display standard format
        };
    }
    
    return null;
  }, [selectedWord, dictionary]);

  const getPronunciation = (word: InterlinearWord) => {
    if (!dictionary) return null;
    const cleanNumber = word.number.replace(/[^a-zA-Z0-9]/g, "");
    const entry =
      dictionary[cleanNumber] ||
      dictionary[cleanNumber.toUpperCase()] ||
      dictionary[cleanNumber.toLowerCase()];
    if (!entry) return null;
    const base = isOT
      ? entry.xlit || entry.pron || entry.translit
      : entry.translit || entry.pron || entry.xlit;
    if (!base) return null;
    const normalized = base.toLowerCase();
    if (isOT || pronunciationMode === "classical") {
      return normalized;
    }
    return applyKoinePronunciation(normalized);
  };

  const applyKoinePronunciation = (value: string) => {
    return value
      .replace(/ph/g, "f")
      .replace(/ch/g, "kh")
      .replace(/ei/g, "ee")
      .replace(/ou/g, "oo")
      .replace(/b/g, "v");
  };

  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => {
        const isDesk = window.innerWidth >= 768;
        setIsDesktop(isDesk);
        if (!isDesk) setIsSidebarOpen(false); // Default close on mobile
        else setIsSidebarOpen(true);
    };
    // Initial check
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Open sidebar when a word is selected
  useEffect(() => {
      if (selectedWord) {
          setIsSidebarOpen(true);
      }
  }, [selectedWord]);

  const isLoading = isLibLoading || isDictLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <div className="text-center">
            <p className="font-medium text-zinc-300">Loading Resources</p>
            <p className="text-xs text-zinc-500 mt-1">Fetching {isOT ? "Hebrew" : "Greek"} lexicon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden relative">
      {/* Left Column: Text Reader */}
      <div className="flex-1 flex flex-col min-h-0 md:border-r border-zinc-800 bg-zinc-950/30">
        {/* Toolbar */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2 md:gap-4">
                 {/* Sidebar Toggle (Moved to Left) */}
                 <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`
                        p-2 transition-colors rounded-lg hover:bg-zinc-800/50
                        ${isSidebarOpen ? "text-rose-500" : "text-zinc-500"}
                    `}
                    title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                >
                    {isSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                </button>

                <div className="h-4 w-px bg-zinc-800 hidden sm:block mx-1" />

                {/* Navigation Controls */}
                <div className="flex items-center gap-2">
                    {/* Book Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/50 rounded-lg transition-colors outline-none group text-left">
                             <BookOpen className="w-4 h-4 text-rose-500 group-hover:text-rose-400" />
                             <span className="text-sm font-bold text-zinc-200 group-hover:text-white tracking-wide">{book}</span>
                             <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="max-h-[60vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                             <DropdownMenuGroup>
                                <DropdownMenuLabel>Old Testament</DropdownMenuLabel>
                                {OT_BOOKS.map(b => (
                                    <DropdownMenuItem 
                                        key={b} 
                                        onClick={() => { setBook(b); setChapter(1); }}
                                        className={book === b ? "bg-rose-500/10 text-rose-500" : ""}
                                    >
                                        {book === b && <ScrollAnchor />}
                                        {b}
                                        {book === b && <Check className="w-3 h-3 ml-auto" />}
                                    </DropdownMenuItem>
                                ))}
                             </DropdownMenuGroup>
                             <DropdownMenuSeparator />
                             <DropdownMenuGroup>
                                <DropdownMenuLabel>New Testament</DropdownMenuLabel>
                                {NT_BOOKS.map(b => (
                                    <DropdownMenuItem 
                                        key={b} 
                                        onClick={() => { setBook(b); setChapter(1); }}
                                        className={book === b ? "bg-rose-500/10 text-rose-500" : ""}
                                    >
                                        {book === b && <ScrollAnchor />}
                                        {b}
                                        {book === b && <Check className="w-3 h-3 ml-auto" />}
                                    </DropdownMenuItem>
                                ))}
                             </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Chapter Selector */}
                    <DropdownMenu>
                         <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/50 rounded-lg transition-colors outline-none group text-left">
                             <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">Ch. {chapter}</span>
                             <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-400" />
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="start" className="w-64 p-2 bg-zinc-900 border-zinc-800">
                            <div className="grid grid-cols-5 gap-1 max-h-[50vh] overflow-y-auto custom-scrollbar">
                                {availableChapters.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setChapter(c)}
                                        className={`
                                            p-2 text-xs font-mono rounded hover:bg-zinc-800 transition-colors relative
                                            ${chapter === c ? "bg-rose-500 text-white hover:bg-rose-600" : "text-zinc-400"}
                                        `}
                                    >
                                        {chapter === c && <ScrollAnchor />}
                                        {c}
                                    </button>
                                ))}
                            </div>
                         </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </div>

            {!isOT && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400">
                  {pronunciationMode === "koine" ? "Koine" : "Classical"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPronunciationMode(
                      pronunciationMode === "koine" ? "classical" : "koine"
                    )
                  }
                  className="relative inline-flex h-5 w-10 items-center rounded-full border border-zinc-800 bg-zinc-900/50 transition-colors hover:cursor-pointer"
                  aria-label="Toggle pronunciation mode"
                >
                  <span
                    className={`absolute left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      pronunciationMode === "koine" ? "translate-x-0" : "translate-x-5"
                    }`}
                  />
                </button>
              </div>
            )}
        </div>

        {/* Text Content */}
        <div className="flex-1 overflow-y-auto pt-6 pb-6 pr-6 pl-3 md:pt-12 md:pb-12 md:pr-12 md:pl-6 scroll-smooth">
            <div className={`max-w-3xl mx-auto transition-all duration-300 ${!isSidebarOpen ? 'max-w-4xl' : ''}`}>
                {isTextLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-700" />
                    </div>
                ) : interlinearVerses.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500">
                        <p>No text available for this chapter.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {interlinearVerses.map((v) => {
                            const verseNum = parseInt(v.id.slice(5), 10);
                            return (
                                <div key={v.id} className="flex gap-2">
                                    <div className="w-8 shrink-0 pt-1 text-right">
                                        <span className="text-xs font-mono text-zinc-600 select-none">{verseNum}</span>
                                    </div>
                                    <div className="flex-1 flex flex-wrap gap-x-2 gap-y-4">
                                        {v.verse.map((w, i) => {
                                            const isSelected = selectedWord?.number === w.number;
                                            const pronunciation = getPronunciation(w);
                                            return (
                                                <div 
                                                    key={i}
                                                    onClick={() => setSelectedWord(w)}
                                                    className={`
                                                        flex flex-col items-center cursor-pointer rounded px-1.5 py-1 transition-all group
                                                        ${isSelected 
                                                            ? "bg-rose-500/20 ring-1 ring-rose-500/30" 
                                                            : "hover:bg-zinc-800/50"
                                                        }
                                                    `}
                                                >
                                                    <span className={`text-base font-serif leading-none mb-1 ${isSelected ? "text-rose-200" : "text-zinc-200"}`}>
                                                        {w.text}
                                                    </span>
                                                    <span className={`text-sm font-sans text-zinc-500 leading-none ${isSelected ? "text-rose-400" : "group-hover:text-zinc-400"}`}>
                                                        {w.word}
                                                    </span>
                                                    {pronunciation && (
                                                      <span className="text-sm font-mono tracking-tight text-zinc-600 leading-none mt-2 lowercase">
                                                        {pronunciation}
                                                      </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="h-20" /> {/* Bottom padding */}
        </div>
      </div>

      {/* Desktop Sidebar (Animated Width) */}
      <motion.div
        className="hidden md:block overflow-hidden bg-zinc-950 border-l border-zinc-800 flex-shrink-0"
        initial={false}
        animate={{ 
            width: isSidebarOpen ? 384 : 0,
            opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      >
        <div className="w-96 h-full">
            <LexiconCard 
                word={selectedWord?.word || ""} // Original word
                entry={selectedEntryData?.entry || null}
                strongsNumber={selectedEntryData?.id || selectedWord?.number || null}
                onClose={() => setSelectedWord(null)}
                isOT={isOT}
            />
        </div>
      </motion.div>

       {/* Mobile Overlay */}
       <AnimatePresence>
        {(!isDesktop && isSidebarOpen) && (
            <div className="fixed inset-0 z-40 md:hidden">
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                    onClick={() => { setIsSidebarOpen(false); setSelectedWord(null); }}
                />
                
                <motion.div 
                    className="absolute right-0 top-0 bottom-0 w-full md:w-full md:relative h-full"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <LexiconCard 
                        word={selectedWord?.word || ""}
                        entry={selectedEntryData?.entry || null}
                        strongsNumber={selectedEntryData?.id || selectedWord?.number || null}
                        onClose={() => { setSelectedWord(null); setIsSidebarOpen(false); }}
                        isOT={isOT}
                    />
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
