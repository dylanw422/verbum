import { Quote, RefreshCw } from "lucide-react";

import type { WordData, VerseContext } from "./types";

import { ProgressBar } from "./ProgressBar";
import { RSVPWordDisplay } from "./RSVPWordDisplay";

interface ReaderStageProps {
  words: WordData[];
  wordIndex: number;
  studyMode: boolean;
  playing: boolean;
  contextVerses: VerseContext[];
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRestart: () => void;
}

/**
 * Main reading area with word display, context verses, and progress bar.
 */
export function ReaderStage({
  words,
  wordIndex,
  studyMode,
  playing,
  contextVerses,
  onSeek,
  onRestart,
}: ReaderStageProps) {
  const progress = words.length ? (wordIndex / words.length) * 100 : 0;
  const currentWord = words[wordIndex];

  return (
    <div className="relative z-30 flex flex-col items-center justify-center w-full max-w-5xl h-64 md:h-96 px-4">
      {/* Study Mode Context Display */}
      {studyMode && !playing && contextVerses.length > 0 && (
        <div className="absolute -top-32 md:-top-24 inset-x-0 flex flex-col items-center animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 pointer-events-none z-50">
          <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-5 rounded-xl max-w-2xl text-center shadow-2xl shadow-black/80 pointer-events-auto max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 ring-1 ring-white/10">
            {contextVerses.map((v) => (
              <div
                key={v.num}
                className={`mb-4 last:mb-0 transition-opacity ${
                  v.isCurrent ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`flex items-center justify-center gap-2 mb-1 ${v.isCurrent ? "text-rose-500" : "text-zinc-500"}`}
                >
                  {v.isCurrent && <Quote className="w-3 h-3 fill-current" />}
                  <span className="text-[10px] font-mono tracking-widest uppercase">
                    Verse {v.num}
                  </span>
                </div>
                <p
                  className={`text-lg font-serif italic leading-relaxed ${v.isCurrent ? "text-zinc-200" : "text-zinc-400"}`}
                >
                  "{v.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optical Guide Line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 md:h-20 w-px bg-gradient-to-b from-transparent via-rose-500/20 to-transparent mx-auto z-0" />

      {/* Word Display Area */}
      <div
        className={`relative h-40 w-full flex items-center justify-center mb-8 transition-opacity duration-300 ${
          studyMode && !playing ? "opacity-10 blur-sm" : "opacity-100"
        }`}
      >
        {currentWord ? (
          <RSVPWordDisplay wordData={currentWord} studyMode={studyMode} />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 text-zinc-700 animate-spin-slow" />
            <span className="text-zinc-600 font-mono text-sm tracking-widest uppercase">
              End of Chapter
            </span>
            <button onClick={onRestart} className="text-xs text-rose-500 hover:underline">
              Restart
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar
        progress={progress}
        wordIndex={wordIndex}
        totalWords={words.length}
        onSeek={onSeek}
      />
    </div>
  );
}
