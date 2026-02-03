import React from "react";
import { motion } from "framer-motion";
import { 
  Highlighter, 
  StickyNote, 
  Search, 
  Copy, 
  Share2,
  X
} from "lucide-react";

interface TextSelectionMenuProps {
  position: { x: number; y: number } | null;
  onAction: (action: "highlight" | "remove_highlight" | "note" | "concordance" | "copy" | "share") => void;
  onClose: () => void;
  isHighlightActive?: boolean;
  orientation?: "vertical" | "horizontal";
}

export function TextSelectionMenu({ position, onAction, onClose, isHighlightActive, orientation = "vertical" }: TextSelectionMenuProps) {
  if (!position) return null;

  const isVertical = orientation === "vertical";

  return (
    <motion.div
      initial={isVertical 
        ? { opacity: 0, x: "calc(-50% - 10px)", y: "-50%", scale: 0.95 }
        : { opacity: 0, y: 10, x: 0, scale: 0.95 }
      }
      animate={isVertical
        ? { opacity: 1, x: "-50%", y: "-50%", scale: 1 }
        : { opacity: 1, y: "-100%", x: 0, scale: 1 } // y: -100% places it above the anchor point
      }
      exit={isVertical
        ? { opacity: 0, x: "calc(-50% - 10px)", y: "-50%", scale: 0.95 }
        : { opacity: 0, y: 10, x: 0, scale: 0.95 }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 50,
      }}
      className={`flex ${isVertical ? "flex-col" : "flex-row"} items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl backdrop-blur-md`}
    >
      {isHighlightActive ? (
        <MenuButton 
          icon={<X className="w-4 h-4" />} 
          label="Remove" 
          onClick={() => onAction("remove_highlight")}
          danger
        />
      ) : (
        <MenuButton 
          icon={<Highlighter className="w-4 h-4" />} 
          label="Highlight" 
          onClick={() => onAction("highlight")} 
        />
      )}
      
      <MenuButton 
        icon={<StickyNote className="w-4 h-4" />} 
        label="Note" 
        onClick={() => onAction("note")} 
      />
      <MenuButton 
        icon={<Search className="w-4 h-4" />} 
        label="Search" 
        onClick={() => onAction("concordance")} 
      />
      <div className={isVertical ? "w-4 h-px bg-zinc-800 my-1" : "w-px h-4 bg-zinc-800 mx-1"} />
      <MenuButton 
        icon={<Copy className="w-4 h-4" />} 
        label="Copy" 
        onClick={() => onAction("copy")} 
      />
      <MenuButton 
        icon={<Share2 className="w-4 h-4" />} 
        label="Share" 
        onClick={() => onAction("share")} 
      />
      
      {/* Arrow */}
      {isVertical ? (
        <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-zinc-900" />
      ) : (
        <div className="absolute top-full left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-900" />
      )}
    </motion.div>
  );
}

function MenuButton({ icon, label, onClick, danger }: { icon: React.ReactNode, label: string, onClick: () => void, danger?: boolean }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors group hover:cursor-pointer ${
        danger 
          ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300" 
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      }`}
      title={label}
    >
      {icon}
      {/* <span className="text-[10px] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 bg-zinc-950 px-1 rounded">{label}</span> */}
    </button>
  );
}
