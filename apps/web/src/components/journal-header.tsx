"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Settings, UserPlus } from "lucide-react";
import { useQuery } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { AddAdminModal } from "./add-admin-modal";

export function JournalHeader() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const isAdmin = useQuery("auth:isAdmin" as any);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

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
    <>
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
            {isAdmin && (
              <button
                onClick={() => setIsAddAdminOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-zinc-400 border border-zinc-800 rounded hover:text-rose-500 hover:border-rose-500/50 bg-zinc-900/50 transition-colors uppercase tracking-wider hover:cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Admin
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-500 font-bold text-xs uppercase">
              {initials}
            </div>
          </div>
        </div>
      </header>
      <AddAdminModal isOpen={isAddAdminOpen} onClose={() => setIsAddAdminOpen(false)} />
    </>
  );
}
