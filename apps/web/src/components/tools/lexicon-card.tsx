import { X, BookOpen, ScrollText, Languages, History } from "lucide-react";
import { motion } from "framer-motion";
import type { StrongsEntry } from "@/hooks/use-original-language";

interface LexiconCardProps {
  word: string; // The selected English word (or original if mapped)
  entry: StrongsEntry | null;
  strongsNumber: string | null;
  onClose: () => void;
  isOT: boolean;
}

export function LexiconCard({ word, entry, strongsNumber, onClose, isOT }: LexiconCardProps) {
  if (!entry) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950/50 backdrop-blur-sm">
        <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
          <BookOpen className="w-6 h-6 text-zinc-600" />
        </div>
        <h3 className="text-zinc-200 font-medium mb-2">Lexicon Analysis</h3>
        <p className="text-zinc-500 text-sm max-w-[200px]">
          Select any word in the text to view its original {isOT ? "Hebrew" : "Greek"} definition and morphology.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-zinc-950 border-l border-zinc-800 flex flex-col h-full shadow-2xl relative"
    >
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-rose-500 transition-colors rounded-full bg-zinc-900/80 hover:bg-zinc-800 md:hidden z-20"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-zinc-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-5">
            <Languages className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
              {strongsNumber}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              {isOT ? "Hebrew" : "Greek"}
            </span>
          </div>
          
          <h3 className="text-4xl font-bold text-white font-serif tracking-tight mb-1">
            {entry.lemma}
          </h3>
          
          <div className="flex flex-col gap-0.5 text-zinc-400">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-zinc-300">{entry.xlit || entry.translit}</span>
              <span className="text-xs font-mono opacity-50">/{entry.pron}/</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-8">
            {/* Definition */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Definition</h4>
                </div>
                <div className="bg-zinc-900/30 rounded-lg p-4 border border-zinc-800/50">
                    <p className="text-zinc-200 leading-relaxed text-sm">
                        {entry.strongs_def}
                    </p>
                </div>
            </section>

            {/* Derivation */}
            {entry.derivation && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <History className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Etymology</h4>
                    </div>
                    <p className="text-zinc-400 leading-relaxed text-sm italic pl-1 border-l-2 border-zinc-800">
                        {entry.derivation}
                    </p>
                </section>
            )}

            {/* KJV Usage */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <ScrollText className="w-4 h-4 text-blue-500" />
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Usage (KJV)</h4>
                </div>
                <div className="bg-zinc-900/30 rounded-lg p-4 border border-zinc-800/50">
                    <p className="text-zinc-300 leading-relaxed text-sm font-serif">
                        {entry.kjv_def}
                    </p>
                </div>
            </section>
        </div>
      </div>
    </motion.div>
  );
}
