"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Plus, Shield, Settings, Edit2 } from "lucide-react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { toast } from "sonner";
import { useState } from "react";
import { ProtocolEditorModal } from "./protocol-editor-modal";
import { authClient } from "@/lib/auth-client";

interface Protocol {
  _id: string;
  title: string;
  description: string;
  steps: { book: string; chapter: number }[];
  isPublic: boolean;
}

interface ProtocolLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProtocolLibraryModal({ isOpen, onClose }: ProtocolLibraryModalProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const protocols = useQuery("protocols:listSystemProtocols" as any) || [];
  const isAdmin = useQuery("auth:isAdmin" as any);
  const subscribe = useMutation("protocols:subscribeToProtocol" as any);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);

  const handleCreate = () => {
    setEditingProtocol(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (protocol: Protocol) => {
    setEditingProtocol(protocol);
    setIsEditorOpen(true);
  };

  const handleSubscribe = async (protocolId: string) => {
    if (isLoading) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to initiate a protocol");
      return;
    }
    
    try {
      const result = await subscribe({ protocolId });

      if (result.success) {
        toast.success("Protocol started!");
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to start protocol");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4"
          >
            {/* Background Noise */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-zinc-800 flex items-start justify-between bg-zinc-900/30">
                <div>
                  <span className="text-xs font-mono text-rose-500 uppercase tracking-[0.2em] mb-2 block">
                    System Database
                  </span>
                  <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Protocol Library</h2>
                  <p className="text-zinc-400 mt-2 max-w-xl">
                    Initiate a structured reading plan to guide your study. Select a protocol to load it into your dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={handleCreate}
                      className="p-2 text-zinc-500 hover:text-emerald-500 transition-colors rounded-full border border-transparent hover:border-zinc-800 bg-zinc-900/50 hover:cursor-pointer"
                      title="Create Protocol (Admin)"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 text-zinc-500 hover:text-rose-500 transition-colors rounded-full border border-transparent hover:border-zinc-800 bg-zinc-900/50 hover:cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-8 bg-zinc-950/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {protocols.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-600">
                      <Shield className="w-16 h-16 mb-6 opacity-20" />
                      <p className="font-mono text-sm uppercase tracking-widest">Accessing Archives...</p>
                    </div>
                  ) : (
                    protocols.map((protocol: Protocol) => (
                      <div
                        key={protocol._id}
                        className="flex flex-col bg-zinc-900/20 border border-zinc-800/50 rounded-xl p-6 hover:border-rose-500/30 hover:bg-zinc-900/40 transition-all duration-300 group relative overflow-hidden"
                      >

                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-rose-500 group-hover:text-rose-400 transition-colors">
                                      <Shield className="w-5 h-5" />
                                  </div>
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
                                      {protocol.steps.length} Chapters
                                  </span>
                              </div>
                              {isAdmin && (
                                  <button
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(protocol);
                                      }}
                                      className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors hover:cursor-pointer"
                                  >
                                      <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                              )}
                          </div>
                          
                          <h3 className="text-xl font-bold text-zinc-200 mb-3 group-hover:text-white transition-colors">
                            {protocol.title}
                          </h3>
                          <p className="text-sm text-zinc-500 mb-8 leading-relaxed line-clamp-3 flex-1 group-hover:text-zinc-400 transition-colors">
                            {protocol.description}
                          </p>

                          <button
                            onClick={() => handleSubscribe(protocol._id)}
                            className="w-full py-3 border border-dashed border-zinc-700 rounded-lg flex items-center justify-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-widest hover:text-rose-500 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all hover:cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            Initiate
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProtocolEditorModal 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        existingProtocol={editingProtocol}
      />
    </>
  );
}
