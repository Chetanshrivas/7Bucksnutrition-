"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { supabase } from "../../lib/supabase";

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
     BACKGROUND — shared visual language across both screens
  ======================================================= */
  const Background = () => (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_10%,#2a1c0f_0%,#150e08_45%,#0a0605_100%)]" />

      {/* fitness themed ghost words */}
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

      <div
        className="absolute bottom-6 left-6 h-16 w-16 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(191,150,90,0.55) 1px, transparent 1.5px)",
          backgroundSize: "9px 9px",
        }}
      />

      <div className="absolute right-1/3 top-0 h-64 w-64 rounded-full bg-[#a27d37]/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-[#7a5a2a]/10 blur-3xl" />
    </div>
  );

  const BackToStore = () => (
    <Link
      href="/"
      className="group absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/45 shadow-[0_4px_12px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:border-[#a27d37]/40 hover:bg-white/[0.06] hover:text-[#e8b56b] sm:left-8 sm:top-8"
    >
      <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
        ←
      </span>
      Back to Store
    </Link>
  );

  const inputClip = {
    clipPath: "polygon(0 0, 100% 0, 100% 72%, 91% 100%, 0 100%)",
  };

  const CornerAccent = () => (
    <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 bg-gradient-to-bl from-[#e8b56b] to-[#a27d37] shadow-[0_2px_4px_rgba(0,0,0,0.3)] [clip-path:polygon(100%_0,100%_100%,0_0)]" />
  );

  /* =======================================================
     EMAIL CONFIRMATION SCREEN
  ======================================================= */

  if (confirmationSent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0c0805] px-4 py-4">
        <Background />
        <BackToStore />

        <div
          className="group relative z-10 w-full max-w-[440px]"
          style={{ perspective: "1400px" }}
        >
          <div className="absolute -bottom-8 left-1/2 h-10 w-[85%] -translate-x-1/2 rounded-full bg-black/60 blur-2xl" />

          <div
            className="relative overflow-hidden rounded-[26px] border border-[#a27d37]/30 bg-[#171009]/75 shadow-[0_2px_0_0_rgba(255,255,255,0.05)_inset,0_1px_0_0_rgba(255,255,255,0.08)_inset,0_45px_100px_-20px_rgba(0,0,0,0.75),0_15px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-500 ease-out will-change-transform group-hover:[transform:rotateX(1.5deg)_rotateY(-1.5deg)_translateY(-3px)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8b56b]/60 to-transparent" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#e8b56b]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-[#a27d37]/10 blur-3xl" />

            <div className="relative px-6 py-8 text-center sm:px-10 sm:py-9">
              <Link href="/" className="mx-auto flex w-fit items-center justify-center">
                <img
                  src="/logo/seven-bucks-logo.webp"
                  alt="Seven Bucks Nutrition"
                  className="h-9 w-auto object-contain opacity-90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                />
              </Link>

              <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#a27d37]/25 bg-[#e8b56b]/10 shadow-[0_10px_24px_-6px_rgba(232,181,107,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#e8b56b]"
                >
                  <path d="M4 5h16v14H4z" />
                  <path d="m4 6 8 6 8-6" />
                </svg>
              </div>

              <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#d9b06a]">
                Verify your email
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#f5ead9] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-[26px]">
                Check your inbox.
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-[12px] leading-5 text-white/40">
                We&apos;ve sent a verification link to
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-[#f0c98a]">
                {email}
              </p>

              <div className="mx-auto mt-5 max-w-sm rounded-xl border border-[#a27d37]/20 bg-[#e8b56b]/[0.06] px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
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
                  <p className="text-[10.5px] leading-5 text-white/45">
                    Please verify your email before signing in. Check
                    spam/junk if you don&apos;t see it.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="mt-6 inline-flex h-11 w-full max-w-xs items-center justify-center rounded-xl bg-gradient-to-b from-[#eea377] to-[#d9713c] px-8 text-[10px] font-bold uppercase tracking-[0.18em] text-[#20110a] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_10px_26px_-6px_rgba(217,113,60,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_34px_-6px_rgba(217,113,60,0.65)]"
              >
                Go to Sign In
              </Link>

              <Link
                href="/"
                className="mt-4 block text-[9px] font-bold uppercase tracking-[0.16em] text-white/30 transition hover:text-white/60"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     REGISTRATION FORM
  ======================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0c0805] px-4 py-4">
      <Background />
      <BackToStore />

      <div
        className="group relative z-10 w-full max-w-[460px]"
        style={{ perspective: "1400px" }}
      >
        <div className="absolute -bottom-8 left-1/2 h-10 w-[85%] -translate-x-1/2 rounded-full bg-black/60 blur-2xl" />

        <div
          className="relative overflow-hidden rounded-[26px] border border-[#a27d37]/30 bg-[#171009]/75 shadow-[0_2px_0_0_rgba(255,255,255,0.05)_inset,0_1px_0_0_rgba(255,255,255,0.08)_inset,0_45px_100px_-20px_rgba(0,0,0,0.75),0_15px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-500 ease-out will-change-transform group-hover:[transform:rotateX(1.5deg)_rotateY(-1.5deg)_translateY(-3px)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8b56b]/60 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#e8b56b]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-[#a27d37]/10 blur-3xl" />

          {/* Emblem header */}
          <div className="relative flex items-center justify-center gap-3 px-6 pt-5">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#a27d37]/50" />
            <img
              src="/logo/seven-bucks-logo.webp"
              alt="Seven Bucks Nutrition"
              className="h-7 w-auto object-contain opacity-90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#a27d37]/50" />
          </div>

          <div className="relative px-6 pt-3 text-center sm:px-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#d9b06a]">
              Seven Bucks Nutrition
            </p>
            <h1 className="mt-1 text-[22px] font-bold leading-[1.02] tracking-[-0.04em] text-[#f5ead9] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-[25px]">
              Start your{" "}
              <span className="font-serif italic font-normal text-[#e8b56b]">
                journey.
              </span>
            </h1>
          </div>

          {/* Switch */}
          <div className="relative mx-6 mt-3 grid grid-cols-2 rounded-xl border border-white/[0.04] bg-black/20 p-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] sm:mx-8">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-center transition hover:bg-white/[0.04]"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                Sign In
              </span>
            </Link>
            <div className="rounded-lg bg-gradient-to-b from-[#e8b56b]/25 to-[#e8b56b]/10 px-3 py-2 text-center shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#f0c98a]">
                Create Account
              </span>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="relative space-y-2.5 px-6 pb-5 pt-4 sm:px-8"
          >
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full name"
                  className="h-11 w-full rounded-lg border border-black/5 bg-[#faf6ef] px-3.5 text-[12.5px] font-medium text-[#171009] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_16px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#e8b56b]/60"
                  style={inputClip}
                />
                <CornerAccent />
              </div>

              <div className="relative">
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  className="h-11 w-full rounded-lg border border-black/5 bg-[#faf6ef] px-3.5 text-[12.5px] font-medium text-[#171009] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_16px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#e8b56b]/60"
                  style={inputClip}
                />
                <CornerAccent />
              </div>
            </div>

            <div className="relative">
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password (min. 8 characters)"
                className="h-11 w-full rounded-lg border border-black/5 bg-[#faf6ef] px-3.5 text-[12.5px] font-medium text-[#171009] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_16px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#e8b56b]/60"
                style={inputClip}
              />
              <CornerAccent />
            </div>

            <div className="relative">
              <input
                id="register-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm password"
                className="h-11 w-full rounded-lg border border-black/5 bg-[#faf6ef] px-3.5 text-[12.5px] font-medium text-[#171009] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_16px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#e8b56b]/60"
                style={inputClip}
              />
              <CornerAccent />
            </div>

            {error && (
              <div className="flex gap-2 rounded-lg border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-[11px] leading-5 text-red-300 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                <span className="mt-0.5 shrink-0 font-bold">!</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group/btn relative flex h-11 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#eea377] to-[#d9713c] text-[10px] font-bold uppercase tracking-[0.2em] text-[#20110a] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_10px_26px_-6px_rgba(217,113,60,0.55),0_4px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_34px_-6px_rgba(217,113,60,0.65),0_6px_14px_rgba(0,0,0,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                clipPath:
                  "polygon(0 0, 96% 0, 100% 35%, 100% 100%, 0 100%)",
              }}
            >
              <span className="relative z-10">
                {loading ? "Creating account..." : "Create Account"}
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
                <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="text-[8.5px] font-medium uppercase tracking-[0.1em] text-white/35">
                Your information stays protected
              </span>
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-white/[0.06] bg-black/10 px-6 py-3 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] text-white/35">
                Already have an account?
              </p>
              <Link
                href="/login"
                className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#e8b56b] transition hover:text-[#f0c98a]"
              >
                Sign in →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}