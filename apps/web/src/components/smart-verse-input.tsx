"use client";

import { useState, useEffect, useRef } from "react";
import { BOOKS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { useLibrary } from "@/hooks/use-library";
import { Loader2 } from "lucide-react";

interface SmartVerseInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SmartVerseInput({ value, onChange, className }: SmartVerseInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Verse Preview State
  const [previewText, setPreviewText] = useState<string | null>(null);
  const { library, isLoading } = useLibrary("Genesis"); // "Genesis" is placeholder, library is global

  useEffect(() => {
    // 1. Suggestions Logic (Existing)
    if (!value || /\d/.test(value)) {
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
        const lower = value.toLowerCase();
        const matches = BOOKS.filter(b => b.toLowerCase().startsWith(lower));
        setSuggestions(matches.slice(0, 5));
        setShowSuggestions(matches.length > 0 && matches[0].toLowerCase() !== lower);
        setHighlightIndex(0);
    }

    // 2. Preview Logic
    if (library && value) {
        // Parse "Book Chapter:Verse"
        // Handle "1 John" vs "John"
        const parts = value.match(/^(.+?)\s+(\d+):(\d+)$/);
        if (parts) {
            const [, bookPart, chapterPart, versePart] = parts;
            // Find matched book (case insensitive)
            const matchedBook = BOOKS.find(b => b.toLowerCase() === bookPart.toLowerCase());
            
            if (matchedBook && library[matchedBook]) {
                const chapterData = library[matchedBook][chapterPart];
                if (chapterData) {
                    // chapterData can be string (single chapter book?) or object
                    if (typeof chapterData === "object") {
                        const text = (chapterData as any)[versePart];
                        setPreviewText(text || null);
                    } else {
                        setPreviewText(null);
                    }
                } else {
                    setPreviewText(null);
                }
            } else {
                setPreviewText(null);
            }
        } else {
            setPreviewText(null);
        }
    }
  }, [value, library]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      acceptSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const acceptSuggestion = (book: string) => {
    onChange(book + " "); // Add space for next part
    setShowSuggestions(false);
    // Keep focus
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay for click
        placeholder="e.g. John 3:16"
        className={className}
      />
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded shadow-lg overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onClick={() => acceptSuggestion(suggestion)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  index === highlightedIndex ? "bg-rose-500/20 text-rose-300" : "text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {suggestion}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Preview */}
      {previewText && (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 text-xs text-zinc-400 italic font-serif border-l-2 border-rose-500/30 pl-3 py-1"
        >
            "{previewText}"
        </motion.div>
      )}
    </div>
  );
}
