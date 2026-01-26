"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Save, Loader2, Tag, Hash, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { SmartVerseInput } from "./smart-verse-input";

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EntryModal({ isOpen, onClose }: EntryModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // Verse State
  const [verseInput, setVerseInput] = useState("");
  
  // Collections State
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  // Optimistic collections for immediate UI feedback
  const [tempCollections, setTempCollections] = useState<{_id: string, name: string}[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createEntry = useMutation("journalEntries:createEntry" as any);
  const createCollection = useMutation("collections:createCollection" as any);
  const existingCollectionsQuery = useQuery("collections:getCollections" as any) || [];
  
  // Merge query results with temp collections, avoiding duplicates
  const existingCollections = [
      ...existingCollectionsQuery,
      ...tempCollections.filter(tc => !existingCollectionsQuery.find((ec: any) => ec._id === tc._id))
  ];

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
        const name = newCollectionName.trim();
        console.log("Creating collection:", name);
        const id = await createCollection({ name });
        console.log("Created collection ID:", id);
        if (id) {
            if (!selectedCollections.includes(id)) {
                const newSelection = [...selectedCollections, id];
                console.log("Updating selected collections:", newSelection);
                setSelectedCollections(newSelection);
            }
            setTempCollections([...tempCollections, { _id: id, name }]);
        }
        setNewCollectionName("");
        setShowCollectionInput(false);
    } catch (e) {
        console.error("Failed to create collection:", e);
    }
  };

  const toggleCollection = (id: string) => {
    if (selectedCollections.includes(id)) {
        setSelectedCollections(selectedCollections.filter(c => c !== id));
    } else {
        setSelectedCollections([...selectedCollections, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    console.log("Submitting entry with collections:", selectedCollections);
    setIsSubmitting(true);
    
    try {
      await createEntry({
        title,
        content,
        linkedVerse: verseInput || undefined,
        collections: selectedCollections,
      });
      onClose();
      // Reset form
      setTitle("");
      setContent("");
      setVerseInput("");
      setSelectedCollections([]);
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
                  <SmartVerseInput 
                    value={verseInput} 
                    onChange={setVerseInput} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 transition-colors font-mono"
                  />
                </div>

                {/* Collections / Tags */}
                <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Collections
                    </label>
                    <div className="flex flex-wrap gap-2 items-center">
                        {existingCollections.map((col: any) => (
                            <button
                                key={col._id}
                                type="button"
                                onClick={() => toggleCollection(col._id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 ${
                                    selectedCollections.includes(col._id)
                                    ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                                    : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                                }`}
                            >
                                <Hash className="w-3 h-3 opacity-50" /> {col.name}
                            </button>
                        ))}
                        
                        {/* New Collection Input */}
                        {showCollectionInput ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    placeholder="Name..."
                                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 w-24 focus:outline-none focus:border-rose-500"
                                    autoFocus
                                    onBlur={handleCreateCollection}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleCreateCollection();
                                        }
                                    }}
                                />
                                <button type="button" onClick={handleCreateCollection} className="text-rose-500 hover:text-rose-400"><Plus className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowCollectionInput(true)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> New
                            </button>
                        )}
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
