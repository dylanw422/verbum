import { useState, useMemo, useEffect } from "react";
import { Loader2, BookOpen, ChevronDown, PanelRightClose, PanelRightOpen, Check } from "lucide-react";
import { useLibrary } from "@/hooks/use-library";
import { useOriginalLanguage } from "@/hooks/use-original-language";
import { LexiconCard } from "./lexicon-card";
import { tokenizeToData } from "@/components/player/utils";
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

export function InterlinearTool({ initialBook, initialChapter }: InterlinearToolProps) {
  const [book, setBook] = useState(initialBook);
  const [chapter, setChapter] = useState(initialChapter);
  const [selectedWord, setSelectedWord] = useState<{ text: string; id: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Data Fetching
  const { library, isLoading: isLibLoading, availableChapters } = useLibrary(book);
  const { dictionary, isLoading: isDictLoading, isOT } = useOriginalLanguage(book);

  // Reverse Index for "Fake" Interlinear Mapping
  const reverseIndex = useMemo(() => {
    if (!dictionary) return new Map<string, string[]>();
    
    const index = new Map<string, string[]>();
    const commonWords = new Set(["the", "and", "of", "to", "in", "a", "that", "is", "for", "it", "he", "was"]);

    Object.entries(dictionary).forEach(([strongsId, entry]) => {
      // Split kjv_def by commas and clean up
      const defs = (entry.kjv_def || "")
        .split(/[,;]/)
        .map(d => d.trim().toLowerCase().replace(/[\(\)]/g, ''))
        .filter(d => d.length > 0);

      defs.forEach(def => {
        // Handle phrases? For now just simple single word matching or exact phrase match
        // We'll index by the whole definition phrase usually found in KJV
        if (!index.has(def)) {
            index.set(def, []);
        }
        index.get(def)?.push(strongsId);
        
        // Also index individual words if they are significant
        const words = def.split(" ");
        if (words.length > 1) {
            words.forEach(w => {
                if (commonWords.has(w)) return;
                if (!index.has(w)) index.set(w, []);
                index.get(w)?.push(strongsId);
            });
        }
      });
    });
    return index;
  }, [dictionary]);

  // Derived Chapter Text
  const chapterTextData = useMemo(() => {
    if (!library || !library[book] || !library[book][chapter.toString()]) return [];
    
    const chapterData = library[book][chapter.toString()];
    let text = "";
    
    if (typeof chapterData === "string") {
        text = chapterData;
    } else {
        // Combine verses
        Object.entries(chapterData)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .forEach(([_, vText]) => {
                text += vText + " ";
            });
    }
    
    return tokenizeToData(text, "1", 0);
  }, [library, book, chapter]);

  // Identify Strong's Entry for Selected Word
  const selectedEntryData = useMemo(() => {
    if (!selectedWord || !dictionary) return null;
    
    const clean = selectedWord.text.toLowerCase().replace(/[^a-z]/g, '');
    
    // 1. Try Exact Match in KJV Defs
    let ids = reverseIndex.get(clean);
    
    // 2. Fallback to generic simple search if not found
    if (!ids || ids.length === 0) {
        // simple stemming?
        if (clean.endsWith('s')) ids = reverseIndex.get(clean.slice(0, -1));
        else if (clean.endsWith('ed')) ids = reverseIndex.get(clean.slice(0, -2));
        else if (clean.endsWith('ing')) ids = reverseIndex.get(clean.slice(0, -3));
    }

    if (ids && ids.length > 0) {
        // Prefer lower numbers? Or just first.
        // For Hebrew/Greek distinction, assuming useOriginalLanguage handles fetching correct dict.
        // We just pick the first valid one for now.
        // Ideally we'd have context, but without mapping we guess.
        return {
            entry: dictionary[ids[0]],
            id: ids[0]
        };
    }
    
    return null;
  }, [selectedWord, reverseIndex, dictionary]);

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
                                            p-2 text-xs font-mono rounded hover:bg-zinc-800 transition-colors
                                            ${chapter === c ? "bg-rose-500 text-white hover:bg-rose-600" : "text-zinc-400"}
                                        `}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                         </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
            <div className={`max-w-3xl mx-auto text-lg md:text-xl leading-[2] text-zinc-300 font-serif selection:bg-rose-500/30 selection:text-rose-200 transition-all duration-300 ${!isSidebarOpen ? 'max-w-4xl' : ''}`}>
                {chapterTextData.map((wordObj) => {
                    const isSelected = selectedWord?.id === wordObj.id;
                    
                    return (
                        <span 
                            key={wordObj.id}
                            onClick={() => setSelectedWord({ text: wordObj.cleanText, id: wordObj.id })}
                            className={`
                                inline-block px-1 rounded-sm cursor-pointer transition-all duration-200 select-none mr-1 relative group
                                ${isSelected 
                                    ? "bg-rose-500/20 text-rose-300 font-medium" 
                                    : "hover:bg-zinc-800 hover:text-zinc-100 text-zinc-400"
                                }
                            `}
                        >
                            {wordObj.text}
                            {!isSelected && (
                                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </span>
                    );
                })}
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
                word={selectedWord?.text || ""}
                entry={selectedEntryData?.entry || null}
                strongsNumber={selectedEntryData?.id || null}
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
                        word={selectedWord?.text || ""}
                        entry={selectedEntryData?.entry || null}
                        strongsNumber={selectedEntryData?.id || null}
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
