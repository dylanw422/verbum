import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2, Info } from "lucide-react";
import { useLibrary } from "@/hooks/use-library";
import { useOriginalLanguage, type StrongsEntry, type StrongsDictionary } from "@/hooks/use-original-language";
import { LexiconCard } from "./lexicon-card";
import { tokenizeToData } from "@/components/player/utils";

interface InterlinearToolProps {
  initialBook: string;
  initialChapter: number;
}

export function InterlinearTool({ initialBook, initialChapter }: InterlinearToolProps) {
  const [book, setBook] = useState(initialBook);
  const [chapter, setChapter] = useState(initialChapter);
  const [selectedWord, setSelectedWord] = useState<{ text: string; id: string } | null>(null);
  
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

  const isLoading = isLibLoading || isDictLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-rose-500" />
        <p>Loading {isOT ? "Hebrew" : "Greek"} resources...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left Column: Text Reader */}
      <div className="flex-1 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-zinc-800">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-zinc-300">{book} {chapter}</span>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setChapter(c => Math.max(1, c - 1))}
                        disabled={chapter <= 1}
                        className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-zinc-100"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setChapter(c => {
                            // Check if next chapter exists
                            if (availableChapters.includes(c + 1)) return c + 1;
                            return c;
                        })}
                        disabled={!availableChapters.includes(chapter + 1)}
                        className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-zinc-100"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                <Info className="w-3 h-3" />
                <span>Click a word to analyze</span>
            </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-prose mx-auto text-lg md:text-xl leading-loose text-zinc-300 font-serif">
                {chapterTextData.map((wordObj) => {
                    const isSelected = selectedWord?.id === wordObj.id;
                    
                    return (
                        <span 
                            key={wordObj.id}
                            onClick={() => setSelectedWord({ text: wordObj.cleanText, id: wordObj.id })}
                            className={`
                                inline-block px-0.5 rounded cursor-pointer transition-colors duration-200 select-none mr-1.5
                                ${isSelected ? "bg-rose-500/20 text-rose-400" : "hover:bg-zinc-800 hover:text-zinc-100"}
                            `}
                        >
                            {wordObj.text}
                        </span>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Right Column: Lexicon */}
      <div className={`
        w-full md:w-80 flex-shrink-0 bg-zinc-950 border-l border-zinc-800
        ${selectedWord ? "block" : "hidden md:block"} 
        absolute md:relative inset-0 md:inset-auto z-20 md:z-auto
      `}>
        <LexiconCard 
            word={selectedWord?.text || ""}
            entry={selectedEntryData?.entry || null}
            strongsNumber={selectedEntryData?.id || null}
            onClose={() => setSelectedWord(null)}
            isOT={isOT}
        />
      </div>
    </div>
  );
}
