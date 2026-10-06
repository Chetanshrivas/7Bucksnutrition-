"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "../../lib/supabase";
import { getCurrentAppOrigin } from "../../lib/auth-url-helper";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleForgotPassword() {
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Enter your email address first.");
      return;
    }

    if (resetLoading || loading) return;

    setResetLoading(true);

    try {
      const redirectTo =
        `${getCurrentAppOrigin()}/reset-password`;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo,
          }
        );

      if (resetError) {
        console.error(
          "Password reset error:",
          resetError
        );

        setError(
          resetError.message ||
          "Unable to send the password reset email. Please try again."
        );

        return;
      }

      toast.success(
        "Password reset email sent. Please check your inbox."
      );
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to send the password reset email. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  }

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

  const inputClass =
    "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-3 text-[13px] font-medium text-[#f5ead9] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_2px_8px_rgba(0,0,0,0.35)] outline-none transition-all duration-300 placeholder:text-white/25 hover:border-white/15 focus:border-[#e8b56b]/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(232,181,107,0.10),inset_0_2px_8px_rgba(0,0,0,0.3)]";

  // hides non-essential bits on short screens so everything fits in one view
  const shortHide = "[@media(max-height:660px)]:hidden";

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] items-center justify-center overflow-hidden bg-[#080504] px-4">
      <style>{`
        @keyframes sb-rise {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sb-drift {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(24px,-18px,0); }
        }
        @keyframes sb-shine {
          from { transform: translateX(-120%) skewX(-20deg); }
          to { transform: translateX(520%) skewX(-20deg); }
        }
      `}</style>

      {/* ===== BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_-10%,#2e1f10_0%,#140d07_45%,#080504_100%)]" />

        <div
          className="absolute -left-24 top-1/4 h-[380px] w-[380px] rounded-full bg-[#c8913f]/[0.13] blur-[110px]"
          style={{ animation: "sb-drift 14s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-[#a27d37]/[0.12] blur-[120px]"
          style={{ animation: "sb-drift 18s ease-in-out infinite reverse" }}
        />

        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,181,107,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(232,181,107,0.045) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 65% 60% at 50% 45%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 65% 60% at 50% 45%, black 20%, transparent 75%)",
          }}
        />

        <span
          aria-hidden
          className="absolute -left-6 -top-8 hidden select-none text-[13rem] font-black uppercase leading-none tracking-tight text-transparent md:block"
          style={{ WebkitTextStroke: "1px rgba(232,181,107,0.08)" }}
        >
          Power
        </span>
        <span
          aria-hidden
          className="absolute -bottom-12 -right-4 hidden select-none text-[11rem] font-black uppercase leading-none tracking-tight text-transparent md:block"
          style={{ WebkitTextStroke: "1px rgba(232,181,107,0.07)" }}
        >
          Gains
        </span>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
      </div>

      {/* ===== BACK TO STORE ===== */}
      <Link
        href="/"
        className="group absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 backdrop-blur-md transition-all duration-300 hover:border-[#e8b56b]/40 hover:bg-white/[0.08] hover:text-[#f0c98a] sm:left-8 sm:top-6 sm:text-[10px]"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">
          ←
        </span>
        Back to Store
      </Link>

      {/* ===== CARD ===== */}
      <div
        className="relative z-10 mt-8 w-full max-w-[400px] sm:mt-0"
        style={{ animation: "sb-rise 0.8s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="absolute -inset-5 rounded-[40px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(232,181,107,0.18),transparent_70%)] blur-2xl" />

        <div className="relative rounded-[26px] bg-gradient-to-b from-[#e8b56b]/50 via-[#a27d37]/15 to-[#e8b56b]/25 p-px shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
          <div className="relative overflow-hidden rounded-[25px] bg-[#120c07]/90 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#f0c98a]/80 to-transparent" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#e8b56b]/[0.12] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[#a27d37]/10 blur-3xl" />

            {/* Header */}
            <div className="relative px-6 pt-6 text-center sm:px-8">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8b56b]/25 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-[0_8px_24px_-8px_rgba(232,181,107,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <img
                  src="/logo/seven-bucks-logo.webp"
                  alt="Seven Bucks Nutrition"
                  className="h-5 w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                />
              </div>

              <p
                className={`mt-3 text-[9px] font-semibold uppercase tracking-[0.36em] text-[#d9b06a] ${shortHide}`}
              >
                Seven Bucks Nutrition
              </p>
              <h1 className="mt-1.5 text-[28px] font-bold leading-none tracking-[-0.045em] text-[#f7ecd9] sm:text-[32px]">
                Welcome{" "}
                <span className="bg-gradient-to-b from-[#f6d9a0] to-[#d9a050] bg-clip-text font-serif font-normal italic text-transparent">
                  back.
                </span>
              </h1>
              <p className={`mt-2 text-[11.5px] leading-4 text-white/40 ${shortHide}`}>
                Sign in to track orders and checkout faster.
              </p>
            </div>

            {/* Switch */}
            <div className="relative mx-6 mt-4 grid grid-cols-2 rounded-xl border border-white/[0.06] bg-black/30 p-1 sm:mx-8">
              <div className="rounded-lg bg-gradient-to-b from-[#e8b56b]/25 to-[#e8b56b]/10 px-3 py-2 text-center shadow-[0_4px_14px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f6d9a0]">
                  Sign In
                </span>
              </div>
              <Link
                href="/register"
                className="rounded-lg px-3 py-2 text-center transition hover:bg-white/[0.05]"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                  Create Account
                </span>
              </Link>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="relative space-y-3 px-6 pb-5 pt-4 sm:px-8"
            >
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45"
                >
                  Email
                </label>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d9b06a]/70"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading || loading}
                    className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#d9b06a] transition hover:text-[#f6d9a0] disabled:opacity-50"
                  >
                    {resetLoading ? "Sending..." : "Forgot password?"}
                  </button>
                </div>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d9b06a]/70"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="5" y="10" width="14" height="10" rx="2.5" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className={inputClass}
                  />
                </div>
              </div>

              {error && (
                <div className="flex gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-[11px] leading-4 text-red-300">
                  <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-400/20 text-[10px] font-bold">
                    !
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group/btn relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#f3c37e] via-[#e3a455] to-[#c98433] text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#1d1007] shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_32px_-10px_rgba(227,164,85,0.6),0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_20px_40px_-10px_rgba(227,164,85,0.75),0_6px_16px_rgba(0,0,0,0.45)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover/btn:opacity-100 group-hover/btn:[animation:sb-shine_0.9s_ease-out]" />
                <span className="relative z-10">
                  {loading ? "Signing in..." : "Sign In Securely"}
                </span>
                {!loading && (
                  <span className="absolute right-5 text-base transition-transform duration-300 group-hover/btn:translate-x-1">
                    →
                  </span>
                )}
              </button>

              <div className={`flex items-center justify-center gap-2 ${shortHide}`}>
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
                <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">
                  Your account is securely protected
                </span>
              </div>
            </form>

            {/* Footer */}
            <div className="relative flex items-center justify-between gap-3 border-t border-white/[0.06] bg-black/20 px-6 py-3 sm:px-8">
              <Link
                href="/register"
                className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#e8b56b] transition hover:text-[#f6d9a0]"
              >
                New here? Create account →
              </Link>

              <Link
                href="/admin/login"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-white/40 transition hover:border-[#e8b56b]/40 hover:text-[#e8b56b]"
              >
                <span className="h-1 w-1 rounded-full bg-[#a27d37]" />
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}