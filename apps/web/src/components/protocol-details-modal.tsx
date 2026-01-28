"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, CheckCircle, Circle, ArrowRight } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Step {
  book: string;
  chapter: number;
}

interface UserProtocol {
  _id: string;
  protocolTitle: string;
  protocolDescription: string;
  totalSteps: number;
  steps: Step[];
  completedSteps: number[];
  status: string;
}

interface ProtocolDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocol: UserProtocol | null;
}

export function ProtocolDetailsModal({ isOpen, onClose, protocol: initialProtocol }: ProtocolDetailsModalProps) {
  const toggleStep = useMutation("protocols:toggleStepCompletion" as any);
  const router = useRouter();
  const [optimisticOverrides, setOptimisticOverrides] = useState<Record<number, boolean>>({});
  
  const liveProtocol = useQuery("protocols:getUserProtocol" as any, 
    initialProtocol ? { userProtocolId: initialProtocol._id } : "skip"
  );
  
  const protocol = (liveProtocol || initialProtocol) as UserProtocol | undefined | null;

  if (!isOpen || !protocol) return null;

  // Calculate effective completed steps (server + optimistic overrides)
  const effectiveCompletedSteps = protocol.steps.map((_, index) => {
    if (optimisticOverrides[index] !== undefined) {
      return optimisticOverrides[index] ? index : -1;
    }
    return protocol.completedSteps.includes(index) ? index : -1;
  }).filter(i => i !== -1);

  const progress = Math.round((effectiveCompletedSteps.length / protocol.totalSteps) * 100);

  const handleToggle = async (index: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistically update
    setOptimisticOverrides(prev => ({ ...prev, [index]: newStatus }));

    try {
      await toggleStep({
        userProtocolId: protocol._id,
        stepIndex: index,
        completed: newStatus,
      });
      // Clear override on success, letting server state take over
      setOptimisticOverrides(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    } catch (err) {
      toast.error("Failed to update progress");
      // Revert override on error
      setOptimisticOverrides(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const handleRead = (book: string, chapter: number) => {
    const slug = book.toLowerCase().replace(/\s+/g, '-');
    router.push(`/${slug}?chapter=${chapter}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-2xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100">{protocol.protocolTitle}</h2>
                  <p className="text-sm text-zinc-400 mt-1">{protocol.protocolDescription}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-rose-500 font-bold">{progress}% Complete</span>
              </div>
            </div>

            {/* Steps List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {protocol.steps.map((step: Step, index: number) => {
                const isCompleted = effectiveCompletedSteps.includes(index);
                const isNext = !isCompleted && (index === 0 || effectiveCompletedSteps.includes(index - 1));

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isCompleted
                        ? "bg-zinc-900/20 border-zinc-800/50 opacity-60"
                        : isNext
                        ? "bg-zinc-900/60 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                        : "bg-transparent border-transparent opacity-40 hover:opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggle(index, isCompleted)}
                        className={`transition-colors ${
                          isCompleted ? "text-rose-500" : "text-zinc-700 hover:text-zinc-500"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <span
                        className={`font-mono text-sm ${
                          isCompleted ? "text-zinc-500 line-through" : "text-zinc-200"
                        }`}
                      >
                        {step.book} {step.chapter}
                      </span>
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => handleRead(step.book, step.chapter)}
                        className={`text-xs uppercase tracking-widest font-bold flex items-center gap-1 transition-colors ${
                          isNext
                            ? "text-rose-500 hover:text-rose-400"
                            : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        Read <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
