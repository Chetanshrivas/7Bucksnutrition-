"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "../../lib/supabase";

export default function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      toast.error("Please enter your admin credentials.");
      return;
    }

    setLoading(true);

    try {
      /*
       * STEP 1
       * Authenticate with Supabase.
       */
      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginError || !data.user) {
        toast.error(
          loginError?.message ??
            "Invalid administrator credentials."
        );

        setLoading(false);
        return;
      }

      /*
       * STEP 2
       * Verify that this authenticated user is
       * actually an active administrator.
       */
      const {
        data: customer,
        error: roleError,
      } = await supabase
        .from("customers")
        .select("id, role, is_active, full_name, email")
        .eq("id", data.user.id)
        .maybeSingle();

      if (roleError) {
        console.error(
          "Admin role verification error:",
          roleError
        );

        await supabase.auth.signOut();

        toast.error(
          "Unable to verify administrator access."
        );

        setLoading(false);
        return;
      }

      if (!customer) {
        await supabase.auth.signOut();

        toast.error(
          "Your account profile could not be found."
        );

        setLoading(false);
        return;
      }

      /*
       * Account must be:
       * role = admin
       * is_active = true
       */
      if (
        customer.role !== "admin" ||
        customer.is_active !== true
      ) {
        await supabase.auth.signOut();

        toast.error(
          "This account does not have administrator access."
        );

        setLoading(false);
        return;
      }

      /*
       * SUCCESS
       *
       * Show a Sonner notification instead of
       * rendering a green message inside the form.
       */
      toast.success("Admin access granted.", {
        duration: 1400,
      });

      /*
       * Give Sonner a short moment to render,
       * then go directly to the admin dashboard.
       */
      setTimeout(() => {
        router.replace("/admin");
      }, 300);
    } catch (error) {
      console.error("Admin login failed:", error);

      await supabase.auth.signOut();

      toast.error(
        "Something went wrong while signing in."
      );

      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0c0805] px-4 py-4">
      {/* ===== BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0">
        {/* base gradient wash */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_10%,#2a1c0f_0%,#150e08_45%,#0a0605_100%)]" />

        {/* giant faint background words */}
        <span
          aria-hidden
          className="absolute -right-4 -top-6 select-none text-[8rem] font-black uppercase leading-none tracking-tight text-transparent sm:text-[11rem]"
          style={{ WebkitTextStroke: "1px rgba(191,150,90,0.14)" }}
        >
          Forge
        </span>
        <span
          aria-hidden
          className="absolute -bottom-10 right-0 select-none text-[7rem] font-black uppercase leading-none tracking-tight text-transparent sm:text-[9.5rem]"
          style={{ WebkitTextStroke: "1px rgba(191,150,90,0.12)" }}
        >
          Grind
        </span>
        <span
          aria-hidden
          className="absolute -left-6 top-1/3 hidden -translate-y-1/2 select-none text-[6rem] font-black uppercase leading-none tracking-tight text-transparent sm:block sm:text-[7.5rem]"
          style={{ WebkitTextStroke: "1px rgba(191,150,90,0.08)" }}
        >
          Fuel
        </span>

        {/* diagonal light streaks */}
        <div
          className="absolute -left-40 -top-40 h-[560px] w-[560px] rotate-[-18deg] opacity-70 blur-2xl"
          style={{
            background:
              "linear-gradient(115deg, transparent 40%, rgba(232,181,107,0.3) 48%, rgba(232,181,107,0.05) 52%, transparent 60%)",
          }}
        />
        <div
          className="absolute -bottom-52 -right-32 h-[520px] w-[520px] rotate-[-8deg] opacity-60 blur-2xl"
          style={{
            background:
              "linear-gradient(115deg, transparent 42%, rgba(162,125,55,0.3) 50%, transparent 58%)",
          }}
        />

        {/* dotted grid, bottom-right */}
        <div
          className="absolute bottom-6 right-6 h-16 w-16 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(191,150,90,0.55) 1px, transparent 1.5px)",
            backgroundSize: "9px 9px",
          }}
        />

        {/* soft glow orbs */}
        <div className="absolute left-1/3 top-0 h-64 w-64 rounded-full bg-[#a27d37]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#7a5a2a]/10 blur-3xl" />
      </div>

      {/* ===== CARD ===== */}
      <div
        className="group relative z-10 w-full max-w-[420px]"
        style={{ perspective: "1400px" }}
      >
        {/* floor shadow — sells the "floating" feel */}
        <div className="absolute -bottom-8 left-1/2 h-10 w-[85%] -translate-x-1/2 rounded-full bg-black/60 blur-2xl" />

        <div
          className="relative overflow-hidden rounded-[26px] border border-[#a27d37]/30 bg-[#171009]/75 shadow-[0_2px_0_0_rgba(255,255,255,0.05)_inset,0_1px_0_0_rgba(255,255,255,0.08)_inset,0_45px_100px_-20px_rgba(0,0,0,0.75),0_15px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-500 ease-out will-change-transform group-hover:[transform:rotateX(1.5deg)_rotateY(1.5deg)_translateY(-3px)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* top hairline highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e8b56b]/60 to-transparent" />

          {/* inner glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-44 w-44 rounded-full bg-[#e8b56b]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-[#a27d37]/10 blur-3xl" />

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
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#a27d37]/25 bg-[#e8b56b]/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-[#e8b56b]"
              >
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#f0c98a]">
                Admin Portal · Restricted
              </span>
            </div>

            <h1 className="mt-3.5 text-[26px] font-bold leading-[1.02] tracking-[-0.04em] text-[#f5ead9] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-[30px]">
              Control{" "}
              <span className="font-serif italic font-normal text-[#e8b56b]">
                starts here.
              </span>
            </h1>

            <p className="mt-2.5 text-[11px] leading-5 text-white/35">
              Sign in with your administrator account.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="relative space-y-3 px-6 pb-6 pt-5 sm:px-8"
          >
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Admin email"
                disabled={loading}
                className="h-12 w-full rounded-lg border border-black/5 bg-[#faf6ef] px-4 text-[13px] font-medium text-[#171009] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_16px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#e8b56b]/60 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 72%, 91% 100%, 0 100%)",
                }}
              />
              <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 bg-gradient-to-bl from-[#e8b56b] to-[#a27d37] shadow-[0_2px_4px_rgba(0,0,0,0.3)] [clip-path:polygon(100%_0,100%_100%,0_0)]" />
            </div>

            <div className="relative">
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Admin password"
                disabled={loading}
                className="h-12 w-full rounded-lg border border-black/5 bg-[#faf6ef] px-4 text-[13px] font-medium text-[#171009] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_16px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#e8b56b]/60 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 72%, 91% 100%, 0 100%)",
                }}
              />
              <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 bg-gradient-to-bl from-[#e8b56b] to-[#a27d37] shadow-[0_2px_4px_rgba(0,0,0,0.3)] [clip-path:polygon(100%_0,100%_100%,0_0)]" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group/btn relative flex h-12 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#eea377] to-[#d9713c] text-[10px] font-bold uppercase tracking-[0.2em] text-[#20110a] shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_10px_26px_-6px_rgba(217,113,60,0.55),0_4px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_14px_34px_-6px_rgba(217,113,60,0.65),0_6px_14px_rgba(0,0,0,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                clipPath:
                  "polygon(0 0, 96% 0, 100% 35%, 100% 100%, 0 100%)",
              }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#20110a]/25 border-t-[#20110a]" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">Enter Admin Portal</span>
                  <span className="absolute right-5 transition group-hover/btn:translate-x-1">
                    →
                  </span>
                </>
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
                Protected administrator access
              </span>
            </div>
          </form>

          {/* Footer */}
          <div className="relative border-t border-white/[0.06] bg-black/10 px-6 py-3.5 sm:px-8">
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/35 transition hover:text-[#e8b56b]"
            >
              ← Back to customer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}