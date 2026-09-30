"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoverySession, setRecoverySession] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setRecoverySession(true);
      }

      setCheckingSession(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setRecoverySession(true);
        setCheckingSession(false);
        setError("");
        return;
      }

      if (event === "SIGNED_OUT") {
        setRecoverySession(false);
      }
    });

    void checkRecoverySession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!recoverySession) {
      setError("This password reset link is invalid or has expired.");
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setUpdating(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        const message = updateError.message?.toLowerCase() ?? "";

        if (message.includes("same password")) {
          setError("Please choose a different password.");
        } else if (
          message.includes("expired") ||
          message.includes("invalid") ||
          message.includes("session")
        ) {
          setError(
            "This password reset link has expired. Please request a new one.",
          );
        } else {
          setError(
            updateError.message ||
              "Unable to update your password. Please try again.",
          );
        }

        return;
      }

      toast.success("Password updated successfully.");

      // The recovery session is no longer needed after the password change.
      await supabase.auth.signOut({ scope: "local" });

      router.replace("/login?reset=success");
      router.refresh();
    } catch (thrown) {
      console.error("Password reset error:", thrown);
      setError(
        thrown instanceof Error
          ? thrown.message
          : "Unable to update your password. Please try again.",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#100b07] px-5 py-12 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rotate-[18deg] opacity-70 blur-2xl"
            style={{ background: "linear-gradient(115deg, transparent 40%, rgba(232,181,107,0.35) 48%, rgba(232,181,107,0.06) 52%, transparent 60%)" }}
          />
          <div className="absolute -bottom-52 -left-32 h-[520px] w-[520px] rotate-[8deg] opacity-60 blur-2xl"
            style={{ background: "linear-gradient(115deg, transparent 42%, rgba(162,125,55,0.3) 50%, transparent 58%)" }}
          />
          <div className="absolute right-1/3 top-0 h-64 w-64 rounded-full bg-[#a27d37]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-[#7a5a2a]/10 blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#d9b06a]">
            7BucksNutrition
          </p>
          <p className="mt-4 text-xs font-medium text-white/45">
            Verifying your reset link...
          </p>
        </div>
      </main>
    );
  }

  if (!recoverySession) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#100b07] px-5 py-12 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rotate-[18deg] opacity-70 blur-2xl"
            style={{ background: "linear-gradient(115deg, transparent 40%, rgba(232,181,107,0.35) 48%, rgba(232,181,107,0.06) 52%, transparent 60%)" }}
          />
          <div className="absolute -bottom-52 -left-32 h-[520px] w-[520px] rotate-[8deg] opacity-60 blur-2xl"
            style={{ background: "linear-gradient(115deg, transparent 42%, rgba(162,125,55,0.3) 50%, transparent 58%)" }}
          />
          <div className="absolute right-1/3 top-0 h-64 w-64 rounded-full bg-[#a27d37]/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-[#7a5a2a]/10 blur-3xl" />
        </div>

        <Link
          href="/"
          className="group absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/45 shadow-[0_4px_12px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:border-[#a27d37]/40 hover:bg-white/[0.06] hover:text-[#e8b56b] sm:left-8 sm:top-8"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
            ←
          </span>
          Back to Store
        </Link>

        <div className="group relative z-10 w-full max-w-[420px]" style={{ perspective: "1400px" }}>
          <div className="absolute -bottom-8 left-1/2 h-10 w-[85%] -translate-x-1/2 rounded-full bg-black/60 blur-2xl" />

          <div
            className="relative overflow-hidden rounded-[26px] border border-[#a27d37]/30 bg-[#171009]/75 shadow-[0_2px_0_0_rgba(255,255,255,0.05)_inset,0_1px_0_0_rgba(255,255,255,0.08)_inset,0_45px_100px_-20px_rgba(0,0,0,0.75),0_15px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8b56b]/60 to-transparent" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#e8b56b]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-[#a27d37]/10 blur-3xl" />

            <div className="relative flex items-center justify-center gap-3 px-6 pt-6">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#a27d37]/50" />
              <img
                src="/logo/seven-bucks-logo.webp"
                alt="7BucksNutrition"
                className="h-8 w-auto object-contain opacity-90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
              />
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#a27d37]/50" />
            </div>

            <div className="relative px-6 pt-4 text-center sm:px-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#d9b06a]">
                7BucksNutrition
              </p>
              <h1 className="mt-1.5 text-[26px] font-bold leading-[1.02] tracking-[-0.04em] text-[#f5ead9] sm:text-[30px]">
                Reset your{" "}
                <span className="font-serif italic font-normal text-[#e8b56b]">
                  password.
                </span>
              </h1>
            </div>

            <div className="relative mx-6 mt-4 grid grid-cols-2 rounded-xl border border-white/[0.04] bg-black/20 p-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] sm:mx-8">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-center transition hover:bg-white/[0.04]"
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                  Sign In
                </span>
              </Link>
              <Link
                href="/register"
                className="rounded-lg px-3 py-2 text-center transition hover:bg-white/[0.04]"
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                  Create Account
                </span>
              </Link>
            </div>

            <div className="relative px-6 pb-6 pt-5 sm:px-8">
              <div className="rounded-xl border border-[#a27d37]/20 bg-[#e8b56b]/[0.06] px-4 py-3.5 text-center">
                <LockKeyhole className="mx-auto h-5 w-5 text-[#e8b56b]" strokeWidth={1.7} />
                <p className="mt-2 text-xs leading-5 text-white/50">
                  This reset link is invalid, expired, or has already been used.
                </p>
              </div>

              <Link
                href="/login"
                className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-b from-[#e8b56b] to-[#a27d37] text-[10px] font-bold uppercase tracking-[0.2em] text-[#171009] shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Back to Sign In
              </Link>
            </div>

            <div className="border-t border-white/[0.06] px-6 py-4 text-center">
              <p className="text-[9px] font-medium tracking-[0.08em] text-white/25">
                Secure account recovery
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#100b07] px-5 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(rgba(191,150,90,0.55) 1px, transparent 1.5px)",
            backgroundSize: "9px 9px",
          }}
        />
        <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rotate-[18deg] opacity-70 blur-2xl"
          style={{ background: "linear-gradient(115deg, transparent 40%, rgba(232,181,107,0.35) 48%, rgba(232,181,107,0.06) 52%, transparent 60%)" }}
        />
        <div className="absolute -bottom-52 -left-32 h-[520px] w-[520px] rotate-[8deg] opacity-60 blur-2xl"
          style={{ background: "linear-gradient(115deg, transparent 42%, rgba(162,125,55,0.3) 50%, transparent 58%)" }}
        />
        <div className="absolute right-1/3 top-0 h-64 w-64 rounded-full bg-[#a27d37]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-[#7a5a2a]/10 blur-3xl" />
      </div>

      <Link
        href="/"
        className="group absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/45 shadow-[0_4px_12px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:border-[#a27d37]/40 hover:bg-white/[0.06] hover:text-[#e8b56b] sm:left-8 sm:top-8"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
        Back to Store
      </Link>

      <div className="group relative z-10 w-full max-w-[420px]" style={{ perspective: "1400px" }}>
        <div className="absolute -bottom-8 left-1/2 h-10 w-[85%] -translate-x-1/2 rounded-full bg-black/60 blur-2xl" />

        <div
          className="relative overflow-hidden rounded-[26px] border border-[#a27d37]/30 bg-[#171009]/75 shadow-[0_2px_0_0_rgba(255,255,255,0.05)_inset,0_1px_0_0_rgba(255,255,255,0.08)_inset,0_45px_100px_-20px_rgba(0,0,0,0.75),0_15px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-500 ease-out will-change-transform group-hover:[transform:rotateX(1.5deg)_rotateY(-1.5deg)_translateY(-3px)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8b56b]/60 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#e8b56b]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-[#a27d37]/10 blur-3xl" />

          <div className="relative flex items-center justify-center gap-3 px-6 pt-6">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#a27d37]/50" />
            <img
              src="/logo/seven-bucks-logo.webp"
              alt="7BucksNutrition"
              className="h-8 w-auto object-contain opacity-90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#a27d37]/50" />
          </div>

          <div className="relative px-6 pt-4 text-center sm:px-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#d9b06a]">
              7BucksNutrition
            </p>
            <h1 className="mt-1.5 text-[26px] font-bold leading-[1.02] tracking-[-0.04em] text-[#f5ead9] sm:text-[30px]">
              Reset your{" "}
              <span className="font-serif italic font-normal text-[#e8b56b]">
                password.
              </span>
            </h1>
            <p className="mx-auto mt-2 max-w-[330px] text-[11px] leading-5 text-white/35">
              Choose a new password for your account. Your current password will stop working once this change is complete.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="relative space-y-3 px-6 pb-6 pt-5 sm:px-8">
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                className="h-12 w-full rounded-lg border border-black/5 bg-[#faf6ef] px-4 pr-12 text-[13px] font-medium text-[#171009] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_16px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#e8b56b]/60"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((value) => !value)}
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#171009]/45 transition hover:text-[#171009]"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                minLength={MIN_PASSWORD_LENGTH}
                required
                className="h-12 w-full rounded-lg border border-black/5 bg-[#faf6ef] px-4 pr-12 text-[13px] font-medium text-[#171009] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_16px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#e8b56b]/60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#171009]/45 transition hover:text-[#171009]"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2 px-1 pt-1 text-[9px] text-white/35">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#e8b56b]" />
              <span>Use at least {MIN_PASSWORD_LENGTH} characters.</span>
            </div>

            {error && (
              <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-[11px] leading-5 text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={updating}
              className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-[#e8b56b] to-[#a27d37] text-[10px] font-bold uppercase tracking-[0.2em] text-[#171009] shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>{updating ? "Updating password..." : "Update Password"}</span>
              {!updating && (
                <span className="absolute right-5 text-[#171009]/50 transition group-hover:translate-x-1">
                  →
                </span>
              )}
            </button>
          </form>

          <div className="border-t border-white/[0.06] bg-black/10 px-6 py-4 text-center">
            <Link
              href="/login"
              className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d9b06a] transition hover:text-white"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
