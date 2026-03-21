"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { getBrowserClient } from "@umbra/auth";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"account" | "org">("account");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", orgName: "", industry: "",
  });

  function handleChange(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (step === "account") {
      // Step 1: create Supabase account
      setIsLoading(true);
      const supabase = getBrowserClient();
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
          },
        },
      });
      setIsLoading(false);

      if (authError) {
        setError(authError.message);
        return;
      }

      setStep("org");
      return;
    }

    // Step 2: create org, then redirect
    setIsLoading(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.orgName,
          industry: form.industry,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed: ${res.status}`);
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create organization.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[400px] bg-brand-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="font-display text-white text-sm">U</span>
          </div>
          <span className="font-display text-2xl text-white tracking-tight">Umbra</span>
        </div>

        <div className="bg-white rounded-2xl shadow-modal p-8 animate-slide-up">
          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-6">
            {["Account", "Organization"].map((s, i) => {
              const isActive = (i === 0 && step === "account") || (i === 1 && step === "org");
              const isDone = i === 0 && step === "org";
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${
                    isDone ? "text-emerald-600" : isActive ? "text-brand-600" : "text-slate-400"
                  }`}>
                    <div className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                      isDone ? "bg-emerald-100 text-emerald-600" :
                      isActive ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    {s}
                  </div>
                  {i === 0 && <div className="w-8 h-px bg-slate-200" />}
                </div>
              );
            })}
          </div>

          <h1 className="font-display text-3xl text-slate-900 mb-1">
            {step === "account" ? "Create your account" : "Set up your workspace"}
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            {step === "account"
              ? "Start building your AI agent platform."
              : "Tell us about your business."}
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === "account" ? (
              <>
                <div>
                  <label className="label">Full name</label>
                  <input type="text" placeholder="John Smith" className="input"
                    value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Work email</label>
                  <input type="email" placeholder="john@company.com" className="input"
                    value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="input pr-10"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword((p) => !p)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label">Organization name</label>
                  <input type="text" placeholder="Acme Services LLC" className="input"
                    value={form.orgName} onChange={(e) => handleChange("orgName", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Industry</label>
                  <select className="input" value={form.industry} onChange={(e) => handleChange("industry", e.target.value)} required>
                    <option value="">Select your industry</option>
                    <option>Home Services</option>
                    <option>Construction &amp; Remodeling</option>
                    <option>Real Estate</option>
                    <option>Automotive</option>
                    <option>Equipment &amp; Machinery</option>
                    <option>Other</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" disabled={isLoading}
              className="btn-primary w-full py-3 justify-center text-base disabled:opacity-60">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {step === "account" ? "Continue" : "Launch workspace"}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-center text-slate-400 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
