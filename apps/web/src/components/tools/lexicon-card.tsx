import { X } from "lucide-react";
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
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
        <p className="text-zinc-500">Select a word to view details.</p>
        <p className="text-zinc-600 text-xs mt-2">
          (Note: Precise mapping is currently simulated. Click generic words to see dictionary entries.)
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full shadow-lg relative">
        <button 
            onClick={onClose}
            className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-rose-500 transition-colors rounded-full hover:bg-zinc-800 hover:cursor-pointer z-10 md:hidden"
        >
            <X className="w-4 h-4" />
        </button>

      <div className="p-5 border-b border-zinc-800 bg-zinc-950/30">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-500 mb-1 block">
              {strongsNumber} • {isOT ? "Hebrew" : "Greek"}
            </span>
            <h3 className="text-2xl font-bold text-zinc-100 font-serif tracking-tight">
              {entry.lemma}
            </h3>
            <p className="text-zinc-400 text-sm mt-1 font-mono">
              {entry.xlit || entry.translit} • /{entry.pron}/
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 overflow-y-auto space-y-6 text-sm custom-scrollbar">
        {/* Definition */}
        <div>
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Definition
          </h4>
          <p className="text-zinc-200 leading-relaxed">
            {entry.strongs_def}
          </p>
        </div>

        {/* Derivation */}
        {entry.derivation && (
          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Etymology
            </h4>
            <p className="text-zinc-400 leading-relaxed italic">
              {entry.derivation}
            </p>
          </div>
        )}

        {/* KJV Usage */}
        <div>
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            KJV Usage
          </h4>
          <p className="text-zinc-300 leading-relaxed">
            {entry.kjv_def}
          </p>
        </div>
      </div>
    </div>
  );
}
