"use client";

import { useState, useEffect } from "react";
import { Search, Filter, BookOpen, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { motion, AnimatePresence } from "framer-motion";
import { BOOKS } from "@/lib/constants";
import { VerseAnalysis } from "./verse-analysis";

interface SearchResult {
  b: string;
  c: number;
  v: number;
  t: string;
}

interface SearchResponse {
  count: number;
  results: SearchResult[];
  distribution: Record<string, number>;
}

interface ConcordanceToolProps {
  initialQuery?: string;
}

export function ConcordanceTool({ initialQuery = "" }: ConcordanceToolProps) {
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<"all" | "ot" | "nt">("all");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{b: string, c: number, v: number} | null>(null);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length < 2) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&scope=${scope}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error(error);
        setResults({ count: 0, results: [], distribution: {} });
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [debouncedQuery, scope]);

  const scrollToBook = (book: string) => {
    if (!results) return;
    const index = results.results.findIndex(r => r.b === book);
    if (index !== -1) {
      const element = document.getElementById(`result-${index}`);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 relative overflow-hidden">
      <AnimatePresence>
        {selectedVerse && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute inset-0 z-30 bg-zinc-950"
          >
             <VerseAnalysis 
                book={selectedVerse.b} 
                chapter={selectedVerse.c} 
                verse={selectedVerse.v} 
                onBack={() => setSelectedVerse(null)} 
             />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Search Input */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
        <div className="relative mb-4 mr-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for words, phrases, or references..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <FilterChip 
            label="All Books" 
            active={scope === "all"} 
            onClick={() => setScope("all")} 
          />
          <FilterChip 
            label="Old Testament" 
            active={scope === "ot"} 
            onClick={() => setScope("ot")} 
          />
          <FilterChip 
            label="New Testament" 
            active={scope === "nt"} 
            onClick={() => setScope("nt")} 
          />
        </div>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-0">
        {!results && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-zinc-400">Search the Library</p>
            <p className="text-sm max-w-sm mt-2">
              Enter keywords, phrases, or Strong's numbers (e.g. "Grace", "G5485") to begin your study.
            </p>
          </div>
        )}

        {results && results.results.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
            <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-zinc-400">No results found</p>
            <p className="text-sm mt-2">Try adjusting your search terms or filters.</p>
          </div>
        )}

        {results && results.results.length > 0 && (
          <div className="divide-y divide-zinc-800/50">
            {/* Frequency Visualization */}
            <div className="p-6 bg-zinc-900/10 border-b border-zinc-800">
               <FrequencyChart 
                  distribution={results.distribution} 
                  onBarClick={scrollToBook}
               />
            </div>

            <div className="px-6 py-3 bg-zinc-900/50 text-xs font-mono text-zinc-500 uppercase tracking-widest flex justify-between items-center sticky top-0 backdrop-blur-md border-b border-zinc-800 z-10">
              <span>{results.count.toLocaleString()} Matches</span>
              <span>Sorted by Relevance</span>
            </div>
            
            {results.results.map((r, i) => (
              <motion.div
                key={`${r.b}-${r.c}-${r.v}-${i}`}
                id={`result-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedVerse({ b: r.b, c: r.c, v: r.v })}
                className="p-6 hover:bg-zinc-900/30 transition-colors group cursor-pointer scroll-mt-16"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider bg-zinc-800 text-zinc-300">
                      {r.b} {r.c}:{r.v}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-rose-500 transition-colors -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
                <p className="text-zinc-300 font-serif leading-relaxed text-lg" dangerouslySetInnerHTML={{
                   __html: highlightText(r.t, debouncedQuery)
                }} />
              </motion.div>
            ))}
            
            {results.count > 100 && (
               <div className="p-8 text-center text-zinc-500 text-sm italic">
                  Showing first 100 matches. Refine search for more specific results.
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FrequencyChart({ distribution, onBarClick }: { distribution: Record<string, number>, onBarClick: (book: string) => void }) {
    const maxCount = Math.max(...Object.values(distribution));
    
    return (
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide pt-20">
            <div className="flex items-end gap-[1px] h-20 min-w-[400px] w-full px-10">
                {BOOKS.map((book) => {
                    const count = distribution[book] || 0;
                    const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    const isZero = count === 0;

                    return (
                        <div 
                            key={book} 
                            onClick={() => count > 0 && onBarClick(book)}
                            className={`group relative flex-1 min-w-[6px] h-full flex items-end ${count > 0 ? "cursor-pointer" : ""}`}
                        >
                             {/* Tooltip */}
                             {!isZero && (
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                                   <div className="bg-zinc-800 text-zinc-100 text-[10px] px-2 py-1.5 rounded shadow-2xl whitespace-nowrap border border-zinc-700 flex flex-col items-center">
                                       <span className="font-bold">{book}</span>
                                       <span className="text-rose-400 font-mono">{count} matches</span>
                                   </div>
                                   {/* Tooltip Arrow */}
                                   <div className="w-2 h-2 bg-zinc-800 border-r border-b border-zinc-700 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                               </div>
                             )}
                             
                             {/* Bar */}
                             <div 
                                className={`w-full rounded-t-sm transition-all duration-500 ${isZero ? "bg-zinc-800/20" : "bg-rose-500 group-hover:bg-rose-400"}`}
                                style={{ height: isZero ? "4px" : `${Math.max(4, heightPercent)}%` }}
                             />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-600 uppercase mt-1 px-10 min-w-[400px]">
                <span>Gen</span>
                <span>Psa</span>
                <span>Mat</span>
                <span>Rev</span>
            </div>
        </div>
    );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      animate={{
        backgroundColor: active ? "rgb(244, 63, 94)" : "rgb(24, 24, 27)",
        color: active ? "rgb(255, 255, 255)" : "rgb(161, 161, 170)",
        borderColor: active ? "rgb(244, 63, 94)" : "rgb(39, 39, 42)",
      }}
      transition={{ duration: 0.2 }}
      className={`
        px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border
        ${active ? "" : "hover:bg-zinc-800 hover:text-zinc-200"}
      `}
    >
      {label}
    </motion.button>
  );
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  // Basic highlighting - case insensitive
  // Escape regex special chars in query
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, "gi");
  return text.replace(regex, '<span class="bg-rose-500/20 text-rose-200 rounded px-0.5 font-medium">$1</span>');
}
