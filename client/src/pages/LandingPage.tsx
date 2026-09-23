import { COOKIE_NAME } from "@shared/const";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BarChart3, Check, Flame, LineChart, Lock, Mail, Sparkles, Target, User, X, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const steps = [
  { icon: Target, label: "Set your goals", copy: "Choose what matters to you, from coding to health to creative work." },
  { icon: Check, label: "Track your days", copy: "Turn daily effort into visible momentum with flexible partial progress." },
  { icon: LineChart, label: "Understand progress", copy: "See what is working, where focus slips, and how your consistency changes." },
];

export default function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  return (
    <div className="min-h-screen overflow-hidden bg-[#090b12] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_10%,rgba(217,255,62,.14),transparent_25%),radial-gradient(circle_at_10%_45%,rgba(130,145,255,.14),transparent_28%)]" />

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-[#d9ff3e] text-[#090b12]">
            <Flame className="size-5" />
          </div>
          <div>
            <p className="font-display text-base font-bold tracking-[.16em]">RISE90</p>
            <p className="text-[10px] uppercase tracking-[.2em] text-white/40">Personal growth OS</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setMode("signin");
              setAuthModalOpen(true);
            }}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-[#d9ff3e]/50 hover:text-white"
          >
            Sign in
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setAuthModalOpen(true);
            }}
            className="rounded-xl bg-[#d9ff3e] px-4 py-2 text-sm font-semibold text-[#090b12] transition hover:bg-[#edff9b]"
          >
            Start 90 days
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:px-10 lg:pt-24">
        <section className="grid items-center gap-14 lg:grid-cols-[1fr_480px]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d9ff3e]/20 bg-[#d9ff3e]/[.07] px-3 py-1.5 text-xs text-[#d9ff3e]">
              <Sparkles className="size-3.5" /> Your next 90 days start here
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-.05em] sm:text-7xl">
              Rise every day.<br />
              <span className="text-[#d9ff3e]">Become better</span><br />
              in 90 days.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-white/55">
              Set meaningful goals, build daily consistency, and understand exactly where you are improving.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setMode("signup");
                  setAuthModalOpen(true);
                }}
                className="group inline-flex items-center gap-2 rounded-2xl bg-[#d9ff3e] px-5 py-3.5 text-sm font-semibold text-[#090b12] shadow-[0_12px_40px_rgba(217,255,62,.15)] transition hover:bg-[#edff9b]"
              >
                Start your 90 days <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3.5 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:text-white"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[40px] bg-[#d9ff3e]/10 blur-3xl" />
            <div className="relative rounded-[28px] border border-white/10 bg-[#11151f]/90 p-4 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[22px] border border-white/[.07] bg-[#0d1018] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[.18em] text-white/35">Monday, June 23</p>
                    <h2 className="mt-2 font-display text-xl font-semibold">Make today count.</h2>
                  </div>
                  <div className="grid size-11 place-items-center rounded-full border-[5px] border-[#d9ff3e] border-r-white/10 text-xs font-bold">
                    68%
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-[#d9ff3e] p-3 text-[#0b0d12]">
                    <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60">Day</p>
                    <p className="mt-1 font-display text-2xl font-bold">23</p>
                    <p className="mt-1 text-[10px] opacity-60">of 90</p>
                  </div>
                  <div className="rounded-2xl bg-white/[.05] p-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/35">Streak</p>
                    <p className="mt-1 font-display text-2xl font-bold">12</p>
                    <p className="mt-1 text-[10px] text-white/40">days</p>
                  </div>
                  <div className="rounded-2xl bg-white/[.05] p-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/35">Score</p>
                    <p className="mt-1 font-display text-2xl font-bold">824</p>
                    <p className="mt-1 text-[10px] text-white/40">rising</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <PreviewRow label="Learn Java & Backend" value="80%" color="#d9ff3e" />
                  <PreviewRow label="DSA & Problem Solving" value="100%" color="#8291ff" />
                  <PreviewRow label="Fitness & Strength" value="100%" color="#6ee7c8" />
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-white/[.07] pt-4 text-xs text-white/45">
                  <BarChart3 className="size-3.5 text-[#d9ff3e]" /> Your consistency is trending up this week.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mt-28">
          <div className="max-w-xl">
            <p className="eyebrow text-[#d9ff3e]">A simple system for meaningful change</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Small actions. Clear feedback. A better you.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.label} className="surface p-6">
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-2xl bg-white/[.06] text-[#d9ff3e]">
                    <step.icon className="size-5" />
                  </div>
                  <span className="font-display text-4xl font-bold text-white/[.08]">0{index + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold">{step.label}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-[28px] border border-[#d9ff3e]/15 bg-[#d9ff3e]/[.06] p-7 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow text-[#d9ff3e]">Your future self is built daily</p>
              <h2 className="mt-2 font-display text-2xl font-bold">Start with one goal. Keep showing up.</h2>
            </div>
            <button
              onClick={() => {
                setMode("signup");
                setAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#d9ff3e] px-5 py-3 text-sm font-semibold text-[#090b12]"
            >
              Build my journey <Zap className="size-4" />
            </button>
          </div>
        </section>
      </main>

      {authModalOpen && <AuthModal mode={mode} setMode={setMode} onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}

function AuthModal({
  mode,
  setMode,
  onClose,
}: {
  mode: "signin" | "signup";
  setMode: (m: "signin" | "signup") => void;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async data => {
      toast.success("Welcome back to Rise90!");
      if (data?.sessionToken) {
        try {
          sessionStorage.setItem("manus-cookie", `${COOKIE_NAME}=${data.sessionToken}`);
        } catch {}
      }
      utils.auth.me.setData(undefined, data.user);
      await utils.auth.me.invalidate();
      await utils.tracker.state.invalidate();
      onClose();
    },
    onError: err => {
      toast.error(err.message || "Failed to log in.");
    },
  });

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: async data => {
      toast.success("Account created successfully! Welcome to Rise90.");
      if (data?.sessionToken) {
        try {
          sessionStorage.setItem("manus-cookie", `${COOKIE_NAME}=${data.sessionToken}`);
        } catch {}
      }
      utils.auth.me.setData(undefined, data.user);
      await utils.auth.me.invalidate();
      await utils.tracker.state.invalidate();
      onClose();
    },
    onError: err => {
      toast.error(err.message || "Failed to create account.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Email and password are required.");

    if (mode === "signin") {
      loginMutation.mutate({ email, password });
    } else {
      signupMutation.mutate({ email, password, name });
    }
  };

  const isPending = loginMutation.isPending || signupMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1018] p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 grid size-8 place-items-center rounded-xl text-white/40 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-[#d9ff3e] text-[#090b12]">
            <Flame className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">{mode === "signin" ? "Welcome back" : "Join Rise90"}</h2>
            <p className="text-xs text-white/45">
              {mode === "signin" ? "Sign in to track your 90-day progress" : "Create your multi-user account today"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex rounded-2xl bg-white/[.04] p-1 border border-white/[.06]">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
              mode === "signin" ? "bg-[#d9ff3e] text-[#090b12]" : "text-white/60 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${
              mode === "signup" ? "bg-[#d9ff3e] text-[#090b12]" : "text-white/60 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="eyebrow text-white/50">Your name</label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-3.5 size-4 text-white/35" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="quiet-input w-full pl-10"
                />
              </div>
            </div>
          )}

          <div>
            <label className="eyebrow text-white/50">Email address</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-3.5 size-4 text-white/35" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="quiet-input w-full pl-10"
              />
            </div>
          </div>

          <div>
            <label className="eyebrow text-white/50">Password</label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3.5 top-3.5 size-4 text-white/35" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="quiet-input w-full pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 w-full rounded-2xl bg-[#d9ff3e] py-3.5 text-sm font-semibold text-[#090b12] shadow-lg transition hover:bg-[#edff9b] disabled:opacity-50"
          >
            {isPending ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] uppercase tracking-wider text-white/35">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={() => startLogin()}
          className="w-full rounded-2xl border border-white/10 bg-white/[.04] py-3 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          Continue with OAuth
        </button>
      </div>
    </div>
  );
}

function PreviewRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-white/[.06] bg-white/[.025] p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/70">{label}</span>
        <span className="font-medium" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.08]">
        <div className="h-full rounded-full" style={{ width: value, backgroundColor: color }} />
      </div>
    </div>
  );
}

