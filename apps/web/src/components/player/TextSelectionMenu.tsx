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
}

export function TextSelectionMenu({ position, onAction, onClose, isHighlightActive }: TextSelectionMenuProps) {
  if (!position) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)", // Center horizontally, place above
        zIndex: 50,
      }}
      className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl backdrop-blur-md mb-2"
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
      <div className="w-px h-4 bg-zinc-800 mx-1" />
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
      
      {/* Tiny arrow pointing down */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-900 drop-shadow-sm" />
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
      className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors group ${
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
