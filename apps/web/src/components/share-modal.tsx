"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Loader2, ImageIcon } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  reference: string;
}

export function ShareModal({
  isOpen,
  onClose,
  text,
  reference,
}: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      // 1. Generate PNG using html-to-image (Supports modern CSS like oklch/lab)
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true, 
        pixelRatio: 4, 
        backgroundColor: "#09090b",
      });

      // 2. Convert Data URL to Blob for Clipboard API
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      if (!blob) {
        toast.error("Failed to generate image blob");
        setIsGenerating(false);
        return;
      }

      // 3. Write to Clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
            [blob.type]: blob,
        }),
      ]);
      
      setHasCopied(true);
      toast.success("Image copied to clipboard");
      setTimeout(() => setHasCopied(false), 2000);

    } catch (err) {
      console.error("Image generation failed", err);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
             if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="relative w-full max-w-2xl flex flex-col items-center gap-6">
             {/* Close Button */}
             <button
                onClick={onClose}
                className="absolute -top-12 right-0 md:-right-12 p-2 text-zinc-400 hover:text-white transition-colors"
             >
                <X className="w-6 h-6" />
             </button>

             {/* PREVIEW CARD (What gets captured) */}
             <div className="w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden border border-white/5">
                <div 
                    ref={cardRef}
                    className="relative bg-[#09090b] p-12 md:p-20 flex flex-col items-center justify-center text-center gap-10 min-h-[500px] overflow-hidden"
                >
                    {/* Background Noise/Gradient replicated here for capture */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-[#09090b] to-[#09090b]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                    
                    {/* Decorative Meditation-style Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-rose-500/10 rounded-full pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 max-w-2xl">
                        <p className="text-3xl md:text-5xl font-serif italic leading-tight md:leading-snug text-zinc-100 drop-shadow-2xl">
                           "{text}"
                        </p>
                        <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent mx-auto my-10" />
                        <p className="text-xs md:text-sm font-mono uppercase tracking-[0.4em] text-zinc-500">
                           — {reference}
                        </p>
                    </div>

                    {/* Watermark / Branding */}
                    <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2 opacity-30">
                        <div className="h-px w-4 bg-zinc-800" />
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.5em]">Verbum</span>
                        <div className="h-px w-4 bg-zinc-800" />
                    </div>
                </div>
             </div>

             {/* Actions */}
             <div className="flex flex-col items-center gap-4 w-full">
                <button
                    onClick={handleCopyImage}
                    disabled={isGenerating}
                    className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-rose-600 text-white font-mono text-xs uppercase tracking-widest rounded hover:bg-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-rose-900/20 active:scale-95"
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : hasCopied ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <ImageIcon className="w-4 h-4" />
                    )}
                    {isGenerating ? "Preparing Image..." : hasCopied ? "Image Copied!" : "Copy Image to Clipboard"}
                </button>
                <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest opacity-50">
                    High-quality PNG • Optimized for Socials
                </p>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
