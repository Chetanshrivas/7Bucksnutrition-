"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "../../lib/supabase";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) {
        if (
          loginError.message
            .toLowerCase()
            .includes("email not confirmed")
        ) {
          setError("Please verify your email before signing in.");
        } else {
          setError(loginError.message);
        }

        return;
      }

      if (!data.user) {
        setError("Unable to sign in. Please try again.");
        return;
      }

      const { data: customer, error: customerError } =
        await supabase
          .from("customers")
          .select("full_name, role")
          .eq("id", data.user.id)
          .maybeSingle();

      if (customerError) {
        console.error("Customer profile error:", customerError);
      }

      const customerName =
        customer?.full_name?.trim() ||
        data.user.user_metadata?.full_name?.trim() ||
        data.user.email?.split("@")[0] ||
        "there";

      toast.success(`Welcome back, ${customerName}`);

      router.replace("/account");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0c0805] px-4 py-4">
      {/* ===== BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0">
        {/* base gradient wash */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_10%,#2a1c0f_0%,#150e08_45%,#0a0605_100%)]" />

        {/* giant faint background words — fitness themed */}
        <span
          aria-hidden
          className="absolute -left-4 -top-6 select-none text-[8rem] font-black uppercase leading-none tracking-tight text-transparent sm:text-[11rem]"
          style={{ WebkitTextStroke: "1px rgba(191,150,90,0.14)" }}
        >
          Power
        </span>
        <span
          aria-hidden
          className="absolute -bottom-10 left-0 select-none text-[7rem] font-black uppercase leading-none tracking-tight text-transparent sm:text-[9.5rem]"
          style={{ WebkitTextStroke: "1px rgba(191,150,90,0.12)" }}
        >
          Gains
        </span>
        <span
          aria-hidden
          className="absolute -right-6 top-1/3 hidden -translate-y-1/2 select-none text-[6rem] font-black uppercase leading-none tracking-tight text-transparent sm:block sm:text-[7.5rem]"
          style={{ WebkitTextStroke: "1px rgba(191,150,90,0.08)" }}
        >
          Fuel
        </span>

        {/* diagonal light streaks */}
        <div
          className="absolute -right-40 -top-40 h-[560px] w-[560px] rotate-[18deg] opacity-70 blur-2xl"
          style={{
            background:
              "linear-gradient(115deg, transparent 40%, rgba(232,181,107,0.35) 48%, rgba(232,181,107,0.06) 52%, transparent 60%)",
          }}
        />
        <div
          className="absolute -bottom-52 -left-32 h-[520px] w-[520px] rotate-[8deg] opacity-60 blur-2xl"
          style={{
            background:
              "linear-gradient(115deg, transparent 42%, rgba(162,125,55,0.3) 50%, transparent 58%)",
          }}
        />

        {/* dotted grid, bottom-left */}
        <div
          className="absolute bottom-6 left-6 h-16 w-16 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(191,150,90,0.55) 1px, transparent 1.5px)",
            backgroundSize: "9px 9px",
          }}
        />

        {/* soft glow orbs */}
        <div className="absolute right-1/3 top-0 h-64 w-64 rounded-full bg-[#a27d37]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-[#7a5a2a]/10 blur-3xl" />
      </div>

      {/* ===== BACK TO STORE ===== */}
      <Link
        href="/"
        className="group absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/45 shadow-[0_4px_12px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:border-[#a27d37]/40 hover:bg-white/[0.06] hover:text-[#e8b56b] sm:left-8 sm:top-8"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
          ←
        </span>
        Back to Store
      </Link>

      {/* ===== CARD ===== */}
      <div
        className="group relative z-10 w-full max-w-[420px]"
        style={{ perspective: "1400px" }}
      >
        {/* floor shadow — sells the "floating" feel */}
        <div className="absolute -bottom-8 left-1/2 h-10 w-[85%] -translate-x-1/2 rounded-full bg-black/60 blur-2xl" />

        <div
          className="relative overflow-hidden rounded-[26px] border border-[#a27d37]/30 bg-[#171009]/75 shadow-[0_2px_0_0_rgba(255,255,255,0.05)_inset,0_1px_0_0_rgba(255,255,255,0.08)_inset,0_45px_100px_-20px_rgba(0,0,0,0.75),0_15px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-500 ease-out will-change-transform group-hover:[transform:rotateX(1.5deg)_rotateY(-1.5deg)_translateY(-3px)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* top hairline highlight — simulates light hitting the top edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8b56b]/60 to-transparent" />

          {/* inner glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#e8b56b]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-[#a27d37]/10 blur-3xl" />

          {/* Emblem header */}
          <div className="relative flex items-center justify-center gap-3 px-6 pt-6">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#a27d37]/50" />
            <img
              src="/logo/seven-bucks-logo.webp"
              alt="Seven Bucks Nutrition"
              className="h-8 w-auto object-contain opacity-90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#a27d37]/50" />
          </div>

          <div className="relative px-6 pt-4 text-center sm:px-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#d9b06a]">
              Seven Bucks Nutrition
            </p>
            <h1 className="mt-1.5 text-[26px] font-bold leading-[1.02] tracking-[-0.04em] text-[#f5ead9] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-[30px]">
              Welcome{" "}
              <span className="font-serif italic font-normal text-[#e8b56b]">
                back.
              </span>
            </h1>
          </div>

          {/* Switch */}
          <div className="relative mx-6 mt-4 grid grid-cols-2 rounded-xl border border-white/[0.04] bg-black/20 p-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] sm:mx-8">
            <div className="rounded-lg bg-gradient-to-b from-[#e8b56b]/25 to-[#e8b56b]/10 px-3 py-2 text-center shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f0c98a]">
                Sign In
              </span>
            </div>
            <Link
              href="/register"
              className="rounded-lg px-3 py-2 text-center transition hover:bg-white/[0.04]"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                Create Account
              </span>
            </Link>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="relative space-y-3 px-6 pb-6 pt-5 sm:px-8"
          >
            <div className="relative">
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="h-12 w-full rounded-lg border border-black/5 bg-[#faf6ef] px-4 text-[13px] font-medium text-[#171009] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_16px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#e8b56b]/60"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 72%, 91% 100%, 0 100%)",
                }}
              />
              <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 bg-gradient-to-bl from-[#e8b56b] to-[#a27d37] shadow-[0_2px_4px_rgba(0,0,0,0.3)] [clip-path:polygon(100%_0,100%_100%,0_0)]" />
            </div>

            <div className="relative">
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="h-12 w-full rounded-lg border border-black/5 bg-[#faf6ef] px-4 text-[13px] font-medium text-[#171009] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_16px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#e8b56b]/60"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 72%, 91% 100%, 0 100%)",
                }}
              />
              <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 bg-gradient-to-bl from-[#e8b56b] to-[#a27d37] shadow-[0_2px_4px_rgba(0,0,0,0.3)] [clip-path:polygon(100%_0,100%_100%,0_0)]" />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setError("Password reset will be connected next.")
                }
                className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#d9b06a] transition hover:text-[#f0c98a]"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="flex gap-2 rounded-lg border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[11px] leading-5 text-red-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                <span className="mt-0.5 shrink-0">!</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group/btn relative flex h-12 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#eea377] to-[#d9713c] text-[10px] font-bold uppercase tracking-[0.2em] text-[#20110a] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_10px_26px_-6px_rgba(217,113,60,0.55),0_4px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_34px_-6px_rgba(217,113,60,0.65),0_6px_14px_rgba(0,0,0,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                clipPath:
                  "polygon(0 0, 96% 0, 100% 35%, 100% 100%, 0 100%)",
              }}
            >
              <span className="relative z-10">
                {loading ? "Signing in..." : "Sign In Securely"}
              </span>
              {!loading && (
                <span className="absolute right-5 transition group-hover/btn:translate-x-1">
                  →
                </span>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pt-0.5">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-[#d9b06a]"
              >
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <span className="text-[8.5px] font-medium uppercase tracking-[0.1em] text-white/35">
                Your account is securely protected
              </span>
            </div>
          </form>

          {/* Footer */}
          <div className="relative border-t border-white/[0.06] bg-black/10 px-6 py-3.5 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] text-white/35">
                New to Seven Bucks?
              </p>
              <Link
                href="/register"
                className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#e8b56b] transition hover:text-[#f0c98a]"
              >
                Create account →
              </Link>
            </div>

            <div className="mt-2.5 flex justify-end">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[5.5px] font-bold uppercase tracking-[0.14em] text-white/40 shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition hover:border-[#a27d37]/40 hover:text-[#e8b56b]"
              >
                <span className="h-1 w-1 rounded-full bg-[#a27d37]" />
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}