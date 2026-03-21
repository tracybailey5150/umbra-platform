"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[400px] bg-brand-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="font-display text-white text-sm">U</span>
          </div>
          <span className="font-display text-2xl text-white tracking-tight">Umbra</span>
        </div>

        <div className="bg-white rounded-2xl shadow-modal p-8 animate-slide-up">
          <h1 className="font-display text-3xl text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-6">Sign in to your workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" placeholder="you@company.com" className="input" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link href="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  className="input pr-10"
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full py-3 justify-center text-base disabled:opacity-60">
              {isLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign in</span><ArrowRight size={17} /></>
              }
            </button>
          </form>

          <p className="text-xs text-center text-slate-400 mt-5">
            Don't have an account?{" "}
            <Link href="/signup" className="text-brand-600 hover:text-brand-700 font-medium">
              Get started free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
