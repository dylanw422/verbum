import { Loader2 } from "lucide-react";

/**
 * Full-screen loading state for the player.
 */
export function LoadingState() {
  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-rose-500 animate-spin z-20" />
      <span className="mt-4 text-xs font-mono tracking-widest text-zinc-500 uppercase z-20">
        Loading Library...
      </span>
    </div>
  );
}
