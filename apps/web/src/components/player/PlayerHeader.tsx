import { BookOpen, ArrowLeft, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlayerHeaderProps {
  book: string;
  chapter: number;
  readingMode: boolean;
  activeReaders?: number;
  onOpenBookChapter: () => void;
  onTogglePlay: () => void;
  onToggleStudyTools: () => void;
}

/**
 * Player header with navigation, book info, and chapter selector.
 */
export function PlayerHeader({
  book,
  chapter,
  readingMode,
  activeReaders = 0,
  onOpenBookChapter,
  onTogglePlay,
  onToggleStudyTools,
}: PlayerHeaderProps) {
  const router = useRouter();

  return (
    <div className="absolute top-0 left-0 right-0 z-40 flex flex-col items-center p-6 md:p-8 pointer-events-none">
      <div className="w-full max-w-5xl flex justify-between items-center pointer-events-auto">
        <div className="flex items-start gap-4 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <button
            onClick={() => router.back()}
            className="mt-1 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-rose-500 hover:bg-zinc-800 transition-all duration-300 group hover:cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="flex flex-col gap-1">
            <h1 className="text-[10px] font-bold tracking-[0.25em] text-zinc-600 uppercase flex items-center gap-2">
              Verbum
              {readingMode && (
                <span className="inline-flex items-center gap-1 text-rose-500 animate-pulse">
                  <BookOpen className="w-3 h-3" /> READING
                </span>
              )}
            </h1>
            <button
              onClick={onOpenBookChapter}
              className="flex items-center gap-3 text-zinc-200 rounded-lg px-2 py-1 -mx-2 hover:bg-zinc-900/60 transition-colors hover:cursor-pointer"
              title="Jump to book and chapter"
            >
              <div className="p-1.5 bg-zinc-900 rounded-md border border-zinc-800">
                <BookOpen className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex flex-col text-left">
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
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button
                onClick={onToggleStudyTools}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-300 hover:cursor-pointer group"
                title="Study Tools"
            >
                <GraduationCap className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
                <span className="sr-only">Study</span>
            </button>
        </div>
      </div>
    </div>
  );
}
