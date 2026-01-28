"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Input } from "./ui/input";

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAdminModal({ isOpen, onClose }: AddAdminModalProps) {
  const addAdmin = useMutation("admins:addAdmin" as any);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await addAdmin({ email });
      toast.success("Admin added successfully");
      setEmail("");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to add admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="add-admin-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4"
        >
          {/* Background Noise */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                    <UserPlus className="w-5 h-5" />
                 </div>
                 <h2 className="text-lg font-bold text-zinc-100">Add Administrator</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-rose-500 transition-colors rounded-full hover:bg-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 bg-zinc-950/50 space-y-4">
              <p className="text-sm text-zinc-400">
                Grant admin privileges to a user by their email address. They will gain access to protocol creation and other administrative tools.
              </p>
              
              <div className="space-y-2">
                 <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">Email Address</label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <Input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="pl-9 bg-zinc-900 border-zinc-800 focus:border-rose-500/50 text-zinc-100"
                        required
                    />
                 </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                 <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                 >
                    Cancel
                 </button>
                 <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                 >
                    {isSubmitting ? "Adding..." : "Add Admin"}
                 </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
