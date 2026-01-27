import { BookOpen, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ChapterSelector } from "./ChapterSelector";

interface PlayerHeaderProps {
  book: string;
  chapter: number;
  readingMode: boolean;
  currentVerse: string | null;
  showChapters: boolean;
  availableChapters: number[];
  playing: boolean;
  activeReaders?: number;
  onToggleChapters: () => void;
  onSelectChapter: (chapter: number) => void;
  onTogglePlay: () => void;
}

/**
 * Player header with navigation, book info, and chapter selector.
 */
export function PlayerHeader({
  book,
  chapter,
  readingMode,
  currentVerse,
  showChapters,
  availableChapters,
  playing,
  activeReaders = 0,
  onToggleChapters,
  onSelectChapter,
  onTogglePlay,
}: PlayerHeaderProps) {
  const handleChapterToggle = () => {
    if (!showChapters && playing) {
      onTogglePlay();
    }
    onToggleChapters();
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-40 flex flex-col items-center p-6 md:p-8 pointer-events-none">
      <div className="w-full max-w-5xl flex justify-between items-start pointer-events-auto">
        <div className="flex items-start gap-4 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link
            href="/"
            className="mt-1 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-rose-500 hover:bg-zinc-800 transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>

          <div className="flex flex-col gap-1">
            <h1 className="text-[10px] font-bold tracking-[0.25em] text-zinc-600 uppercase flex items-center gap-2">
              Verbum
              {readingMode && (
                <span className="inline-flex items-center gap-1 text-rose-500 animate-pulse">
                  <BookOpen className="w-3 h-3" /> READING
                </span>
              )}
            </h1>
            <div className="flex items-center gap-3 text-zinc-200">
              <div className="p-1.5 bg-zinc-900 rounded-md border border-zinc-800">
                <BookOpen className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium tracking-tight text-sm leading-none">{book}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-zinc-500">Chapter {chapter}</span>
                  {activeReaders > 1 && (
                    <>
                      <span className="text-zinc-700">•</span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {activeReaders} reading
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {availableChapters.length > 0 && (
          <div className="relative flex items-center gap-2">
            <button
              onClick={handleChapterToggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 mt-1 ${
                showChapters
                  ? "bg-zinc-100 text-zinc-950 border-zinc-100 shadow-md"
                  : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
            >
              <span>CH {chapter}</span>
              {showChapters ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        )}
      </div>

      <ChapterSelector
        chapters={availableChapters}
        currentChapter={chapter}
        isOpen={showChapters}
        onSelectChapter={onSelectChapter}
      />
    </div>
  );
}
