interface ChapterSelectorProps {
  chapters: number[];
  currentChapter: number;
  isOpen: boolean;
  onSelectChapter: (chapter: number) => void;
}

/**
 * Expandable chapter grid dropdown.
 */
export function ChapterSelector({
  chapters,
  currentChapter,
  isOpen,
  onSelectChapter,
}: ChapterSelectorProps) {
  return (
    <div
      className={`w-full max-w-5xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] grid ${
        isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
      }`}
    >
      <div className="overflow-hidden min-h-0">
        <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl p-4 shadow-2xl max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
          <div className="grid grid-cols-5 md:grid-cols-12 gap-2">
            {chapters.map((ch) => (
              <button
                key={ch}
                onClick={() => onSelectChapter(ch)}
                className={`h-9 flex items-center justify-center rounded-md text-xs font-medium transition-all duration-200 hover:cursor-pointer ${
                  ch === currentChapter
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-900/20 font-bold"
                    : "text-zinc-400 bg-zinc-800/50 hover:bg-zinc-700 hover:text-zinc-100"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
