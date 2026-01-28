"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, GripVertical, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import { Input } from "./ui/input";
// import { Textarea } from "./ui/textarea"; // Assuming we have this, or use standard textarea
import { cn } from "@/lib/utils";

interface Step {
  id: string; // Unique ID for dnd-kit
  book: string;
  chapter: number;
}

interface Protocol {
  _id: string;
  title: string;
  description: string;
  steps: { book: string; chapter: number }[];
  isPublic: boolean;
}

interface ProtocolEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingProtocol?: Protocol | null;
}

// --- Sortable Item Component ---
function SortableStep({ step, onRemove }: { step: Step; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg group hover:border-zinc-700 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 font-mono text-sm text-zinc-300">
        <span className="text-zinc-500 mr-2">
           {step.book}
        </span>
        <span className="text-zinc-100 font-bold">
            {step.chapter}
        </span>
      </div>
      <button
        onClick={() => onRemove(step.id)}
        className="text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ProtocolEditorModal({ isOpen, onClose, existingProtocol }: ProtocolEditorModalProps) {
  const createProtocol = useMutation("protocols:createProtocol" as any);
  const updateProtocol = useMutation("protocols:updateProtocol" as any);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<Step[]>([]);
  const [expandedBook, setExpandedBook] = useState<string | null>("Genesis");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingProtocol) {
      setTitle(existingProtocol.title);
      setDescription(existingProtocol.description);
      setSteps(
        existingProtocol.steps.map((s) => ({
          ...s,
          id: Math.random().toString(36).substring(7), // Generate temp IDs
        }))
      );
    } else {
      setTitle("");
      setDescription("");
      setSteps([]);
      setExpandedBook("Genesis");
    }
  }, [existingProtocol, isOpen]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addStep = (book: string, chapter: number) => {
    setSteps((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        book,
        chapter,
      },
    ]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (steps.length === 0) {
      toast.error("Add at least one chapter");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        steps: steps.map(({ book, chapter }) => ({ book, chapter })),
        isPublic: true, // Default to public for now
      };

      if (existingProtocol) {
        await updateProtocol({ id: existingProtocol._id, ...payload });
        toast.success("Protocol updated");
      } else {
        await createProtocol(payload);
        toast.success("Protocol created");
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save protocol");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4"
        >
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-6xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
              <h2 className="text-xl font-bold text-zinc-100">
                {existingProtocol ? "Edit Protocol" : "Create Protocol"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : "Save Protocol"}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-500 hover:text-rose-500 transition-colors rounded-full hover:bg-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              
              {/* Left: Metadata & Bible Explorer */}
              <div className="lg:col-span-7 border-r border-zinc-800 flex flex-col overflow-hidden">
                {/* Metadata Form */}
                <div className="p-6 border-b border-zinc-800 space-y-4 bg-zinc-900/10">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1.5 block">Title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., The Gospel of John"
                      className="bg-zinc-900 border-zinc-800 focus:border-rose-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1.5 block">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of this reading plan..."
                      rows={2}
                      className="w-full flex min-h-[60px] rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50 resize-none"
                    />
                  </div>
                </div>

                {/* Bible Explorer */}
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-950">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-4">Bible Explorer</h3>
                  <div className="space-y-1">
                    {BIBLE_BOOKS.map((book) => {
                      const isExpanded = expandedBook === book.name;
                      return (
                        <div key={book.name} className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20">
                          <button
                            onClick={() => setExpandedBook(isExpanded ? null : book.name)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 text-sm font-medium transition-colors hover:bg-zinc-900",
                              isExpanded ? "text-rose-500 bg-zinc-900" : "text-zinc-400"
                            )}
                          >
                            <span>{book.name}</span>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          
                          {isExpanded && (
                            <div className="p-3 bg-zinc-950/50 border-t border-zinc-800/50 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                               <button
                                  onClick={() => {
                                      // Add all chapters
                                      for(let i=1; i<=book.chapters; i++) addStep(book.name, i);
                                  }}
                                  className="col-span-full mb-2 text-xs text-center py-1.5 border border-dashed border-zinc-800 rounded hover:border-rose-500/30 hover:text-rose-500 text-zinc-600 transition-colors"
                               >
                                  + Add All {book.chapters} Chapters
                               </button>
                              {Array.from({ length: book.chapters }, (_, i) => i + 1).map((chapter) => (
                                <button
                                  key={chapter}
                                  onClick={() => addStep(book.name, chapter)}
                                  className="aspect-square flex items-center justify-center text-xs font-mono rounded border border-zinc-800 bg-zinc-900 hover:border-rose-500 hover:text-rose-500 text-zinc-400 transition-all active:scale-95"
                                >
                                  {chapter}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Selected Steps */}
              <div className="lg:col-span-5 flex flex-col overflow-hidden bg-zinc-900/5">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-bold">
                      Selected Steps ({steps.length})
                  </h3>
                  {steps.length > 0 && (
                      <button 
                          onClick={() => setSteps([])}
                          className="text-xs text-rose-500 hover:text-rose-400"
                      >
                          Clear All
                      </button>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <DndContext 
                      sensors={sensors} 
                      collisionDetection={closestCenter} 
                      onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={steps.map(s => s.id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {steps.map((step) => (
                          <SortableStep key={step.id} step={step} onRemove={removeStep} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  
                  {steps.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                          <Plus className="w-12 h-12 mb-4" />
                          <p className="text-sm">Select chapters from the left to build your protocol.</p>
                      </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
