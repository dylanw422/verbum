"use client";

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
  Settings,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";

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

const PlanItem = ({ title, progress, daysLeft }: { title: string; progress: number; daysLeft: number }) => (
  <div className="group bg-zinc-950/30 border border-zinc-800/50 p-4 rounded-lg hover:border-rose-500/30 transition-all">
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
        {daysLeft} sessions left
      </div>
      <button className="text-[10px] font-mono text-rose-500 uppercase tracking-widest border border-rose-500/20 px-2 py-1 rounded bg-rose-500/5 hover:bg-rose-500/20 transition-all hover:cursor-pointer">
        Initiate
      </button>
    </div>
  </div>
);

export default function JournalPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userStats = useQuery("userStats:getStats" as any);
  const recentEntries = useQuery("journalEntries:getEntries" as any);
  const entriesCount = useQuery("journalEntries:getEntriesCount" as any);

  const streakDisplay = userStats ? `${userStats.currentStreak} Day${userStats.currentStreak === 1 ? "" : "s"}` : "0 Days";
  const versesDisplay = userStats?.versesEngaged ? userStats.versesEngaged.toLocaleString() : "0";
  const entriesDisplay = entriesCount !== undefined ? entriesCount.toLocaleString() : "0";
  const studyHoursDisplay = userStats?.totalStudyTime ? (userStats.totalStudyTime / 3600).toFixed(1) : "0.0";

  const firstName = session?.user?.name?.split(" ")[0] ?? "Seeker";
  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-rose-500/30">
      {/* --- Header --- */}
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tighter text-rose-500">
              VERBUM
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/journal" className="text-xs font-mono uppercase tracking-widest text-rose-500">
                Journal
              </Link>
              <Link href="/" className="text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
                Archive
              </Link>
              <Link href="/rsvp" className="text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors">
                Protocol
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-500 font-bold text-xs uppercase">
              {initials}
            </div>
          </div>
        </div>
      </header>

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
              Continue your journey through the sacred texts. Your current focus is on the 
              <strong className="text-zinc-200"> Wisdom Literature</strong> protocol.
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
              action={{ label: "Full Devotional", onClick: () => {} }}
            >
              <div className="bg-zinc-950/30 border border-zinc-800 p-8 rounded-lg relative overflow-hidden group h-full min-h-[300px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield className="w-32 h-32 text-rose-500" />
                </div>
                <blockquote className="relative z-10">
                  <p className="text-2xl md:text-3xl font-serif italic text-zinc-200 mb-6 leading-relaxed">
                    "The light shines in the darkness, and the darkness has not overcome it."
                  </p>
                  <cite className="text-sm font-mono text-rose-500 uppercase tracking-widest not-italic">
                    — John 1:5
                  </cite>
                </blockquote>
                <div className="mt-8 flex gap-4">
                  <button className="px-6 py-2 bg-rose-500 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-rose-600 transition-colors">
                    Meditate
                  </button>
                  <button className="px-6 py-2 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-widest rounded hover:bg-zinc-800 transition-colors">
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
                action={{ label: "Open Library", onClick: () => {} }}
                className="h-full"
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: "Concordance", icon: Search },
                    { name: "Commentaries", icon: BookOpen },
                    { name: "Hebrew/Greek", icon: LayoutDashboard },
                    { name: "Maps", icon: Shield },
                  ].map((tool, i) => (
                    <button key={i} className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-950/50 border border-zinc-800 rounded-lg hover:border-rose-500/30 transition-all group aspect-square">
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
              action={{ label: "Browse Plans", onClick: () => {} }}
              className="h-full"
            >
              <div className="space-y-6 flex flex-col h-full">
                <PlanItem title="Wisdom Literature" progress={65} daysLeft={14} />
                <PlanItem title="The Gospels" progress={22} daysLeft={45} />
                <PlanItem title="Pauline Epistles" progress={8} daysLeft={60} />
                
                <div className="mt-auto pt-4 border-t border-zinc-900">
                  <button className="w-full py-4 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center gap-2 text-zinc-300 hover:bg-zinc-800 transition-all hover:cursor-pointer">
                    <History className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-widest">Protocol History</span>
                  </button>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Sacred Artifacts" icon={History} className="h-full">
              <div className="space-y-4 flex flex-col h-full">
                {[
                  { title: "Psalm 119:105", type: "Saved Verse", date: "2d ago" },
                  { title: "Romans 12:2", type: "Highlighted", date: "5d ago" },
                  { title: "John 15:5", type: "Saved Verse", date: "1w ago" },
                  { title: "Philippians 4:13", type: "Highlighted", date: "1w ago" },
                ].map((artifact, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-950/30 border border-zinc-800 rounded-lg group cursor-pointer hover:border-rose-500/30 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-200 group-hover:text-rose-400 transition-colors">{artifact.title}</span>
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">{artifact.type}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-700">{artifact.date}</span>
                  </div>
                ))}
                <div className="mt-auto pt-4">
                    <button className="w-full py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest hover:text-rose-500 transition-colors">
                    View Repository
                    </button>
                </div>
              </div>
            </DashboardCard>
          </div>

        </div>
      </main>
    </div>
  );
}