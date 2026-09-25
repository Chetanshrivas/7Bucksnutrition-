"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../components/auth/AuthProvider";
import { supabase } from "../../lib/supabase";

type Customer = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type Address = {
  id: string;
  address_line_1: string;
  address_line_2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_label: string | null;
  is_default: boolean;
};

function PackageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="3" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const loadedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      loadedUserId.current = null;

      // Intentional logout: don't let this auth guard redirect to /login.
      // handleLogout() owns the navigation and sends the user to /.
      if (signingOut) {
        return;
      }

      router.replace("/login");
      return;
    }

    if (loadedUserId.current === user.id) {
      return;
    }

    const currentUser = user;
    let cancelled = false;

    async function loadAccount() {
      setLoading(true);

      const [customerResult, addressResult] = await Promise.all([
        supabase
          .from("customers")
          .select("full_name,email,phone")
          .eq("id", currentUser.id)
          .maybeSingle(),

        supabase
          .from("customer_addresses")
          .select(
            "id,address_line_1,address_line_2,landmark,city,state,postal_code,country,address_label,is_default"
          )
          .eq("customer_id", currentUser.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;

      if (customerResult.error) {
        console.error("Failed to load customer:", customerResult.error);
      }

      if (addressResult.error) {
        console.error("Failed to load addresses:", addressResult.error);
      }

      setCustomer(customerResult.data ?? null);
      setAddresses((addressResult.data ?? []) as Address[]);
      setLoading(false);
      loadedUserId.current = currentUser.id;
    }

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router, signingOut]);

  async function handleLogout() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.setTimeout(() => {
        window.location.replace("/");
      }, 500);
    }
  }

  if (signingOut) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f2eb] px-5 text-[#171512]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#a27d37]" />
          <p className="mt-5 font-serif text-2xl italic">Logging out...</p>
          <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-black/35">
            See you soon
          </p>
        </div>
      </main>
    );
  }

  if (authLoading || !user || loading) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] px-5 pb-20 pt-32 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-black/10" />

            <div>
              <div className="h-2.5 w-20 animate-pulse rounded-full bg-black/10" />
              <div className="mt-3 h-8 w-56 animate-pulse rounded-xl bg-black/10" />
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-44 animate-pulse rounded-[28px] bg-white/60" />
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-[28px] bg-white/60" />
            <div className="h-64 animate-pulse rounded-[28px] bg-white/40" />
          </div>
        </div>
      </main>
    );
  }

  const name = customer?.full_name || user.user_metadata?.full_name || "Customer";
  const firstName = name.trim().split(/\s+/)[0] || "Customer";
  const initial = firstName.charAt(0).toUpperCase();

  const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f5f2eb] px-5 pb-24 pt-28 text-[#171512] sm:px-8 sm:pt-32">
      {signingOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171512]/95 backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#cdb47b]" />

            <p className="font-serif text-3xl italic tracking-[-0.02em]">
              Logging out<span className="inline-flex w-8 text-left animate-pulse">...</span>
            </p>

            <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.24em] text-white/35">
              See you soon
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">

        <div className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-gradient-to-br from-[#171512] via-[#1d1a15] to-[#171512] px-6 py-8 text-white shadow-[0_30px_80px_rgba(23,21,18,0.25)] sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#cdb47b]/15" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full border border-[#cdb47b]/10" />

          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e3c985] to-[#a27d37] font-serif text-2xl italic text-[#171512] shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
                  {initial}
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#cdb47b]">
                    My Account
                  </p>

                  <h1 className="mt-1 font-serif text-3xl italic tracking-[-0.02em] sm:text-4xl">
                    Welcome back, {firstName}.
                  </h1>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row sm:items-center">
                <Link
                  href="/account/profile"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#cdb47b] px-6 text-[9px] font-bold uppercase tracking-[0.16em] text-[#171512] transition hover:-translate-y-0.5 hover:bg-[#e0c78f]"
                >
                  Edit profile
                  <ArrowRight />
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60 backdrop-blur-sm transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300 disabled:pointer-events-none disabled:opacity-50"
                >
                  <LogoutIcon />
                  {signingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            </div>

            <p className="max-w-xl border-t border-white/10 pt-6 text-sm leading-6 text-white/45">
              Everything you need for your Seven Bucks account, orders and
              delivery addresses — all in one place.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link
            href="/account/orders"
            className="group relative overflow-hidden rounded-[28px] border border-black/[0.07] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#a27d37]/30 hover:shadow-[0_25px_70px_rgba(162,125,55,0.14)] sm:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37] transition group-hover:bg-[#a27d37] group-hover:text-white">
                <PackageIcon />
              </span>

              <span className="font-serif text-lg italic text-black/15">01</span>
            </div>

            <h2 className="mt-6 text-2xl font-semibold tracking-[-0.035em]">My Orders</h2>

            <p className="mt-2 text-xs leading-5 text-black/40">
              Track purchases and view order details.
            </p>

            <span className="mt-6 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-black/40 transition group-hover:gap-2.5 group-hover:text-[#a27d37]">
              View orders
              <ArrowRight />
            </span>
          </Link>

          <Link
            href="/account/profile"
            className="group relative overflow-hidden rounded-[28px] border border-black/[0.07] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#a27d37]/30 hover:shadow-[0_25px_70px_rgba(162,125,55,0.14)] sm:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37] transition group-hover:bg-[#a27d37] group-hover:text-white">
                <UserIcon />
              </span>

              <span className="font-serif text-lg italic text-black/15">02</span>
            </div>

            <h2 className="mt-6 text-2xl font-semibold tracking-[-0.035em]">Account Details</h2>

            <p className="mt-2 text-xs leading-5 text-black/40">
              Manage your name, phone and account details.
            </p>

            <span className="mt-6 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-black/40 transition group-hover:gap-2.5 group-hover:text-[#a27d37]">
              Manage profile
              <ArrowRight />
            </span>
          </Link>

          <Link
            href="/account/addresses"
            className="group relative overflow-hidden rounded-[28px] border border-black/[0.07] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#a27d37]/30 hover:shadow-[0_25px_70px_rgba(162,125,55,0.14)] sm:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37] transition group-hover:bg-[#a27d37] group-hover:text-white">
                <MapPinIcon />
              </span>

              <span className="font-serif text-lg italic text-black/15">03</span>
            </div>

            <h2 className="mt-6 text-2xl font-semibold tracking-[-0.035em]">Saved Addresses</h2>

            <p className="mt-2 text-xs leading-5 text-black/40">
              Save multiple delivery addresses for faster checkout.
            </p>

            <span className="mt-6 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-black/40 transition group-hover:gap-2.5 group-hover:text-[#a27d37]">
              Manage addresses
              <ArrowRight />
            </span>
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/[0.07] bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a27d37]">
                  Profile
                </p>

                <h2 className="mt-2 font-serif text-xl italic">Account information</h2>
              </div>

              <Link
                href="/account/profile"
                className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/35 transition hover:text-black"
              >
                Edit
              </Link>
            </div>

            <div className="mt-7 space-y-5 divide-y divide-black/[0.06]">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/30">
                  Name
                </p>
                <p className="mt-1.5 text-sm font-medium">{name}</p>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37]">
                  <MailIcon />
                </span>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/30">
                    Email
                  </p>
                  <p className="mt-0.5 break-all text-sm font-medium">
                    {customer?.email || user.email || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37]">
                  <PhoneIcon />
                </span>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/30">
                    Phone
                  </p>
                  <p className="mt-0.5 text-sm font-medium">
                    {customer?.phone || <span className="text-black/30">Not added</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-black/[0.07] bg-gradient-to-br from-[#171512] via-[#1d1a15] to-[#171512] p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#cdb47b]/10" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#cdb47b]">
                  Delivery
                </p>
                <h2 className="mt-2 font-serif text-xl italic">Default address</h2>
              </div>

              <Link
                href="/account/addresses"
                className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/35 transition hover:text-white"
              >
                Manage
              </Link>
            </div>

            {defaultAddress ? (
              <div className="relative mt-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#cdb47b] px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.15em] text-[#171512]">
                  <MapPinIcon />
                  {defaultAddress.address_label || "Default"}
                </span>

                <p className="mt-5 text-sm leading-6 text-white/75">
                  {defaultAddress.address_line_1}
                  {defaultAddress.address_line_2 ? `, ${defaultAddress.address_line_2}` : ""}
                  {defaultAddress.landmark ? `, ${defaultAddress.landmark}` : ""}
                  <br />
                  {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}
                  <br />
                  {defaultAddress.country}
                </p>
              </div>
            ) : (
              <div className="relative mt-7">
                <p className="text-sm leading-6 text-white/45">
                  You haven&apos;t added a delivery address yet.
                </p>

                <Link
                  href="/account/addresses"
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#cdb47b] px-5 text-[8px] font-bold uppercase tracking-[0.16em] text-[#171512] transition hover:-translate-y-0.5 hover:bg-[#ddc995]"
                >
                  Add address
                  <ArrowRight />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
