"use client";

import { motion } from "framer-motion";
import { ArrowLeft, PenTool, Plus, Hash, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { EntryModal } from "@/components/entry-modal";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { JournalHeader } from "@/components/journal-header";
import { useLibrary } from "@/hooks/use-library";
import { BOOKS } from "@/lib/constants";

// --- Components ---

const getVerseText = (library: any, reference: string) => {
  if (!library || !reference) return null;

  // 1. Handle Ranges: "John 3:16-18"
  const rangeMatch = reference.match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
  if (rangeMatch) {
    const [, bookPart, chapterPart, start, end] = rangeMatch;
    const matchedBook = BOOKS.find(b => b.toLowerCase() === bookPart.toLowerCase());
    if (matchedBook && library[matchedBook]) {
      const chapterData = library[matchedBook][chapterPart];
      if (chapterData && typeof chapterData === "object") {
        const verses = [];
        for (let i = parseInt(start); i <= parseInt(end); i++) {
          const v = (chapterData as any)[i];
          if (v) verses.push(v);
        }
        return verses.length > 0 ? verses.join(" ") : null;
      }
    }
  }

  // 2. Handle Lists: "John 3:16, 18"
  const listMatch = reference.match(/^(.+?)\s+(\d+):([\d,\s]+)$/);
  if (listMatch) {
    const [, bookPart, chapterPart, versesPart] = listMatch;
    if (versesPart.includes(",")) {
        const matchedBook = BOOKS.find(b => b.toLowerCase() === bookPart.toLowerCase());
        if (matchedBook && library[matchedBook]) {
        const chapterData = library[matchedBook][chapterPart];
        if (chapterData && typeof chapterData === "object") {
            const verseNums = versesPart.split(",").map(v => v.trim());
            const verses = [];
            for (const num of verseNums) {
            const v = (chapterData as any)[num];
            if (v) verses.push(v);
            }
            return verses.length > 0 ? verses.join(" ... ") : null;
        }
        }
    }
  }

  // 3. Single Match: "John 3:16"
  const parts = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (parts) {
    const [, bookPart, chapterPart, versePart] = parts;
    const matchedBook = BOOKS.find(b => b.toLowerCase() === bookPart.toLowerCase());
    if (matchedBook && library[matchedBook]) {
      const chapterData = library[matchedBook][chapterPart];
      if (chapterData && typeof chapterData === "object") {
        return (chapterData as any)[versePart] || null;
      }
    }
  }
  return null;
};

const EntryCard = ({ entry, collectionsMap, library, onDelete }: { entry: any, collectionsMap: Record<string, any>, library: any, onDelete: (id: string) => void }) => {
  const verseText = getVerseText(library, entry.linkedVerse);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-lg p-6 pr-12 hover:border-rose-500/30 transition-all duration-300 group cursor-pointer flex flex-col gap-4 relative">
      <button 
          onClick={(e) => {
              e.stopPropagation();
              onDelete(entry._id);
          }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-red-400 z-10"
          title="Delete Entry"
      >
          <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-zinc-200 group-hover:text-rose-400 transition-colors">
            {entry.title}
          </h3>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {new Date(entry.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2 items-center">
            {entry.linkedVerse && (
                <div className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] font-mono text-rose-400 uppercase tracking-tight">
                {entry.linkedVerse}
                </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1 justify-end">
              {entry.collections?.map((colId: string) => {
                  const col = collectionsMap[colId];
                  if (!col) return null;
                  return (
                      <span key={colId} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] text-zinc-400">
                          #{col.name}
                      </span>
                  );
              })}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
          {entry.content}
        </p>
        {verseText && (
          <div className="text-sm text-zinc-300 italic font-serif border-l-2 border-rose-500/30 pl-4 py-2 bg-rose-500/5 rounded-r flex flex-col gap-1">
            <span>"{verseText}"</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function EntriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawEntries = useQuery("journalEntries:getEntries" as any) || [];
  const collections = useQuery("collections:getCollections" as any) || [];
  const { library } = useLibrary("Genesis");
  
  const collectionsMap = collections.reduce((acc: any, col: any) => {
      acc[col._id] = col;
      return acc;
  }, {});
  
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setIsCreating(true);
    }
  }, [searchParams]);

  // Deletion State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
      isOpen: boolean;
      type: 'entry' | 'collection';
      id: string | null;
  }>({ isOpen: false, type: 'entry', id: null });

  const deleteEntry = useMutation("journalEntries:deleteEntry" as any);
  const deleteCollection = useMutation("collections:deleteCollection" as any);

  const confirmDelete = async () => {
      if (!deleteConfirmation.id) return;
      
      if (deleteConfirmation.type === 'entry') {
          await deleteEntry({ id: deleteConfirmation.id as any });
      } else {
          await deleteCollection({ id: deleteConfirmation.id as any });
          if (selectedCollection === deleteConfirmation.id) setSelectedCollection(null);
      }
      setDeleteConfirmation({ ...deleteConfirmation, isOpen: false });
  };

  const openDeleteEntry = (id: string) => {
      setDeleteConfirmation({
          isOpen: true,
          type: 'entry',
          id
      });
  };

  const openDeleteCollection = (id: string) => {
      setDeleteConfirmation({
          isOpen: true,
          type: 'collection',
          id
      });
  };

  // Filter Logic
  const entries = selectedCollection 
    ? rawEntries.filter((e: any) => e.collections?.includes(selectedCollection))
    : rawEntries;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-rose-500/30">
      {/* --- Header --- */}
      <JournalHeader />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div className="flex flex-col gap-2">
            <Link href="/journal" className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-rose-500 transition-colors uppercase tracking-widest mb-2">
              <ArrowLeft className="w-3 h-3" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
              Personal Codex
            </h1>
            <p className="text-zinc-400">
              Reflections, prayers, and study notes.
            </p>
          </div>
          
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold text-sm uppercase tracking-widest rounded-sm hover:bg-rose-600 transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>

        {/* Collection Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide items-center">
            <button
                onClick={() => setSelectedCollection(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors border ${
                    selectedCollection === null
                    ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                    : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                }`}
            >
                All Entries
            </button>
            {collections.map((col: any) => (
                <div key={col._id} className={`flex items-center rounded-full border transition-colors ${
                        selectedCollection === col._id
                        ? "bg-rose-500/20 border-rose-500/50"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-600"
                }`}>
                    <button
                        onClick={() => setSelectedCollection(col._id)}
                        className={`px-3 py-1.5 text-xs font-mono tracking-wider whitespace-nowrap flex items-center gap-2 ${
                            selectedCollection === col._id ? "text-rose-300" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        <Hash className="w-3 h-3" /> {col.name}
                    </button>
                    {selectedCollection === col._id && (
                         <button
                            onClick={() => openDeleteCollection(col._id)}
                            className="pr-2 pl-1 py-1.5 text-rose-400 hover:text-rose-200 transition-colors"
                            title="Delete Collection"
                        >
                            <X className="w-3 h-3" />
                         </button>
                    )}
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {rawEntries === undefined ? (
             // Loading skeleton
             [1,2,3].map(i => (
               <div key={i} className="h-32 bg-zinc-900/20 border border-zinc-800 rounded-lg animate-pulse" />
             ))
          ) : entries.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-lg">
              <PenTool className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-zinc-400 font-mono uppercase tracking-widest mb-2">No Entries Found</h3>
              <p className="text-zinc-600 text-sm max-w-xs mx-auto">
                Begin your codex by creating a new entry linked to your readings.
              </p>
            </div>
          ) : (
            entries.map((entry: any) => (
              <EntryCard 
                key={entry._id} 
                entry={entry} 
                collectionsMap={collectionsMap} 
                library={library} 
                onDelete={openDeleteEntry}
              />
            ))
          )}
        </div>
      </main>
      
      <EntryModal 
        isOpen={isCreating} 
        onClose={() => {
            setIsCreating(false);
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("new");
            newParams.delete("ref");
            router.replace(`/entries?${newParams.toString()}`);
        }} 
        initialVerse={searchParams.get("ref") || undefined}
      />
      
      <ConfirmationModal 
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteConfirmation.type === 'entry' ? "Delete Entry?" : "Delete Collection?"}
        message={deleteConfirmation.type === 'entry' 
            ? "This action cannot be undone. The entry will be permanently removed from your codex." 
            : "This will delete the collection tag. Entries tagged with this collection will NOT be deleted."}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
