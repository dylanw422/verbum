"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4 relative">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-rose-500 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="tracking-[0.2em] uppercase">Return to Archive</span>
      </Link>

      <div className="w-full max-w-md">
        {mode === "signin" ? (
          <SignInForm onSwitchToSignUp={() => setMode("signup")} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setMode("signin")} />
        )}
      </div>
    </div>
  );
}