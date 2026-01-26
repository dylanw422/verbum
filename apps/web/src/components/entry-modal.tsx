"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Save, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { BOOKS } from "@/lib/constants";

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EntryModal({ isOpen, onClose }: EntryModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // Verse Selector State
  const [selectedBook, setSelectedBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [verse, setVerse] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEntry = useMutation("journalEntries:createEntry" as any);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    
    let linkedVerse = undefined;
    if (selectedBook && chapter && verse) {
        linkedVerse = `${selectedBook} ${chapter}:${verse}`;
    }

    try {
      await createEntry({
        title,
        content,
        linkedVerse,
      });
      onClose();
      // Reset form
      setTitle("");
      setContent("");
      setSelectedBook("");
      setChapter("");
      setVerse("");
    } catch (error) {
      console.error("Failed to create entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
              <h2 className="text-lg font-mono tracking-[0.2em] text-zinc-100 uppercase">New Entry</h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <form id="entry-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Morning Reflection..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors font-medium"
                    required
                  />
                </div>

                {/* Verse Linker */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Link Scripture (Optional)
                  </label>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-6 md:col-span-6">
                        <select
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-zinc-200 focus:outline-none focus:border-rose-500/50 transition-colors appearance-none"
                        >
                            <option value="">Select Book...</option>
                            {BOOKS.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-3 md:col-span-3">
                        <input
                            type="text"
                            value={chapter}
                            onChange={(e) => setChapter(e.target.value)}
                            placeholder="Ch"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors text-center"
                        />
                    </div>
                    <div className="col-span-3 md:col-span-3">
                        <input
                            type="text"
                            value={verse}
                            onChange={(e) => setVerse(e.target.value)}
                            placeholder="Vs"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors text-center"
                        />
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your thoughts here..."
                    className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded p-3 text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-rose-500/50 transition-colors resize-none leading-relaxed"
                    required
                  />
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="entry-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded text-xs font-mono uppercase tracking-widest hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                    </>
                ) : (
                    <>
                        <Save className="w-3 h-3" /> Save Entry
                    </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
