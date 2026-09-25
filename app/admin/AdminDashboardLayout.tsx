"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "../../components/auth/AuthProvider";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "grid",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: "box",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: "layers",
  },
  {
    label: "Brands",
    href: "/admin/brands",
    icon: "badge",
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: "package",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: "shopping",
  },
  // {
  //   label: "Customers",
  //   href: "/admin/customers",
  //   icon: "users",
  // },
];

const PAGE_META = [
  {
    match: "/admin/products",
    eyebrow: "Catalog",
    title: "Products",
  },
  {
    match: "/admin/categories",
    eyebrow: "Catalog",
    title: "Categories",
  },
  {
    match: "/admin/brands",
    eyebrow: "Catalog",
    title: "Brands",
  },
  {
    match: "/admin/inventory",
    eyebrow: "Operations",
    title: "Inventory",
  },
  {
    match: "/admin/orders",
    eyebrow: "Commerce",
    title: "Orders",
  },
  // {
  //   match: "/admin/customers",
  //   eyebrow: "Customers",
  //   title: "Customers",
  // },
];

function Icon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.65,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "grid") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (name === "box") {
    return (
      <svg {...common}>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "layers") {
    return (
      <svg {...common}>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </svg>
    );
  }

  if (name === "badge") {
    return (
      <svg {...common}>
        <path d="M12 3 14 5.2l3-.2.8 2.9 2.7 1.4-1.2 2.7 1.2 2.7-2.7 1.4-.8 2.9-3-.2L12 21l-2-2.2-3 .2-.8-2.9-2.7-1.4 1.2-2.7-1.2-2.7 2.7-1.4.8-2.9 3 .2L12 3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (name === "package") {
    return (
      <svg {...common}>
        <path d="m16.5 9.4-9-5.2" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="M3.3 7 12 12l8.7-5" />
        <path d="M12 22V12" />
      </svg>
    );
  }

  if (name === "shopping") {
    return (
      <svg {...common}>
        <path d="M6 8h12l1 13H5L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  return null;
}

function getPageMeta(pathname: string) {
  if (pathname === "/admin") {
    return {
      eyebrow: "Overview",
      title: "Dashboard",
    };
  }

  return (
    PAGE_META.find((item) =>
      pathname.startsWith(item.match)
    ) || {
      eyebrow: "Administration",
      title: "Admin Panel",
    }
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    signOut,
  } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] =
    useState(false);

  const pageMeta = getPageMeta(pathname);

  /*
   * ONLY AUTH CHECK HERE.
   *
   * Admin role was already verified during admin login.
   *
   * This prevents the duplicate:
   *
   * "Verifying authentication"
   * +
   * "Verifying admin access"
   *
   * loading screens.
   */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  /*
   * Close mobile navigation on route change.
   */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /*
   * Prevent background scrolling when mobile menu is open.
   */
  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /*
   * LOGOUT
   *
   * Logout now goes directly to HOME.
   */
  async function handleLogout() {
    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      await signOut();
    } catch (error) {
      console.error("Admin logout failed:", error);
    } finally {
      setLogoutLoading(false);

      /*
       * IMPORTANT:
       * Never send the user back to /admin/login.
       *
       * Go directly to storefront/home.
       */
      router.replace("/");
      router.refresh();
    }
  }

  /*
   * Initial Supabase auth loading.
   *
   * No admin verification loader here.
   */
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f2eb] px-6">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-[#a27d37]" />

          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Loading
          </span>
        </div>
      </div>
    );
  }

  /*
   * If there is no authenticated user,
   * redirect to home.
   */
  if (!user) {
    return null;
  }

  const sidebar = (
    <aside className="flex h-full w-full flex-col bg-[#12110f] text-[#f5f2eb]">
      {/* Brand */}
      <div className="border-b border-white/[0.07] px-4 pb-5 pt-5 sm:px-5">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="group block"
        >
          <div className="relative flex h-[108px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#191713] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="absolute inset-0 bg-[linear-gradient(100deg,#f3eee3_0%,#f3eee3_39%,#d8c7a2_49%,#1b1915_61%,#1b1915_100%)] opacity-95" />

            <Image
              src="/logo/seven-bucks-logo.webp"
              alt="Seven Bucks"
              width={900}
              height={600}
              priority
              className="relative z-10 h-[100px] w-full object-contain px-2 py-1 transition duration-500 group-hover:scale-[1.025]"
            />

            <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#cdb47b]/50 to-transparent" />
          </div>

          <div className="mt-4 flex items-center justify-between px-1">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#cdb47b]">
                Seven Bucks
              </p>

              <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-white/30">
                Nutrition · Admin
              </p>
            </div>

            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] text-white/30 transition group-hover:border-[#cdb47b]/40 group-hover:text-[#cdb47b]">
              →
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-6">
        <div className="mb-3 flex items-center justify-between px-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-white/25">
            Management
          </p>

          <span className="text-[8px] font-mono text-white/15">
            {NAV_ITEMS.length
              .toString()
              .padStart(2, "0")}
          </span>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 transition-all duration-200 ${
                  active
                    ? "bg-[#cdb47b] text-[#171512] shadow-[0_8px_24px_rgba(205,180,123,0.13)]"
                    : "text-white/48 hover:bg-white/[0.045] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-black/[0.08]"
                      : "bg-white/[0.025] group-hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={16}
                  />
                </span>

                <span className="text-[10px] font-semibold tracking-[0.01em]">
                  {item.label}
                </span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#171512]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#cdb47b] opacity-40" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#cdb47b]" />
            </span>

            <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/35">
              Store online
            </span>
          </div>

          <p className="mt-3 text-[9px] leading-4 text-white/25">
            Manage your catalog and store operations from
            one place.
          </p>
        </div>
      </div>

      {/* Store + Logout */}
      <div className="border-t border-white/[0.07] p-4">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#cdb47b]">
              Store
            </p>

            <span className="rounded-full border border-white/[0.07] px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-white/25">
              India
            </span>
          </div>

          <p className="mt-2 text-[9px] text-white/35">
            Sector 15 · Faridabad
          </p>

          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="mt-3 inline-flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.14em] text-white/50 transition hover:text-white"
          >
            View storefront
            <span>→</span>
          </Link>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-400/10 bg-red-400/[0.04] text-[8px] font-bold uppercase tracking-[0.16em] text-red-300/65 transition hover:border-red-400/20 hover:bg-red-400/[0.08] hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {logoutLoading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border border-red-300/20 border-t-red-300" />

              Signing out...
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
              </svg>

              Logout
            </>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f5f2eb] text-[#171512]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="sticky top-0 hidden h-screen w-[270px] shrink-0 lg:flex">
          {sidebar}
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <button
              type="button"
              aria-label="Close admin menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
            />

            <div className="relative h-full w-[min(88vw,330px)] shadow-2xl">
              {sidebar}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Top navigation */}
          <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#f5f2eb]/90 backdrop-blur-2xl">
            <div className="flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
              {/* Left */}
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  aria-label="Open admin menu"
                  onClick={() => setMobileOpen(true)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-black/65 shadow-[0_4px_18px_rgba(0,0,0,0.03)] transition hover:border-black/15 hover:text-black lg:hidden"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  >
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </svg>
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="hidden h-1.5 w-1.5 rounded-full bg-[#cdb47b] sm:block" />

                    <p className="truncate text-[7px] font-bold uppercase tracking-[0.24em] text-black/30 sm:text-[8px]">
                      {pageMeta.eyebrow}
                    </p>
                  </div>

                  <p className="mt-0.5 truncate text-[16px] font-semibold tracking-[-0.035em] sm:text-[18px]">
                    {pageMeta.title}
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                {/* Admin access */}
                <div className="hidden items-center gap-2 rounded-full border border-[#a27d37]/20 bg-[#a27d37]/[0.06] px-3 py-2 md:flex">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a27d37] opacity-30" />

                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a27d37]" />
                  </span>

                  <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#8d6c31]">
                    Admin access granted
                  </span>
                </div>

                {/* Store */}
                <Link
                  href="/"
                  className="hidden h-10 items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 text-[8px] font-bold uppercase tracking-[0.14em] text-black/50 transition hover:border-black/15 hover:text-black sm:inline-flex"
                >
                  View Store
                  <span className="text-[11px]">
                    ↗
                  </span>
                </Link>

                {/* Account */}
                <div className="flex h-10 items-center gap-2 rounded-full border border-black/[0.08] bg-white pl-1.5 pr-3 shadow-[0_4px_18px_rgba(0,0,0,0.025)]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#171512] text-[7px] font-bold tracking-[0.05em] text-[#cdb47b]">
                    SB
                  </div>

                  <div className="hidden min-w-0 sm:block">
                    <p className="max-w-[150px] truncate text-[8px] font-bold uppercase tracking-[0.12em] text-black/55">
                      Admin
                    </p>

                    {user.email && (
                      <p className="max-w-[150px] truncate text-[7px] text-black/30">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  title="Logout"
                  className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white text-black/45 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
                >
                  {logoutLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-black/50" />
                  ) : (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 17l5-5-5-5" />
                      <path d="M15 12H3" />
                      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#cdb47b]/35 to-transparent lg:hidden" />
          </header>

          {/* Page */}
          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}