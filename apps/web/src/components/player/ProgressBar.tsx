interface ProgressBarProps {
  progress: number;
  wordIndex: number;
  totalWords: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * Clickable progress bar with word count stats.
 */
export function ProgressBar({ progress, wordIndex, totalWords, onSeek }: ProgressBarProps) {
  return (
    <div className="w-full max-w-sm md:max-w-md flex flex-col items-center gap-3 relative group">
      <div
        className="w-full h-1.5 bg-zinc-800/50 rounded-full overflow-hidden cursor-pointer hover:h-2.5 transition-all"
        onClick={onSeek}
      >
        <div
          className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between w-full text-[10px] font-mono text-zinc-600 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
        <span>
          {wordIndex + 1} / {totalWords}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
