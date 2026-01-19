import { Keyboard } from "lucide-react";

interface ShortcutKeyProps {
  label: string;
  k: string;
}

/**
 * Individual keyboard shortcut hint.
 */
export function ShortcutKey({ label, k }: ShortcutKeyProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-zinc-600 tracking-tight">{label}</span>
      <span className="min-w-[20px] h-5 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded px-1.5 shadow-sm text-zinc-300 whitespace-nowrap">
        {k}
      </span>
    </div>
  );
}

/**
 * Desktop keyboard shortcuts panel.
 */
export function KeyboardHints() {
  return (
    <div className="absolute bottom-6 right-6 z-30 hidden lg:flex flex-col items-end gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1 flex items-center gap-1.5">
        <Keyboard className="w-3 h-3" /> Controls
      </div>
      <div className="grid grid-cols-1 gap-1.5 text-[10px] font-mono text-zinc-400">
        <ShortcutKey label="Play/Pause" k="Space" />
        <ShortcutKey label="Speed" k="↑ / ↓" />
        <ShortcutKey label="Seek" k="← / →" />
        <ShortcutKey label="Study Mode" k="S" />
      </div>
    </div>
  );
}
