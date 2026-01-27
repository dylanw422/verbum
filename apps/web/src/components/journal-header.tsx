"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Settings } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function JournalHeader() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const navItems = [
    { label: "Journal", href: "/journal" },
    { label: "Entries", href: "/entries" },
    { label: "Archive", href: "/" },
  ] as const;

  return (
    <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tighter text-rose-500">
              VERBUM
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                 const isActive = pathname === item.href;
                 return (
                    <Link 
                        key={item.href}
                        href={item.href} 
                        className={`text-xs font-mono uppercase tracking-widest transition-colors ${
                            isActive ? "text-rose-500" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                    >
                        {item.label}
                    </Link>
                 )
              })}
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
  );
}
