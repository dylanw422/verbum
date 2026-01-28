"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  isDestructive = false,
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden relative flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
              <h2 className="text-sm font-mono tracking-[0.2em] text-zinc-100 uppercase flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${isDestructive ? "text-rose-500" : "text-yellow-500"}`} />
                {title}
              </h2>
              <button 
                onClick={onClose} 
                disabled={isLoading}
                className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-zinc-400 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                }}
                disabled={isLoading}
                className={`px-6 py-2 rounded text-xs font-mono uppercase tracking-widest text-white transition-all shadow-lg relative ${
                  isDestructive
                    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-900/20"
                    : "bg-zinc-100 text-zinc-900 hover:bg-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="grid place-items-center">
                  <span className={isLoading ? "invisible" : "visible"}>
                    {confirmLabel}
                  </span>
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
