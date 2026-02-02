"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, BookOpen, LayoutDashboard, Shield, Construction } from "lucide-react";
import { useState, useEffect } from "react";
import { InterlinearTool } from "./tools/interlinear-tool";
import { ConcordanceTool } from "./tools/concordance-tool";

interface StudyCoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  book?: string;
  chapter?: number;
  initialToolId?: string;
}

const TOOLS = [
  {
    id: "concordance",
    label: "Concordance",
    icon: Search,
    title: "Biblical Concordance",
    description: "Search for words and phrases across the entire biblical text to find every occurrence.",
    comingSoonText: "Full Bible concordance, Strong's numbers, and cross-reference capabilities."
  },
  {
    id: "commentaries",
    label: "Commentaries",
    icon: BookOpen,
    title: "Theological Commentaries",
    description: "Access a rich library of historical and contemporary commentaries to deepen your understanding.",
    comingSoonText: "Integration with classic commentaries (Matthew Henry, Jamieson-Fausset-Brown) and modern insights."
  },
  {
    id: "hebrew-greek",
    label: "Hebrew/Greek",
    icon: LayoutDashboard,
    title: "Original Languages",
    description: "Examine the original Hebrew and Greek texts with interlinear tools and lexical analysis.",
    comingSoonText: "Interlinear Bible view, morphological analysis, and lexicon definitions."
  },
  {
    id: "maps",
    label: "Maps",
    icon: Shield,
    title: "Biblical Maps",
    description: "Visualize the geography of the biblical world with interactive maps and historical overlays.",
    comingSoonText: "High-resolution maps of ancient Near East, journeys of Paul, and historical timelines."
  }
];

export function StudyCoreModal({ isOpen, onClose, book = "Genesis", chapter = 1, initialToolId }: StudyCoreModalProps) {
  const [activeToolId, setActiveToolId] = useState(TOOLS[0].id);

  useEffect(() => {
    if (isOpen && initialToolId) {
      setActiveToolId(initialToolId);
    }
  }, [isOpen, initialToolId]);

  const activeTool = TOOLS.find(t => t.id === activeToolId) || TOOLS[0];

  return (
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
            className="relative w-full max-w-7xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
              <div className="p-6 border-b border-zinc-800/50">
                 <span className="text-xs font-mono text-rose-500 uppercase tracking-[0.2em] mb-1 block">
                    Study Core
                  </span>
                  <h2 className="text-xl font-bold text-zinc-100">Library</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {TOOLS.map((tool) => {
                  const isActive = activeToolId === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveToolId(tool.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-sm font-medium hover:cursor-pointer ${
                        isActive 
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
                      }`}
                    >
                      <tool.icon className={`w-4 h-4 ${isActive ? "text-rose-500" : "text-zinc-500"}`} />
                      {tool.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/50 relative">
               {/* Close Button (Absolute Top Right) */}
               <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-rose-500 transition-colors rounded-full border border-transparent hover:border-zinc-800 bg-zinc-900/50 hover:cursor-pointer z-50"
                >
                  <X className="w-5 h-5" />
                </button>

              {/* Content Header - Suppress for custom tools */}
              {activeToolId !== "hebrew-greek" && activeToolId !== "concordance" && (
                <div className="p-8 border-b border-zinc-800 flex flex-col justify-center h-32">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-rose-500">
                        <activeTool.icon className="w-6 h-6" />
                     </div>
                     <h2 className="text-2xl font-bold text-zinc-100">{activeTool.title}</h2>
                  </div>
                  <p className="text-zinc-400 text-sm ml-[3.25rem]">{activeTool.description}</p>
                </div>
              )}

              {/* Tool Content */}
              <div className={`flex-1 ${["hebrew-greek", "concordance"].includes(activeToolId) ? "overflow-hidden" : "overflow-y-auto p-8 flex items-center justify-center"}`}>
                 {activeToolId === "hebrew-greek" ? (
                    <InterlinearTool initialBook={book} initialChapter={chapter} />
                 ) : activeToolId === "concordance" ? (
                    <ConcordanceTool />
                 ) : (
                   <motion.div 
                      key={activeTool.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="max-w-md text-center"
                   >
                      <div className="w-20 h-20 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Construction className="w-10 h-10 text-zinc-700" />
                      </div>
                      <h3 className="text-lg font-bold text-zinc-200 mb-2">Coming Soon</h3>
                      <p className="text-zinc-500 leading-relaxed mb-6">
                        {activeTool.comingSoonText}
                      </p>
                      <div className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                          Under Construction
                      </div>
                   </motion.div>
                 )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
