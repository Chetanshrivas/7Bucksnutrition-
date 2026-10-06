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

  const iconClass =
    "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d9b06a]/70";

  const inputClass =
    "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-3 text-[13px] font-medium text-[#f5ead9] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_2px_8px_rgba(0,0,0,0.35)] outline-none transition-all duration-300 placeholder:text-white/25 hover:border-white/15 focus:border-[#e8b56b]/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(232,181,107,0.10),inset_0_2px_8px_rgba(0,0,0,0.3)] disabled:cursor-not-allowed disabled:opacity-60";

  // hides non-essential bits on short screens so everything fits in one view
  const shortHide = "[@media(max-height:660px)]:hidden";

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] items-center justify-center overflow-hidden bg-[#070403] px-4">
      <style>{`
        @keyframes sb-rise {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sb-drift {
          0%, 100% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(-24px,-18px,0); }
        }
        @keyframes sb-shine {
          from { transform: translateX(-120%) skewX(-20deg); }
          to { transform: translateX(520%) skewX(-20deg); }
        }
        @keyframes sb-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(232,181,107,0.55); }
          50% { opacity: 0.7; box-shadow: 0 0 0 5px rgba(232,181,107,0); }
        }
      `}</style>

      {/* ===== BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_-10%,#2a1a0d_0%,#120b06_45%,#070403_100%)]" />

        <div
          className="absolute -right-24 top-1/4 h-[380px] w-[380px] rounded-full bg-[#c8913f]/[0.12] blur-[110px]"
          style={{ animation: "sb-drift 14s ease-in-out infinite" }}
        />
        <div
          className="absolute -left-24 bottom-0 h-[420px] w-[420px] rounded-full bg-[#a27d37]/[0.11] blur-[120px]"
          style={{ animation: "sb-drift 18s ease-in-out infinite reverse" }}
        />

        {/* finer, tighter grid for a more "control room" feel */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,181,107,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(232,181,107,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse 65% 60% at 50% 45%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 65% 60% at 50% 45%, black 20%, transparent 75%)",
          }}
        />

        <span
          aria-hidden
          className="absolute -right-6 -top-8 hidden select-none text-[13rem] font-black uppercase leading-none tracking-tight text-transparent md:block"
          style={{ WebkitTextStroke: "1px rgba(232,181,107,0.08)" }}
        >
          Forge
        </span>
        <span
          aria-hidden
          className="absolute -bottom-12 -left-4 hidden select-none text-[11rem] font-black uppercase leading-none tracking-tight text-transparent md:block"
          style={{ WebkitTextStroke: "1px rgba(232,181,107,0.07)" }}
        >
          Grind
        </span>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* ===== BACK TO CUSTOMER LOGIN ===== */}
      <Link
        href="/login"
        className="group absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55 backdrop-blur-md transition-all duration-300 hover:border-[#e8b56b]/40 hover:bg-white/[0.08] hover:text-[#f0c98a] sm:left-8 sm:top-6 sm:text-[10px]"
      >
        <span className="transition-transform duration-300 group-hover:-translate-x-1">
          ←
        </span>
        Customer Login
      </Link>

      {/* ===== CARD ===== */}
      <div
        className="relative z-10 mt-8 w-full max-w-[400px] sm:mt-0"
        style={{ animation: "sb-rise 0.8s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="absolute -inset-5 rounded-[40px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(232,181,107,0.16),transparent_70%)] blur-2xl" />

        <div className="relative rounded-[24px] bg-gradient-to-b from-[#e8b56b]/55 via-[#a27d37]/15 to-[#e8b56b]/25 p-px shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)]">
          <div className="relative overflow-hidden rounded-[23px] bg-[#100a06]/92 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#f0c98a]/80 to-transparent" />
            <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-[#e8b56b]/[0.12] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-[#a27d37]/10 blur-3xl" />

            {/* corner brackets — admin / restricted feel */}
            <span className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-[#e8b56b]/50" />
            <span className="pointer-events-none absolute right-3 top-3 h-3 w-3 border-r border-t border-[#e8b56b]/50" />
            <span className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[#e8b56b]/30" />
            <span className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[#e8b56b]/30" />

            {/* Header */}
            <div className="relative px-6 pt-6 text-center sm:px-8">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8b56b]/25 bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-[0_8px_24px_-8px_rgba(232,181,107,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]">
                <img
                  src="/logo/seven-bucks-logo.webp"
                  alt="Seven Bucks Nutrition"
                  className="h-5 w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                />
              </div>

              <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-[#e8b56b]/25 bg-[#e8b56b]/[0.08] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[#e8b56b]"
                  style={{ animation: "sb-pulse 2s ease-in-out infinite" }}
                />
                <span className="text-[8.5px] font-bold uppercase tracking-[0.22em] text-[#f0c98a]">
                  Admin Portal · Restricted
                </span>
              </div>

              <h1 className="mt-3 text-[28px] font-bold leading-none tracking-[-0.045em] text-[#f7ecd9] sm:text-[32px]">
                Control{" "}
                <span className="bg-gradient-to-b from-[#f6d9a0] to-[#d9a050] bg-clip-text font-serif font-normal italic text-transparent">
                  starts here.
                </span>
              </h1>

              <p className={`mt-2 text-[11.5px] leading-4 text-white/40 ${shortHide}`}>
                Sign in with your administrator account.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="relative space-y-3 px-6 pb-5 pt-5 sm:px-8"
            >
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45"
                >
                  Admin email
                </label>
                <div className="relative">
                  <svg
                    className={iconClass}
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
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45"
                >
                  Admin password
                </label>
                <div className="relative">
                  <svg
                    className={iconClass}
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
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group/btn relative mt-1 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-[#f3c37e] via-[#e3a455] to-[#c98433] text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#1d1007] shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_32px_-10px_rgba(227,164,85,0.6),0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_20px_40px_-10px_rgba(227,164,85,0.75),0_6px_16px_rgba(0,0,0,0.45)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover/btn:opacity-100 group-hover/btn:[animation:sb-shine_0.9s_ease-out]" />
                {loading ? (
                  <div className="relative z-10 flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#20110a]/25 border-t-[#20110a]" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Enter Admin Portal</span>
                    <span className="absolute right-5 text-base transition-transform duration-300 group-hover/btn:translate-x-1">
                      →
                    </span>
                  </>
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
                  Protected administrator access
                </span>
              </div>
            </form>

            {/* Footer */}
            <div className="relative border-t border-white/[0.06] bg-black/20 px-6 py-3 sm:px-8">
              <Link
                href="/login"
                className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 transition hover:text-[#e8b56b]"
              >
                ← Back to customer login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}