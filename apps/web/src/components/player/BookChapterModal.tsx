"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { OT_BOOKS, NT_BOOKS } from "@/lib/constants";
import type { LibraryData } from "./types";

interface BookChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBook: string;
  currentChapter: number;
  library: LibraryData | null;
  onSelect: (book: string, chapter: number) => void;
}

const getChaptersForBook = (library: LibraryData | null, book: string) => {
  if (!library || !library[book]) return [];
  return Object.keys(library[book])
    .map((ch) => Number.parseInt(ch, 10))
    .filter((ch) => Number.isFinite(ch))
    .sort((a, b) => a - b);
};

export function BookChapterModal({
  isOpen,
  onClose,
  currentBook,
  currentChapter,
  library,
  onSelect,
}: BookChapterModalProps) {
  const [expandedBook, setExpandedBook] = useState<string | null>(currentBook);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const currentBookRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setExpandedBook(currentBook);
    }
  }, [isOpen, currentBook]);

  useEffect(() => {
    if (!isOpen) return;
    if (!scrollRef.current || !currentBookRef.current) return;

    const container = scrollRef.current;
    const target = currentBookRef.current;

    const scrollToTarget = () => {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offsetTop = targetRect.top - containerRect.top + container.scrollTop;
      const desiredTop = offsetTop - container.clientHeight * 0.25;
      container.scrollTo({ top: Math.max(0, desiredTop), behavior: "auto" });
    };

    requestAnimationFrame(scrollToTarget);
  }, [isOpen, currentBook, expandedBook]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-4xl h-[80vh] bg-zinc-950 border border-zinc-800 rounded-sm shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between gap-4 p-6 border-b border-zinc-800 bg-zinc-900/30">
              <div>
                <span className="text-xs font-mono text-rose-500 uppercase tracking-[0.2em] mb-1 block">
                  Jump To
                </span>
                <h2 className="text-xl font-bold text-zinc-100">Book & Chapter</h2>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center p-2 text-zinc-500 hover:text-rose-500 transition-colors rounded-full border border-transparent hover:border-zinc-800 bg-zinc-900/50 hover:cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {!library && (
                <div className="text-sm text-zinc-500">Loading library...</div>
              )}

              {[
                { label: "Old Testament", books: OT_BOOKS },
                { label: "New Testament", books: NT_BOOKS },
              ].map((section) => (
                <div key={section.label} className="space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    {section.label}
                  </div>
                  <div className="space-y-2">
                    {section.books.map((book) => {
                      const isExpanded = expandedBook === book;
                      const chapters = getChaptersForBook(library, book);
                      return (
                        <div
                          key={book}
                          className="border border-zinc-800/60 rounded-sm bg-zinc-950/40 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBook(isExpanded ? null : book)
                            }
                            ref={book === currentBook ? currentBookRef : undefined}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:cursor-pointer rounded-sm ${
                              isExpanded
                                ? "text-rose-400 bg-rose-500/10"
                                : "text-zinc-300 hover:bg-zinc-900/60"
                            }`}
                            aria-expanded={isExpanded}
                          >
                            <span>{book}</span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                              {chapters.length} ch
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2">
                              {chapters.length === 0 ? (
                                <div className="text-xs text-zinc-500">
                                  No chapters available.
                                </div>
                              ) : (
                                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                                  {chapters.map((ch) => (
                                    <button
                                      key={ch}
                                      onClick={() => {
                                        onSelect(book, ch);
                                        onClose();
                                      }}
                                      className={`h-9 flex items-center justify-center rounded-md text-xs font-medium transition-all hover:cursor-pointer ${
                                        book === currentBook && ch === currentChapter
                                          ? "bg-rose-500 text-white shadow-lg shadow-rose-900/20 font-bold"
                                          : "text-zinc-400 bg-zinc-800/50 hover:bg-zinc-700 hover:text-zinc-100"
                                      }`}
                                    >
                                      {ch}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
