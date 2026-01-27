import { Play, Pause, Minus, Plus, Zap, BookOpen } from "lucide-react";

interface ControlDeckProps {
  targetWpm: number;
  isWarmingUp: boolean;
  playing: boolean;
  readingMode: boolean;
  onAdjustSpeed: (delta: number) => void;
  onTogglePlay: () => void;
  onToggleReadingMode: () => void;
}

/**
 * Bottom control deck with speed controls, play/pause, and reading mode toggle.
 */
export function ControlDeck({
  targetWpm,
  isWarmingUp,
  playing,
  readingMode,
  onAdjustSpeed,
  onTogglePlay,
  onToggleReadingMode,
}: ControlDeckProps) {
  return (
    <div className="absolute bottom-8 md:bottom-12 z-40 w-full flex justify-center px-4">
      <div className="flex items-center gap-4 px-5 py-4 bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/60 rounded-full shadow-2xl shadow-black">
        {/* Speed Controls */}
        <div className="flex items-center bg-zinc-900 rounded-full p-1 border border-zinc-800">
          <button
            onClick={() => onAdjustSpeed(-50)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-20 flex flex-col items-center justify-center -space-y-0.5 relative">
            <div
              className={`flex items-center gap-1.5 ${isWarmingUp ? "text-amber-400" : "text-rose-500"}`}
            >
              <Zap className={`w-3 h-3 fill-current ${isWarmingUp ? "animate-pulse" : ""}`} />
              <span className="text-lg font-bold font-mono tracking-tight tabular-nums">
                {targetWpm}
              </span>
            </div>
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">WPM</span>
          </div>
          <button
            onClick={() => onAdjustSpeed(50)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-8 bg-zinc-800/50" />

        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center justify-center w-16 h-16 md:w-14 md:h-14 rounded-full transition-all duration-300 shadow-lg ${
            playing
              ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 scale-100"
              : "bg-rose-600 text-white hover:bg-rose-500 hover:scale-105 shadow-rose-900/20"
          }`}
        >
          {playing ? (
            <Pause className="w-6 h-6 md:w-6 md:h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 md:w-6 md:h-6 fill-current ml-1" />
          )}
        </button>

        <div className="w-px h-8 bg-zinc-800/50" />

        {/* Reading Mode Toggle */}
        <button
          onClick={onToggleReadingMode}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95 border ${
            readingMode
              ? "bg-zinc-800 text-rose-500 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border-transparent"
          }`}
          title="Toggle Reading Mode (R)"
        >
          <BookOpen className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
