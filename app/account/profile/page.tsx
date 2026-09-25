"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "../../../components/auth/AuthProvider";
import { supabase } from "../../../lib/supabase";

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const currentUser = user;
    let cancelled = false;

    async function loadProfile() {
      const { data, error: profileError } = await supabase
        .from("customers")
        .select("full_name,email,phone")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (cancelled) return;

      if (profileError) {
        console.error("Failed to load profile:", profileError);
        setError("We couldn't load your account details. Please refresh the page.");
      } else {
        setFullName(data?.full_name || currentUser.user_metadata?.full_name || "");
        setPhone(data?.phone || "");
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!message && !error) return;

    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
    }

    dismissTimer.current = setTimeout(() => {
      setMessage("");
      setError("");
    }, 5000);

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [message, error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    const currentUser = user;

    setError("");
    setMessage("");

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (trimmedPhone && !/^[0-9+\s-]{7,15}$/.test(trimmedPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase
      .from("customers")
      .update({
        full_name: trimmedName,
        phone: trimmedPhone || null,
      })
      .eq("id", currentUser.id);

    setSaving(false);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      setError("We couldn't save your changes. Please try again in a moment.");
      return;
    }

    setMessage("Your account details have been saved.");
  }

  if (authLoading || !user || loading) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] px-5 pt-32 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="h-3 w-32 animate-pulse rounded-full bg-black/10" />
          <div className="mt-4 h-10 w-64 animate-pulse rounded-xl bg-black/10" />
          <div className="mt-10 h-96 animate-pulse rounded-[30px] bg-white/60" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f2eb] px-5 pb-24 pt-28 text-[#171512] sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-black/35 transition hover:text-black"
        >
          ← Back to account
        </Link>

        <div className="relative mt-7 overflow-hidden rounded-[32px] border border-black/[0.06] bg-gradient-to-br from-[#171512] via-[#1d1a15] to-[#171512] px-6 py-8 text-white shadow-[0_30px_80px_rgba(23,21,18,0.25)] sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#cdb47b]/15" />

          <div className="relative">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#cdb47b]">
              Profile
            </p>

            <h1 className="mt-3 font-serif text-4xl italic tracking-[-0.02em] sm:text-5xl">
              Account details
            </h1>

            <p className="mt-4 text-sm leading-6 text-white/45">
              Keep your personal information up to date.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[30px] border border-black/[0.07] bg-white p-6 shadow-[0_25px_70px_rgba(0,0,0,0.05)] sm:p-9"
        >
          <fieldset disabled={saving} className="grid gap-6 disabled:opacity-60">
            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-black/40"
              >
                <UserIcon />
                Full name
              </label>

              <input
                id="profile-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="h-12 w-full rounded-2xl border border-black/[0.08] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-[#a27d37]/50 focus:bg-white focus:ring-4 focus:ring-[#a27d37]/10"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-black/40"
              >
                <MailIcon />
                Email address
              </label>

              <input
                id="profile-email"
                name="email"
                type="email"
                value={user.email || ""}
                disabled
                className="h-12 w-full cursor-not-allowed rounded-2xl border border-black/[0.06] bg-black/[0.025] px-4 text-sm text-black/40"
              />

              <p className="mt-2 text-[9px] text-black/30">
                Your login email is managed by Supabase authentication.
              </p>
            </div>

            <div>
              <label
                htmlFor="profile-phone"
                className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-black/40"
              >
                <PhoneIcon />
                Phone number
              </label>

              <input
                id="profile-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 98765 43210"
                className="h-12 w-full rounded-2xl border border-black/[0.08] bg-[#faf9f6] px-4 text-sm outline-none transition placeholder:text-black/25 focus:border-[#a27d37]/50 focus:bg-white focus:ring-4 focus:ring-[#a27d37]/10"
              />
            </div>
          </fieldset>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              <span className="mt-0.5 shrink-0">
                <AlertIcon />
              </span>
              {error}
            </div>
          )}

          {message && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
              <span className="mt-0.5 shrink-0">
                <CheckIcon />
              </span>
              {message}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#171512] px-7 text-[9px] font-bold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-black disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}