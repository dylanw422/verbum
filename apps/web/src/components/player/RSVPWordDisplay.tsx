import type { WordData } from "./types";
import { motion } from "framer-motion";

interface RSVPWordDisplayProps {
  wordData: WordData;
  layoutId?: string;
}

/**
 * RSVP word display with Optimal Recognition Point (ORP) highlighting.
 * Highlights the center character.
 */
export function RSVPWordDisplay({ wordData, layoutId }: RSVPWordDisplayProps) {
  const { text, cleanText, orpIndex } = wordData;

  // VISUAL PROCESSING
  let leftPart: string, centerChar: string | undefined, rightPart: string;

  if (cleanText.length === 0) {
    const mid = Math.floor(text.length / 2);
    leftPart = text.slice(0, mid);
    centerChar = text[mid];
    rightPart = text.slice(mid + 1);
  } else {
    let cleanCount = 0;
    let splitIndex = 0;

    for (let i = 0; i < text.length; i++) {
      if (/[a-zA-Z0-9\u00C0-\u00FF]/.test(text[i])) {
        if (cleanCount === orpIndex) {
          splitIndex = i;
          break;
        }
        cleanCount++;
      }
    }

    leftPart = text.slice(0, splitIndex);
    centerChar = text[splitIndex];
    rightPart = text.slice(splitIndex + 1);
  }

  // --- STYLING ---
  const textColor = "text-zinc-100";
  const centerColor = "text-rose-500";
  const glowEffect = "";

  // --- STATIC SIZING (Mobile Fix) ---
  const isLong = text.length > 12;
  const sizeClass = isLong ? "text-3xl md:text-7xl" : "text-4xl md:text-7xl";

  return (
    <motion.div
      layoutId={layoutId}
      className={`flex items-center justify-center ${sizeClass} font-mono tracking-tight leading-none select-none w-full relative h-full`}
    >
      {/* Left Side - Right Aligned - No Wrapping */}
      <div className="flex-1 text-right text-zinc-600 font-normal opacity-60 whitespace-nowrap overflow-visible">
        {leftPart}
      </div>

      {/* ORP Center */}
      <div
        className={`flex justify-center w-[1ch] ${centerColor} font-bold relative z-10 ${glowEffect}`}
      >
        {centerChar}

        {/* Optical Anchor Line */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px bg-gradient-to-b from-transparent via-current to-transparent opacity-20 -z-10 h-32 md:h-40" />
      </div>

      {/* Right Side - Left Aligned - No Wrapping */}
      <div
        className={`flex-1 text-left ${textColor} font-medium whitespace-nowrap overflow-visible`}
      >
        {rightPart}
      </div>
    </motion.div>
  );
}
