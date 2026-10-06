"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { supabase } from "../../lib/supabase";

/* ---------- small UI-only helpers (no logic) ---------- */

const iconProps = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className:
    "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d9b06a]/70",
};

const UserIcon = (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5" />
  </svg>
);
const MailIcon = (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
const LockIcon = (
  <svg {...iconProps}>
    <rect x="5" y="10" width="14" height="10" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);
const CheckLockIcon = (
  <svg {...iconProps}>
    <rect x="5" y="10" width="14" height="10" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <path d="m9.5 15 1.8 1.8 3.2-3.4" />
  </svg>
);

const inputClass =
  "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-3 text-[13px] font-medium text-[#f5ead9] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_2px_8px_rgba(0,0,0,0.35)] outline-none transition-all duration-300 placeholder:text-white/25 hover:border-white/15 focus:border-[#e8b56b]/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(232,181,107,0.10),inset_0_2px_8px_rgba(0,0,0,0.3)]";

// hides non-essential bits on short screens so everything fits in one view
const shortHide = "[@media(max-height:720px)]:hidden";

const keyframes = `
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
`;

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (signupError) {
        const message = signupError.message?.toLowerCase() ?? "";

        if (message.includes("rate limit")) {
          setError(
            "Too many attempts. Please wait a little and try again."
          );
          return;
        }

        if (
          message.includes("password") ||
          message.includes("weak password")
        ) {
          setError(signupError.message);
          return;
        }

        if (
          message.includes("email") ||
          message.includes("already") ||
          message.includes("exist") ||
          message.includes("registered")
        ) {
          setConfirmationSent(true);
          return;
        }

        setError("Unable to complete registration. Please try again.");
        return;
      }

      if (!data.user) {
        setError("Unable to create your account. Please try again.");
        return;
      }

      setConfirmationSent(true);
    } catch (thrown) {
      console.error("Registration error:", thrown);

      setError("Unable to complete registration. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     SHARED BACKGROUND + BACK BUTTON (plain JSX, not components,
     so they don't remount while typing)
  ======================================================= */

  const background = (
    <div className="pointer-events-none absolute inset-0">
      <style>{keyframes}</style>
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
  );

  const backToStore = (
    <Link
      href="/"
      className="group absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 backdrop-blur-md transition-all duration-300 hover:border-[#e8b56b]/40 hover:bg-white/[0.08] hover:text-[#f0c98a] sm:left-8 sm:top-6 sm:text-[10px]"
    >
      <span className="transition-transform duration-300 group-hover:-translate-x-1">
        ←
      </span>
      Back to Store
    </Link>
  );

  const cardFrame = (children: React.ReactNode, maxW: string) => (
    <div
      className={`relative z-10 mt-8 w-full ${maxW} sm:mt-0`}
      style={{ animation: "sb-rise 0.8s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <div className="absolute -inset-5 rounded-[40px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(232,181,107,0.18),transparent_70%)] blur-2xl" />

      <div className="relative rounded-[26px] bg-gradient-to-b from-[#e8b56b]/50 via-[#a27d37]/15 to-[#e8b56b]/25 p-px shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
        <div className="relative overflow-hidden rounded-[25px] bg-[#120c07]/90 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#f0c98a]/80 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#e8b56b]/[0.12] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[#a27d37]/10 blur-3xl" />
          {children}
        </div>
      </div>
    </div>
  );

  const shell =
    "fixed inset-0 z-50 flex h-[100dvh] items-center justify-center overflow-hidden bg-[#080504] px-4";

  /* =======================================================
     EMAIL CONFIRMATION SCREEN
  ======================================================= */

  if (confirmationSent) {
    return (
      <div className={shell}>
        {background}
        {backToStore}

        {cardFrame(
          <div className="relative px-6 py-7 text-center sm:px-9">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#e8b56b]/25 bg-gradient-to-b from-[#e8b56b]/20 to-[#e8b56b]/5 shadow-[0_12px_30px_-8px_rgba(232,181,107,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#f0c98a]"
              >
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </div>

            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.32em] text-[#d9b06a]">
              Verify your email
            </p>

            <h1 className="mt-1.5 text-[28px] font-bold leading-none tracking-[-0.045em] text-[#f7ecd9] sm:text-[32px]">
              Check your{" "}
              <span className="bg-gradient-to-b from-[#f6d9a0] to-[#d9a050] bg-clip-text font-serif font-normal italic text-transparent">
                inbox.
              </span>
            </h1>

            <p className="mt-3 text-[12px] leading-5 text-white/40">
              We&apos;ve sent a verification link to
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-[#f0c98a]">
              {email}
            </p>

            <div className="mt-4 rounded-xl border border-[#e8b56b]/15 bg-[#e8b56b]/[0.05] px-4 py-3 text-left">
              <div className="flex gap-2.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0 text-[#e8b56b]"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5" />
                  <path d="M12 8h.01" />
                </svg>
                <p className="text-[11px] leading-[1.15rem] text-white/45">
                  Please verify your email before signing in. Check
                  spam/junk if you don&apos;t see it.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="group/btn relative mt-5 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#f3c37e] via-[#e3a455] to-[#c98433] text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#1d1007] shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_32px_-10px_rgba(227,164,85,0.6),0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover/btn:opacity-100 group-hover/btn:[animation:sb-shine_0.9s_ease-out]" />
              <span className="relative z-10">Go to Sign In</span>
            </Link>

            <Link
              href="/"
              className="mt-4 block text-[9px] font-bold uppercase tracking-[0.16em] text-white/30 transition hover:text-white/60"
            >
              Back to Store
            </Link>
          </div>,
          "max-w-[400px]"
        )}
      </div>
    );
  }

  /* =======================================================
     REGISTRATION FORM
  ======================================================= */

  return (
    <div className={shell}>
      {background}
      {backToStore}

      {cardFrame(
        <>
          {/* Header */}
          <div className="relative px-6 pt-5 text-center sm:px-8">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8b56b]/25 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-[0_8px_24px_-8px_rgba(232,181,107,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <img
                src="/logo/seven-bucks-logo.webp"
                alt="Seven Bucks Nutrition"
                className="h-5 w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
              />
            </div>

            <p
              className={`mt-2.5 text-[9px] font-semibold uppercase tracking-[0.36em] text-[#d9b06a] ${shortHide}`}
            >
              Seven Bucks Nutrition
            </p>
            <h1 className="mt-1.5 text-[26px] font-bold leading-none tracking-[-0.045em] text-[#f7ecd9] sm:text-[30px]">
              Start your{" "}
              <span className="bg-gradient-to-b from-[#f6d9a0] to-[#d9a050] bg-clip-text font-serif font-normal italic text-transparent">
                journey.
              </span>
            </h1>
          </div>

          {/* Switch */}
          <div className="relative mx-6 mt-3.5 grid grid-cols-2 rounded-xl border border-white/[0.06] bg-black/30 p-1 sm:mx-8">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-center transition hover:bg-white/[0.05]"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                Sign In
              </span>
            </Link>
            <div className="rounded-lg bg-gradient-to-b from-[#e8b56b]/25 to-[#e8b56b]/10 px-3 py-2 text-center shadow-[0_4px_14px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f6d9a0]">
                Create Account
              </span>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="relative space-y-2.5 px-6 pb-4 pt-3.5 sm:px-8"
          >
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="relative">
                {UserIcon}
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  required
                  aria-label="Full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>

              <div className="relative">
                {MailIcon}
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-label="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="relative">
              {LockIcon}
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password (min. 8 characters)"
                className={inputClass}
              />
            </div>

            <div className="relative">
              {CheckLockIcon}
              <input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-label="Confirm password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm password"
                className={inputClass}
              />
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
                {loading ? "Creating account..." : "Create Account"}
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
                <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35">
                Your information stays protected
              </span>
            </div>
          </form>

          {/* Footer */}
          <div className="relative flex items-center justify-between gap-3 border-t border-white/[0.06] bg-black/20 px-6 py-3 sm:px-8">
            <p className="text-[11px] text-white/40">Already have an account?</p>
            <Link
              href="/login"
              className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e8b56b] transition hover:text-[#f6d9a0]"
            >
              Sign in →
            </Link>
          </div>
        </>,
        "max-w-[430px]"
      )}
    </div>
  );
}