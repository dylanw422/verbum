"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  History,
  LayoutDashboard,
  PenTool,
  Plus,
  Search,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { JournalHeader } from "@/components/journal-header";
import { MeditationModal } from "@/components/meditation-modal";
import { ProtocolLibraryModal } from "@/components/protocol-library-modal";
import { ProtocolDetailsModal } from "@/components/protocol-details-modal";
import { StudyCoreModal } from "@/components/study-core-modal";

// --- Mock Components ---

const DashboardCard = ({
  title,
  icon: Icon,
  children,
  action,
  className = "",
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}) => (
  <div className={`flex flex-col bg-zinc-900/40 border border-zinc-800/50 rounded-lg p-6 hover:border-rose-500/30 transition-all duration-300 ${className}`}>
    <div className="shrink-0 flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-zinc-100">{title}</h2>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs font-mono text-zinc-500 hover:text-rose-500 transition-colors uppercase tracking-wider flex items-center gap-1 hover:cursor-pointer"
        >
          {action.label} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
    <div className="flex-1 min-h-0 flex flex-col">
      {children}
    </div>
  </div>
);

const StatBadge = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
  <div className="flex flex-col gap-1 p-3 bg-zinc-950/50 border border-zinc-800 rounded-md">
    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
      <Icon className="w-3 h-3" />
      {label}
    </div>
    <div className="text-xl font-bold text-zinc-100">{value}</div>
  </div>
);

const PlanItem = ({ title, progress, daysLeft, onClick }: { title: string; progress: number; daysLeft: number; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="group bg-zinc-950/30 border border-zinc-800/50 p-4 rounded-lg hover:border-rose-500/30 transition-all cursor-pointer"
  >
    <div className="flex justify-between text-sm mb-3">
      <span className="text-zinc-200 font-bold group-hover:text-rose-400 transition-colors uppercase tracking-tight">{title}</span>
      <span className="text-rose-500 font-mono text-xs">{progress}%</span>
    </div>
    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-3">
      <div 
        className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500" 
        style={{ width: `${progress}%` }} 
      />
    </div>
    <div className="flex justify-between items-center">
      <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
        {daysLeft} chapters left
      </div>
      <button className="text-[10px] font-mono text-rose-500 uppercase tracking-widest border border-rose-500/20 px-2 py-1 rounded bg-rose-500/5 hover:bg-rose-500/20 transition-all hover:cursor-pointer">
        Continue
      </button>
    </div>
  </div>
);

const PlanItemSkeleton = () => (
  <div className="group border border-transparent p-4 rounded-lg opacity-0 pointer-events-none" aria-hidden="true">
    <div className="flex justify-between text-sm mb-3">
      <span className="font-bold">Placeholder</span>
      <span className="font-mono text-xs">0%</span>
    </div>
    <div className="h-1.5 w-full rounded-full mb-3" />
    <div className="flex justify-between items-center">
      <div className="text-[10px] font-mono uppercase">
        0 chapters left
      </div>
      <button className="text-[10px] font-mono uppercase px-2 py-1 rounded">
        Continue
      </button>
    </div>
  </div>
);

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .map((segment) =>
      segment
        .split("-")
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join("-")
    )
    .join(" ");

const formatTimeAgo = (timestamp: number) => {
  if (!Number.isFinite(timestamp)) return "--";
  const diffMs = Date.now() - timestamp;
  if (diffMs < 0) return "Just now";

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < week) return `${Math.floor(diffMs / day)}d ago`;
  if (diffMs < month) return `${Math.floor(diffMs / week)}w ago`;
  if (diffMs < year) return `${Math.floor(diffMs / month)}mo ago`;
  return `${Math.floor(diffMs / year)}y ago`;
};

