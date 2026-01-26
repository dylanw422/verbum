import { useRouter } from "next/navigation";
import { User, LogOut, Terminal, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-sm hover:border-rose-500/50 hover:bg-rose-500/10 transition-all duration-200 group outline-none select-none">
        <div className="w-5 h-5 bg-rose-500/20 rounded-sm flex items-center justify-center border border-rose-500/30">
          <User className="w-3 h-3 text-rose-500" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-zinc-300 group-hover:text-zinc-100 uppercase truncate max-w-[100px]">
          {session.user.name.split(" ")[0]}
        </span>
        <ChevronDown className="w-3 h-3 text-zinc-600 group-hover:text-rose-500 transition-colors" />
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="bg-zinc-950 border-zinc-800 p-1 min-w-[200px] shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Operator Identity</span>
              <span className="text-xs font-medium text-zinc-200 truncate">{session.user.email}</span>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-zinc-800/50 mx-1" />
          
          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-zinc-400 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer group/item">
            <Terminal className="w-4 h-4 text-zinc-600 group-focus/item:text-rose-500 transition-colors" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Journal</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            variant="destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/");
                  },
                },
              });
            }}
            className="flex items-center gap-3 px-3 py-2 text-zinc-500 focus:text-rose-500 focus:bg-rose-500/10 cursor-pointer group/item"
          >
            <LogOut className="w-4 h-4 text-zinc-700 group-focus/item:text-rose-500 transition-colors" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
