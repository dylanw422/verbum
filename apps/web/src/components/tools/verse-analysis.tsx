"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useOriginalLanguage } from "@/hooks/use-original-language";
import { LexiconCard } from "./lexicon-card";
import { motion, AnimatePresence } from "framer-motion";

interface VerseAnalysisProps {
  book: string;
  chapter: number;
  verse: number;
  onBack: () => void;
}

interface InterlinearWord {
  i: number;
  text: string;
  word: string;
  number: string;
}

export function VerseAnalysis({ book, chapter, verse, onBack }: VerseAnalysisProps) {
  const [interlinearData, setInterlinearData] = useState<InterlinearWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<{ text: string; word: string; number: string } | null>(null);

  const { dictionary, isLoading: isDictLoading, isOT } = useOriginalLanguage(book);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/interlinear?book=${encodeURIComponent(book)}&chapter=${chapter}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        
        // Find specific verse
        // ID format: BBCCCVVV (e.g. 01001001)
        // We need to match the verse part (last 3 digits)
        const targetIdSuffix = verse.toString().padStart(3, "0");
        const verseData = data.find((v: any) => v.id.endsWith(targetIdSuffix));

        if (verseData) {
            setInterlinearData(verseData.verse);
        } else {
            setInterlinearData([]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [book, chapter, verse]);

  // Identify Strong's Entry
  const selectedEntryData = useMemo(() => {
    if (!selectedWord || !dictionary) return null;
    const cleanNumber = selectedWord.number.replace(/[^a-zA-Z0-9]/g, '');
    let entry = dictionary[cleanNumber] || dictionary[cleanNumber.toUpperCase()] || dictionary[cleanNumber.toLowerCase()];
    if (entry) {
        return { entry, id: cleanNumber.toUpperCase() };
    }
    return null;
  }, [selectedWord, dictionary]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 absolute inset-0 z-20">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
           <h2 className="text-xl font-bold text-zinc-100">{book} {chapter}:{verse}</h2>
           <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Verse Analysis</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           {isLoading ? (
               <div className="flex justify-center py-20">
                   <Loader2 className="w-8 h-8 animate-spin text-zinc-700" />
               </div>
           ) : interlinearData.length === 0 ? (
               <div className="text-center py-20 text-zinc-500">
                   Data not available for this verse.
               </div>
           ) : (
               <div className="max-w-3xl mx-auto">
                   {/* English Reading View */}
                   <div className="mb-12 p-6 bg-zinc-900/20 border border-zinc-800/50 rounded-xl">
                       <p className="text-2xl font-serif text-zinc-200 leading-loose">
                           {interlinearData.map((w, i) => (
                               <span key={i} className={selectedWord?.number === w.number ? "text-rose-400 bg-rose-500/10" : ""}>
                                   {w.text}{" "}
                               </span>
                           ))}
                       </p>
                   </div>

                   {/* Interlinear Breakdown */}
                   <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Original Language Breakdown</h3>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                       {interlinearData.map((w, i) => {
                           const isSelected = selectedWord?.number === w.number;
                           return (
                               <div 
                                   key={i}
                                   onClick={() => setSelectedWord(w)}
                                   className={`
                                       p-4 rounded-lg border cursor-pointer transition-all group
                                       ${isSelected 
                                           ? "bg-rose-500/10 border-rose-500/30 ring-1 ring-rose-500/20" 
                                           : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                                       }
                                   `}
                               >
                                   <div className="flex justify-between items-start mb-2">
                                       <span className="text-xs font-mono text-zinc-600 group-hover:text-zinc-500">{w.number}</span>
                                       {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                                   </div>
                                   <div className="text-center space-y-2">
                                       <div className="text-xl font-serif text-zinc-200">{w.word}</div>
                                       <div className="h-px w-8 bg-zinc-800 mx-auto" />
                                       <div className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">{w.text}</div>
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               </div>
           )}
        </div>

        {/* Sidebar for Definition */}
        <AnimatePresence mode="popLayout">
            {selectedWord && (
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 350, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="border-l border-zinc-800 bg-zinc-950 overflow-hidden hidden md:block"
                >
                    <div className="w-[350px] h-full">
                        <LexiconCard 
                            word={selectedWord.word}
                            entry={selectedEntryData?.entry || null}
                            strongsNumber={selectedEntryData?.id || selectedWord.number || null}
                            onClose={() => setSelectedWord(null)}
                            isOT={isOT}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
            {selectedWord && (
                <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className="fixed inset-0 z-50 md:hidden bg-zinc-950 border-t border-zinc-800 mt-20"
                >
                     <LexiconCard 
                            word={selectedWord.word}
                            entry={selectedEntryData?.entry || null}
                            strongsNumber={selectedEntryData?.id || selectedWord.number || null}
                            onClose={() => setSelectedWord(null)}
                            isOT={isOT}
                        />
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}
