"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Loader2, AlertCircle, GitBranch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SmartVerseInput } from "@/components/smart-verse-input";

interface CrossReferenceToolProps {
  initialReference?: string;
}

type CrossReferenceResult = {
  reference: string;
  votes: number;
  text?: string | null;
};

type CrossReferenceResponse = {
  verse: string;
  verseText?: string | null;
  count: number;
  references: CrossReferenceResult[];
};

export function CrossReferenceTool({ initialReference = "" }: CrossReferenceToolProps) {
  const [query, setQuery] = useState(initialReference);
  const [results, setResults] = useState<CrossReferenceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setResults(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/cross-references?verse=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to load references");
      }
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load references");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialReference) {
      setQuery(initialReference);
      performSearch(initialReference);
    }
  }, [initialReference, performSearch]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 relative overflow-hidden">
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-rose-500">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100">References</h2>
            <p className="text-sm text-zinc-500">
              Enter a verse to reveal every cross reference linked to it.
            </p>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            performSearch(query);
          }}
          className="relative mt-4"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none z-10" />
          <SmartVerseInput
            value={query}
            onChange={setQuery}
            showPreview={false}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-12 pr-28 text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-zinc-800 text-zinc-400 rounded-lg hover:text-rose-400 hover:border-rose-500/40 transition-colors hover:cursor-pointer"
          >
            Search
          </button>
          {isLoading && (
            <div className="absolute right-24 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
            </div>
          )}
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-0">
        <AnimatePresence mode="wait">
          {error && !isLoading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center"
            >
              <AlertCircle className="w-10 h-10 mb-3 text-rose-500/70" />
              <p className="text-sm text-rose-300">{error}</p>
            </motion.div>
          )}

          {!results && !isLoading && !error && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center"
            >
              <GitBranch className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-zinc-400">Awaiting a verse</p>
              <p className="text-sm max-w-sm mt-2">
                Search any verse to see its strongest cross references across the Bible.
              </p>
            </motion.div>
          )}

          {results && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="divide-y divide-zinc-800/50"
            >
              <div className="px-6 py-3 bg-zinc-900/50 text-xs font-mono text-zinc-500 uppercase tracking-widest flex flex-col gap-2 sticky top-0 backdrop-blur-md border-b border-zinc-800 z-10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{results.verse}</span>
                    {results.verseText && (
                      <span className="text-xs text-zinc-400 normal-case tracking-normal italic font-serif">
                        "{results.verseText}"
                      </span>
                    )}
                  </div>
                  <span>{results.count.toLocaleString()} refs</span>
                </div>
              </div>

              {results.references.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm italic">
                  No cross references found for {results.verse}.
                </div>
              ) : (
                results.references.map((ref, i) => (
                  <motion.div
                    key={`${ref.reference}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="px-6 py-4 hover:bg-zinc-900/30 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-zinc-200 font-semibold">{ref.reference}</span>
                      {ref.text ? (
                        <span className="text-sm text-zinc-300 italic font-serif line-clamp-2 border-l-2 border-rose-500/40 pl-3">
                          "{ref.text}"
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-600">
                          Verse text unavailable.
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                      Score <span className="text-zinc-400">{ref.votes}</span>
                    </span>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