export default function JournalPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userStats = useQuery("userStats:getStats" as any);
  const recentEntries = useQuery("journalEntries:getEntries" as any);
  const entriesCount = useQuery("journalEntries:getEntriesCount" as any);
  const dailyVerse = useQuery("dailyBread:get" as any);
  const activeProtocols = useQuery("protocols:getUserProtocols" as any, { status: "active" });
  const recentHighlights = useQuery("highlights:recent" as any, { limit: 4 });
  const recentSharedVerses = useQuery("sharedVerses:recent" as any, { limit: 4 });
  const linkedEntries = useQuery("journalEntries:getLinkedEntries" as any, { limit: 4 });

  const [isMeditating, setIsMeditating] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isStudyCoreOpen, setIsStudyCoreOpen] = useState(false);
  const [studyCoreToolId, setStudyCoreToolId] = useState<string | undefined>(undefined);
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);

  const streakDisplay = userStats ? `${userStats.currentStreak} Day${userStats.currentStreak === 1 ? "" : "s"}` : "0 Days";
  const versesDisplay = userStats?.versesEngaged ? userStats.versesEngaged.toLocaleString() : "0";
  const entriesDisplay = entriesCount !== undefined ? entriesCount.toLocaleString() : "0";
  const studyHoursDisplay = userStats?.totalStudyTime ? (userStats.totalStudyTime / 3600).toFixed(1) : "0.0";

  const firstName = session?.user?.name?.split(" ")[0] ?? "Seeker";

  // Calculate sorted protocols
  const sortedProtocols = activeProtocols 
    ? [...activeProtocols].sort((a: any, b: any) => {
        const progressA = (a.completedSteps.length / a.totalSteps);
        const progressB = (b.completedSteps.length / b.totalSteps);
        return progressB - progressA;
      })
    : [];

  const topProtocol = sortedProtocols.length > 0 ? sortedProtocols[0] : null;

  // Protocol Slot Logic
  const MAX_SLOTS = 3;
  const filledSlots = sortedProtocols.slice(0, MAX_SLOTS);
  const emptySlotsCount = Math.max(0, MAX_SLOTS - filledSlots.length);

  const artifactsLoading =
    recentHighlights === undefined ||
    recentSharedVerses === undefined ||
    linkedEntries === undefined;

  const artifacts = artifactsLoading
    ? []
    : [
        ...(recentHighlights || []).map((highlight: any) => ({
          title: `${toTitleCase(highlight.book)} ${highlight.chapter}:${highlight.verse}`,
          type: "Highlight",
          timestamp: typeof highlight.createdAt === "number" ? highlight.createdAt : Date.now(),
        })),
        ...(recentSharedVerses || []).map((share: any) => ({
          title: share.reference,
          type: "Share",
          timestamp: typeof share.createdAt === "number" ? share.createdAt : Date.now(),
        })),
        ...(linkedEntries || []).map((entry: any) => ({
          title: entry.linkedVerse,
          type: "Note",
          timestamp: Date.parse(entry.createdAt),
        })),
      ]
        .filter((artifact) => !!artifact.title && Number.isFinite(artifact.timestamp))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 4);

  return (
    <div className="h-[100svh] overflow-y-auto bg-zinc-950 text-zinc-100 selection:bg-rose-500/30">
      {/* --- Header --- */}
      <JournalHeader />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* --- Hero / Welcome --- */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-mono text-rose-500 uppercase tracking-[0.3em] mb-4 block">
              Sanctuary Dashboard
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 mb-4">
              Peace be with you, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-200">{firstName}</span>
            </h1>
            <p className="text-zinc-400 max-w-2xl leading-relaxed">
              Continue your journey through the sacred texts. 
              {topProtocol ? (
                <>
                  Your current focus is on {topProtocol.protocolTitle.toLowerCase().startsWith("the") ? "" : "the "} 
                  <strong className="text-zinc-200">{topProtocol.protocolTitle}</strong> protocol.
                </>
              ) : (
                " Explore the library to start a reading plan."
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatBadge label="Current Streak" value={streakDisplay} icon={Zap} />
            <StatBadge label="Verses Engaged" value={versesDisplay} icon={BookOpen} />
            <StatBadge label="Journal Entries" value={entriesDisplay} icon={PenTool} />
            <StatBadge label="Study Hours" value={studyHoursDisplay} icon={Calendar} />
          </div>
        </section>

        {/* --- Dashboard Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Daily Bread (Main Column) */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <DashboardCard 
              title="Daily Bread" 
              icon={Star}
              action={{ 
                label: "Full Devotional", 
                onClick: () => {
                  if (dailyVerse) {
                    const slug = dailyVerse.book.toLowerCase().replace(/\s+/g, '-');
                    router.push(`/${slug}?chapter=${dailyVerse.chapter}`);
                  }
                } 
              }}
            >
              <div className="bg-zinc-950/30 border border-zinc-800 p-8 rounded-lg relative overflow-hidden group h-full min-h-[300px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield className="w-32 h-32 text-rose-500" />
                </div>
                <blockquote className="relative z-10">
                  {dailyVerse === undefined ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-6 bg-zinc-800/50 rounded w-full" />
                      <div className="h-6 bg-zinc-800/50 rounded w-3/4" />
                      <div className="h-4 bg-zinc-800/50 rounded w-1/4 mt-4" />
                    </div>
                  ) : dailyVerse === null ? (
                    <>
                      <p className="text-2xl md:text-3xl font-serif italic text-zinc-200 mb-6 leading-relaxed">
                        "The light shines in the darkness, and the darkness has not overcome it."
                      </p>
                      <cite className="text-sm font-mono text-rose-500 uppercase tracking-widest not-italic">
                        — John 1:5
                      </cite>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl md:text-3xl font-serif italic text-zinc-200 mb-6 leading-relaxed">
                        "{dailyVerse.verseText}"
                      </p>
                      <cite className="text-sm font-mono text-rose-500 uppercase tracking-widest not-italic">
                        — {dailyVerse.reference}
                      </cite>
                    </>
                  )}
                </blockquote>
                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={() => setIsMeditating(true)}
                    className="px-6 py-2 bg-rose-500 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-rose-600 transition-colors hover:cursor-pointer"
                  >
                    Meditate
                  </button>
                  <button 
                    onClick={() => {
                      if (dailyVerse) {
                         router.push(`/entries?new=true&ref=${encodeURIComponent(dailyVerse.reference)}`);
                      } else {
                         router.push("/entries?new=true");
                      }
                    }}
                    className="px-6 py-2 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-widest rounded hover:bg-zinc-800 transition-colors hover:cursor-pointer"
                  >
                    Quick Journal
                  </button>
                </div>
              </div>
            </DashboardCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard 
                title="Codex Entries" 
                icon={PenTool}
                action={{ label: "View All", onClick: () => router.push("/entries") }}
                className="h-full"
              >
                <div className="space-y-4">
                  {recentEntries === undefined ? (
                    // Loading skeleton
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-zinc-900/50 rounded animate-pulse" />
                    ))
                  ) : recentEntries.length === 0 ? (
                    <div className="text-center py-4">
                        <span className="text-xs text-zinc-500">No entries yet.</span>
                    </div>
                  ) : (
                    recentEntries.slice(0, 3).map((entry: any) => (
                        <div key={entry._id} className="group cursor-pointer p-3 hover:bg-zinc-800/30 rounded transition-colors border border-transparent hover:border-zinc-800" onClick={() => router.push("/entries")}>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-zinc-200 group-hover:text-rose-400 transition-colors line-clamp-1">{entry.title}</h4>
                            <span className="text-[10px] font-mono text-zinc-600 uppercase whitespace-nowrap ml-2">
                                {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">{entry.content}</p>
                        </div>
                    ))
                  )}
                  <button 
                    onClick={() => router.push("/entries")}
                    className="w-full py-3 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center gap-2 text-zinc-500 hover:text-rose-500 hover:border-rose-500/30 transition-all group hover:cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-widest">New Entry</span>
                  </button>
                </div>
              </DashboardCard>

              <DashboardCard 
                title="Study Core" 
                icon={Shield}
                action={{ label: "Open Library", onClick: () => { setStudyCoreToolId("concordance"); setIsStudyCoreOpen(true); } }}
                className="h-full"
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "concordance", name: "Concordance", icon: Search },
                    { id: "commentaries", name: "Commentaries", icon: BookOpen },
                    { id: "hebrew-greek", name: "Hebrew/Greek", icon: LayoutDashboard },
                    { id: "maps", name: "Maps", icon: Shield },
                  ].map((tool, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        setStudyCoreToolId(tool.id);
                        setIsStudyCoreOpen(true);
                      }}
                      className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg hover:border-rose-500/30 transition-all group aspect-square hover:cursor-pointer"
                    >
                      <tool.icon className="w-5 h-5 text-zinc-600 group-hover:text-rose-500" />
                      <span className="text-[10px] font-mono uppercase tracking-tighter text-zinc-500 group-hover:text-zinc-300">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </DashboardCard>
            </div>
          </div>

          {/* Active Protocols (Side Column) */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <DashboardCard 
              title="Active Protocols" 
              icon={Zap}
              action={{ label: "Browse", onClick: () => setIsLibraryOpen(true) }}
              className="h-full"
            >
              <div className="relative space-y-6 flex flex-col h-full">
                {activeProtocols === undefined ? (
                  // Loading
                  [1, 2, 3].map(i => <div key={i} className="h-24 bg-zinc-900/50 rounded animate-pulse" />)
                ) : (
                  <>
                    <div className="flex flex-col gap-6 w-full">
                        {filledSlots.map((proto: any) => {
                          const progress = Math.round((proto.completedSteps.length / proto.totalSteps) * 100);
                          const remaining = proto.totalSteps - proto.completedSteps.length;
                          
                          return (
                            <PlanItem
                              key={proto._id}
                              title={proto.protocolTitle}
                              progress={progress}
                              daysLeft={remaining}
                              onClick={() => setSelectedProtocol(proto)}
                            />
                          );
                        })}
                        
                        {/* Empty Slots */}
                        {Array.from({ length: emptySlotsCount }).map((_, i) => (
                           <PlanItemSkeleton key={`empty-${i}`} />
                        ))}
                    </div>

                    {/* Zero State Overlay */}
                    {filledSlots.length === 0 && (
                      <div className="absolute inset-0 top-0 bottom-20 flex flex-col items-center justify-center text-center p-4 opacity-50 z-10 pointer-events-none">
                        <Zap className="w-8 h-8 mb-2" />
                        <p className="text-sm">No active protocols.</p>
                        <button 
                          onClick={() => setIsLibraryOpen(true)}
                          className="mt-2 text-xs text-rose-500 hover:underline hover:cursor-pointer pointer-events-auto"
                        >
                          Start one now
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                <div className="mt-auto pt-4 border-t border-zinc-900">
                  <button className="w-full py-4 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center gap-2 text-zinc-300 hover:bg-zinc-800 transition-all hover:cursor-pointer">
                    <History className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-widest">Protocol History</span>
                  </button>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Sacred Artifacts" icon={History} className="h-[420px]">
              <div className="flex flex-col h-full">
                <div className="space-y-4 flex-1">
                  {artifactsLoading ? (
                    [1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-14 bg-zinc-900/50 rounded animate-pulse border border-zinc-800/50"
                      />
                    ))
                  ) : artifacts.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-xs font-mono text-zinc-600 uppercase tracking-widest">
                      No artifacts yet
                    </div>
                  ) : (
                    artifacts.map((artifact, i) => (
                      <div
                        key={`${artifact.type}-${artifact.title}-${i}`}
                        className="flex items-center justify-between p-3 bg-zinc-950/30 border border-zinc-800 rounded-lg group cursor-pointer hover:border-rose-500/30 transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-rose-400 transition-colors">
                            {artifact.title}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
                            {artifact.type}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-700">
                          {formatTimeAgo(artifact.timestamp)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="pt-4">
                  <button className="w-full py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:text-rose-500 transition-colors hover:cursor-pointer">
                    View Repository
                  </button>
                </div>
              </div>
            </DashboardCard>
          </div>

        </div>
      </main>

      {/* --- Modals --- */}
      <MeditationModal
        isOpen={isMeditating}
        onClose={() => setIsMeditating(false)}
        dailyVerse={dailyVerse}
        onJournal={() => {
          setIsMeditating(false);
          if (dailyVerse) {
             router.push(`/entries?new=true&ref=${encodeURIComponent(dailyVerse.reference)}`);
          } else {
             router.push("/entries?new=true");
          }
        }}
      />

      <ProtocolLibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
      />

      <StudyCoreModal
        isOpen={isStudyCoreOpen}
        onClose={() => setIsStudyCoreOpen(false)}
        initialToolId={studyCoreToolId}
      />

      <ProtocolDetailsModal
        isOpen={!!selectedProtocol}
        onClose={() => setSelectedProtocol(null)}
        protocol={selectedProtocol}
      />
    </div>
  );
}
