import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { Command, Lock, Mail, ArrowLeft } from "lucide-react";

import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Authentication successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    await authClient.signIn.social(
      {
        provider,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          toast.success("Authentication successful");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-sm p-8 relative overflow-hidden group">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 group-hover:border-rose-500 transition-colors duration-500" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-700 group-hover:border-rose-500 transition-colors duration-500" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-700 group-hover:border-rose-500 transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-700 group-hover:border-rose-500 transition-colors duration-500" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-rose-500/20 pb-4">
        <div className="p-2.5 bg-rose-500/10 rounded-sm border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
          <Command className="w-5 h-5 text-rose-500" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-mono tracking-[0.2em] text-zinc-100 uppercase">Authenticate</h1>
          <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
            Secure_Terminal_Access
          </span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 pl-1"
                >
                  Email Address
                </Label>
                <div className="relative group/input">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600 group-focus-within/input:text-rose-500 transition-colors" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-9 bg-zinc-950/50 border-zinc-800 focus-visible:ring-rose-500/20 focus-visible:border-rose-500/50 text-zinc-100 placeholder:text-zinc-700 h-10 font-mono text-sm rounded-sm"
                    placeholder="Enter your email"
                  />
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-rose-500 text-[10px] font-mono pl-1 uppercase tracking-wide">
                    //! {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label
                  htmlFor={field.name}
                  className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 pl-1"
                >
                  Passcode
                </Label>
                <div className="relative group/input">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600 group-focus-within/input:text-rose-500 transition-colors" />
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-9 bg-zinc-950/50 border-zinc-800 focus-visible:ring-rose-500/20 focus-visible:border-rose-500/50 text-zinc-100 placeholder:text-zinc-700 h-10 font-mono text-sm rounded-sm"
                    placeholder="••••••••"
                  />
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-rose-500 text-[10px] font-mono pl-1 uppercase tracking-wide">
                    //! {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-sm font-mono uppercase tracking-[0.15em] text-xs h-10 transition-all hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? (
                <span className="animate-pulse">Verifying...</span>
              ) : (
                "Sign In"
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="flex flex-col gap-3 mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-800/50"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest">
            <span className="bg-zinc-900/40 backdrop-blur-md px-2 text-zinc-500">Or Access Via</span>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <Button
            variant="outline"
            className="font-mono uppercase tracking-wider text-[10px] h-9 bg-zinc-900/50 border-zinc-800 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-100 transition-all flex items-center justify-center gap-2"
            onClick={() => handleSocialSignIn("google")}
            type="button"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
        </div>
      </div>

      <div className="mt-8 text-center pt-4 border-t border-zinc-800/50">
        <Button
          variant="link"
          onClick={onSwitchToSignUp}
          className="text-zinc-500 hover:text-rose-400 font-mono text-[10px] uppercase tracking-widest hover:no-underline transition-colors"
        >
          [ Create New Identity ]
        </Button>
      </div>
    </div>
  );
}