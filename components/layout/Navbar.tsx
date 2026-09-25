"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "../cart/CartProvider";
import { useAuth } from "../auth/AuthProvider";
import { getCategories, getBrands, type Category, type Brand } from "../../lib/products";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Brands", href: "/brands" },
  { label: "Our Story", href: "/our-story" },
  { label: "Store", href: "/store" },
];

function ChevronDown({ open, light = false }: { open: boolean; light?: boolean }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""} ${light ? "text-white/70" : ""}`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function NavbarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { cartCount } = useCart();
  const { user, loading: authLoading, signOut } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [desktopDropdown, setDesktopDropdown] = useState<"categories" | "brands" | null>(null);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [mobileBrandOpen, setMobileBrandOpen] = useState(false);

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 45);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setDesktopDropdown(null);
    setMobileCategoryOpen(false);
    setMobileBrandOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    async function loadNavigationData() {
      try {
        const [categoryData, brandData] = await Promise.all([getCategories(), getBrands()]);
        if (cancelled) return;
        setCategories(categoryData);
        setBrands(brandData);
      } catch (error) {
        console.error("Navbar navigation data loading failed:", error);
        if (!cancelled) {
          setCategories([]);
          setBrands([]);
        }
      }
    }
    void loadNavigationData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setMobileCategoryOpen(false);
        setMobileBrandOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setIsMenuOpen(false);
    await signOut();
    setSigningOut(false);
    window.location.href = "/";
  }

  const mainCategories = useMemo(() => {
    return [...categories]
      .filter((category) => category.parent_category_id === null)
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  }, [categories]);

  const subCategoriesByParent = useMemo(() => {
    const map = new Map<string, Category[]>();
    categories
      .filter((category) => category.parent_category_id !== null)
      .forEach((category) => {
        const parentId = category.parent_category_id;
        if (!parentId) return;
        const current = map.get(parentId) ?? [];
        current.push(category);
        map.set(parentId, current);
      });
    map.forEach((items, parentId) => {
      items.sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      map.set(parentId, items);
    });
    return map;
  }, [categories]);

  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [brands]);

  const selectedCategory = searchParams.get("category");
  const selectedBrand = searchParams.get("brand");

  const floatingNavbar = isScrolled || !isHomePage;

  const isCategoriesActive =
    pathname === "/categories" || Boolean(pathname === "/shop" && selectedCategory);
  const isBrandsActive = pathname === "/brands" || Boolean(pathname === "/shop" && selectedBrand);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] flex justify-center px-3 transition-[padding] duration-500 sm:px-5 ${
        floatingNavbar ? "pt-3 sm:pt-4" : "pt-0"
      }`}
    >
      <div
        className={`relative w-full transition-all duration-500 ${
          floatingNavbar
            ? "max-w-[1160px] rounded-[26px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,247,240,0.92))] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_22px_70px_-20px_rgba(23,18,15,0.35)] backdrop-blur-[26px]"
            : "max-w-[1500px] rounded-none border border-transparent bg-transparent shadow-none"
        }`}
      >
        {floatingNavbar && (
          <span className="pointer-events-none absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-[#cdb47b]/70 to-transparent" />
        )}

        <div
          className={`flex items-center justify-between ${
            floatingNavbar ? "h-[60px] px-3 sm:h-[64px] sm:px-4" : "h-[76px] px-2 sm:h-[84px] sm:px-5"
          }`}
        >
          {/* LOGO */}
          <Link
            href="/"
            aria-label="Seven Bucks Nutrition"
            onClick={() => {
              setIsMenuOpen(false);
              setDesktopDropdown(null);
            }}
            className="group relative z-[110] flex shrink-0 items-center gap-2.5"
          >
            <Image
              src="/logo/seven-bucks-logo.webp"
              alt="Seven Bucks Nutrition"
              width={200}
              height={90}
              priority
              sizes="(max-width: 640px) 140px, 170px"
              className={`h-auto w-auto object-contain transition-all duration-500 group-hover:scale-105 ${
                floatingNavbar ? "max-h-[42px] sm:max-h-[46px]" : "max-h-[50px] sm:max-h-[58px]"
              }`}
            />
            <span className="flex flex-col leading-none">
              <span
                className={`text-[6px] font-semibold uppercase tracking-[0.32em] ${
                  floatingNavbar ? "text-black/40" : "text-white/50"
                }`}
              >
                Seven Bucks
              </span>
              <span
                className={`mt-0.5 font-serif text-[13px] italic tracking-tight ${
                  floatingNavbar ? "text-[#9d7d3f]" : "text-[#e8d9b5]"
                }`}
              >
                NUTRITION
              </span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const isCategoryLink = link.href === "/categories";
              const isBrandLink = link.href === "/brands";

              const active =
                pathname === link.href ||
                (link.href === "/shop" && pathname === "/shop") ||
                (link.href === "/our-story" && pathname.startsWith("/our-story")) ||
                (link.href === "/store" && pathname.startsWith("/store")) ||
                (isCategoryLink && isCategoriesActive) ||
                (isBrandLink && isBrandsActive);

              const hasDropdown = isCategoryLink || isBrandLink;

              const pillBase = `group relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                floatingNavbar
                  ? active
                    ? "bg-[#17120f] text-[#f3e9d2] shadow-[0_10px_24px_-14px_rgba(23,18,15,0.9)]"
                    : "text-[#17120f]/60 hover:bg-black/[0.045] hover:text-[#17120f]"
                  : active
                    ? "bg-white/15 text-white backdrop-blur"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
              }`;

              if (hasDropdown) {
                const dropdownType = isCategoryLink ? "categories" : "brands";
                const isOpen = desktopDropdown === dropdownType;

                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setDesktopDropdown(dropdownType)}
                    onMouseLeave={() => setDesktopDropdown(null)}
                  >
                    <div className={`${pillBase} ${isOpen && !active ? "bg-black/[0.05]" : ""}`}>
                      <Link href={link.href} className="relative">
                        {link.label}
                      </Link>

                      <button
                        type="button"
                        aria-label={`Open ${link.label} menu`}
                        aria-expanded={isOpen}
                        onClick={() => setDesktopDropdown(isOpen ? null : dropdownType)}
                        className="flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-black/10"
                      >
                        <ChevronDown open={isOpen} light={!floatingNavbar && !active} />
                      </button>
                    </div>

                    <div
                      className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300 ${
                        isOpen
                          ? "pointer-events-auto visible translate-y-0 opacity-100"
                          : "pointer-events-none invisible -translate-y-2 opacity-0"
                      }`}
                    >
                      <span className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[3px] border-l border-t border-white/10 bg-[#1c1712]" />

                      {isCategoryLink ? (
                        <div className="relative w-[760px] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[linear-gradient(165deg,#1a1510_0%,#211a13_45%,#2a2116_100%)] shadow-[0_36px_90px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.05)]">
                          <span className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#cdb47b]/[0.08] blur-3xl" />
                          <span className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#8fae87]/[0.06] blur-3xl" />

                          <div className="relative flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
                            <div>
                              <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#d4b06a]">
                                Explore
                              </p>
                              <p className="mt-1 font-serif text-xl tracking-[-0.025em] text-[#f5ecd9]">
                                Shop by category
                              </p>
                            </div>
                            <Link
                              href="/categories"
                              onClick={() => setDesktopDropdown(null)}
                              className="flex items-center gap-2 rounded-full border border-[#cdb47b]/30 bg-white/[0.04] px-4 py-2 text-[8px] font-bold uppercase tracking-[0.13em] text-[#e8d9b5]/80 transition hover:border-[#cdb47b]/70 hover:bg-white/[0.08] hover:text-[#e8d9b5]"
                            >
                              All Categories
                              <ArrowRight />
                            </Link>
                          </div>

                          <div className="relative grid max-h-[520px] grid-cols-3 gap-2.5 overflow-y-auto p-5">
                            {mainCategories.length > 0 ? (
                              mainCategories.map((category, categoryIndex) => {
                                const children = subCategoriesByParent.get(category.id) ?? [];
                                const palette = [
                                  "border-l-[#cdb47b]",
                                  "border-l-[#8fae87]",
                                  "border-l-[#c99a8f]",
                                  "border-l-[#8ba3c2]",
                                  "border-l-[#b090b8]",
                                  "border-l-[#d4a24f]",
                                ];
                                const accent = palette[categoryIndex % palette.length];
                                return (
                                  <div
                                    key={category.id}
                                    className={`group/card min-w-0 rounded-2xl border border-white/[0.06] border-l-[3px] bg-white/[0.035] p-3.5 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)] ${accent}`}
                                  >
                                    <Link
                                      href={`/shop?category=${encodeURIComponent(category.slug)}`}
                                      onClick={() => setDesktopDropdown(null)}
                                      className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2"
                                    >
                                      <span className="truncate text-[15px] font-bold uppercase tracking-[0.06em] text-[#f0e6d2] transition-colors group-hover/card:text-[#e0bd76]">
                                        {category.name}
                                      </span>
                                      <span className="shrink-0 text-[#e0bd76] opacity-0 transition-all group-hover/card:translate-x-0.5 group-hover/card:opacity-100">
                                        →
                                      </span>
                                    </Link>

                                    {children.length > 0 ? (
                                      <div className="mt-2 space-y-0.5">
                                        {children.map((child) => (
                                          <Link
                                            key={child.id}
                                            href={`/shop?category=${encodeURIComponent(child.slug)}`}
                                            onClick={() => setDesktopDropdown(null)}
                                            className="group/sub flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-[12px] font-medium leading-4 text-[#cfc3ac]/75 transition-colors hover:bg-white/[0.06] hover:text-[#e0bd76]"
                                          >
                                            <span className="h-1 w-1 shrink-0 rounded-full bg-[#cdb47b]/50 transition group-hover/sub:bg-[#e0bd76]" />
                                            <span className="truncate">{child.name}</span>
                                          </Link>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="mt-2 px-1.5 text-[9.5px] font-medium italic text-[#cfc3ac]/40">
                                        No sub-categories yet
                                      </p>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="col-span-3 py-8 text-center text-[9px] uppercase tracking-[0.15em] text-[#cfc3ac]/40">
                                Loading categories...
                              </div>
                            )}
                          </div>

                          <div className="relative flex items-center justify-between border-t border-white/[0.07] bg-white/[0.02] px-6 py-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#cfc3ac]/50">
                            <span>100% Authentic · Hologram verified</span>
                            {/* <span className="text-[#d4b06a]">Free shipping over ₹1499</span> */}
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-[640px] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[linear-gradient(165deg,#1a1510_0%,#211a13_45%,#2a2116_100%)] shadow-[0_36px_90px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.05)]">
                          <span className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-[#cdb47b]/[0.08] blur-3xl" />
                          <span className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-[#8ba3c2]/[0.06] blur-3xl" />

                          <div className="relative flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
                            <div>
                              <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#d4b06a]">
                                Our partners
                              </p>
                              <p className="mt-1 font-serif text-xl tracking-[-0.025em] text-[#f5ecd9]">
                                Shop by brand
                              </p>
                            </div>
                            <Link
                              href="/brands"
                              onClick={() => setDesktopDropdown(null)}
                              className="flex items-center gap-2 rounded-full border border-[#cdb47b]/30 bg-white/[0.04] px-4 py-2 text-[8px] font-bold uppercase tracking-[0.13em] text-[#e8d9b5]/80 transition hover:border-[#cdb47b]/70 hover:bg-white/[0.08] hover:text-[#e8d9b5]"
                            >
                              All Brands
                              <ArrowRight />
                            </Link>
                          </div>

                          <div className="relative grid max-h-[420px] grid-cols-3 gap-2.5 overflow-y-auto p-4">
                            {sortedBrands.length > 0 ? (
                              sortedBrands.map((brand, brandIndex) => {
                                const palette = [
                                  "border-l-[#cdb47b]",
                                  "border-l-[#8fae87]",
                                  "border-l-[#c99a8f]",
                                  "border-l-[#8ba3c2]",
                                  "border-l-[#b090b8]",
                                  "border-l-[#d4a24f]",
                                ];
                                const accent = palette[brandIndex % palette.length];
                                return (
                                  <Link
                                    key={brand.id}
                                    href={`/shop?brand=${encodeURIComponent(brand.slug)}`}
                                    onClick={() => setDesktopDropdown(null)}
                                    className={`group/brand flex min-h-[54px] items-center justify-between rounded-2xl border border-white/[0.06] border-l-[3px] bg-white/[0.035] px-3.5 py-3 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:shadow-[0_16px_36px_-24px_rgba(0,0,0,0.7)] ${accent}`}
                                  >
                                    <span className="truncate text-[12px] font-bold uppercase tracking-[0.06em] text-[#e5d9c1]/85 transition-colors group-hover/brand:text-[#e0bd76]">
                                      {brand.name}
                                    </span>
                                    <span className="ml-2 shrink-0 text-[12px] text-[#e0bd76] opacity-0 transition-all group-hover/brand:translate-x-0.5 group-hover/brand:opacity-100">
                                      →
                                    </span>
                                  </Link>
                                );
                              })
                            ) : (
                              <div className="col-span-3 py-8 text-center text-[9px] uppercase tracking-[0.15em] text-[#cfc3ac]/40">
                                Loading brands...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <Link key={link.href} href={link.href} className={pillBase}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/cart"
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className={`flex h-9 items-center gap-2 rounded-full border px-2.5 transition-all duration-300 sm:h-10 sm:px-3.5 ${
                floatingNavbar
                  ? "border-black/[0.07] bg-white/70 text-[#17120f]/75 hover:border-[#cdb47b]/50 hover:text-[#17120f]"
                  : "border-white/15 bg-white/[0.06] text-white/80 hover:bg-white/[0.12]"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8h12l1 13H5L6 8Z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
              </svg>
              <span className="hidden text-[9px] font-semibold uppercase tracking-[0.13em] sm:inline">
                Cart
              </span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1c1611,#2c231a)] px-1 text-[8px] font-bold text-[#e8d9b5]">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {!authLoading && (
              <>
                {user ? (
                  <div className="hidden items-center gap-2 lg:flex">
                    <Link
                      href="/account"
                      aria-label="My Account"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#cdb47b]/30 bg-[linear-gradient(135deg,#1c1611,#2c231a)] text-[#e8d9b5] shadow-[0_12px_26px_-16px_rgba(23,18,15,0.9)] transition hover:brightness-125"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="3.5" />
                        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="hidden h-10 items-center rounded-full bg-[linear-gradient(135deg,#e2c98d,#cdb47b_45%,#b8994f)] px-5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#11100e] shadow-[0_12px_28px_-14px_rgba(184,153,79,0.95)] transition hover:brightness-105 lg:inline-flex"
                  >
                    Login
                  </Link>
                )}
              </>
            )}

            <button
              type="button"
              aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((value) => !value)}
              className={`relative z-[110] flex h-9 w-9 items-center justify-center rounded-full border transition lg:hidden ${
                floatingNavbar
                  ? "border-black/[0.08] bg-black/[0.03] text-[#17120f]"
                  : "border-white/[0.12] bg-white/[0.06] text-white"
              }`}
            >
              <span className={`absolute h-px w-[17px] bg-current transition-all duration-300 ${isMenuOpen ? "rotate-45" : "-translate-y-[4px]"}`} />
              <span className={`absolute h-px w-[17px] bg-current transition-all duration-300 ${isMenuOpen ? "-rotate-45" : "translate-y-[4px]"}`} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div className={`lg:hidden ${isMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          <div
            className={`overflow-hidden transition-all duration-500 ${
              isMenuOpen ? "max-h-[calc(100vh-80px)] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="mx-2 mb-2 overflow-hidden rounded-[22px] border border-black/[0.06] bg-[linear-gradient(180deg,#ffffff,#faf7f0)] shadow-[0_28px_70px_-24px_rgba(23,18,15,0.5)]">
              <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#9d7d3f]">
                    Seven Bucks
                  </p>
                  <p className="mt-1 text-[11px] text-black/45">Nutrition</p>
                </div>
                <span className="rounded-full border border-black/10 px-3 py-1 text-[8px] uppercase tracking-[0.18em] text-black/30">
                  Menu
                </span>
              </div>

              <nav className="max-h-[calc(100vh-190px)] overflow-y-auto p-2">
                <Link
                  href="/shop"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex min-h-[54px] items-center justify-between rounded-2xl px-4 transition ${
                    pathname === "/shop" ? "bg-black/[0.05]" : "hover:bg-black/[0.035]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-[8px] tracking-wider text-[#9d7d3f]/70">01</span>
                    <span className="text-[13px] font-medium">Shop</span>
                  </div>
                  <span className="text-[#9d7d3f]">↗</span>
                </Link>

                {/* CATEGORIES ACCORDION */}
                <div className="mt-1">
                  <div
                    className={`flex min-h-[54px] items-center rounded-2xl transition ${
                      isCategoriesActive ? "bg-black/[0.05]" : "hover:bg-black/[0.035]"
                    }`}
                  >
                    <Link
                      href="/categories"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-4"
                    >
                      <span className="w-5 text-[8px] tracking-wider text-[#9d7d3f]/70">02</span>
                      <span className="text-[13px] font-medium">Categories</span>
                    </Link>
                    <button
                      type="button"
                      aria-label="Expand categories"
                      aria-expanded={mobileCategoryOpen}
                      onClick={() => setMobileCategoryOpen((value) => !value)}
                      className="mr-2 flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.07] bg-white text-black/45 transition hover:border-[#cdb47b]/50 hover:text-[#a27d37]"
                    >
                      <ChevronDown open={mobileCategoryOpen} />
                    </button>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      mobileCategoryOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="mx-3 mb-2 mt-1 rounded-2xl border border-[#a27d37]/15 bg-white/70 p-2">
                      <Link
                        href="/categories"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#a27d37]"
                      >
                        View all categories
                        <ArrowRight />
                      </Link>

                      {mainCategories.map((category) => {
                        const children = subCategoriesByParent.get(category.id) ?? [];
                        return (
                          <div key={category.id} className="mt-1">
                            <Link
                              href={`/shop?category=${encodeURIComponent(category.slug)}`}
                              onClick={() => setIsMenuOpen(false)}
                              className="flex min-h-[42px] items-center justify-between rounded-xl px-3 text-[9px] font-bold uppercase tracking-[0.08em] text-black/70 transition hover:bg-[#f5f2eb] hover:text-black"
                            >
                              <span>{category.name}</span>
                              <span className="text-[#a27d37]">→</span>
                            </Link>

                            {children.length > 0 && (
                              <div className="ml-3 border-l border-black/[0.07] pl-2">
                                {children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={`/shop?category=${encodeURIComponent(child.slug)}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex min-h-[38px] items-center gap-2 rounded-xl px-3 text-[8px] font-semibold uppercase tracking-[0.07em] text-black/40 transition hover:bg-[#f5f2eb] hover:text-[#a27d37]"
                                  >
                                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#a27d37]/50" />
                                    <span className="truncate">{child.name}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* BRANDS ACCORDION */}
                <div className="mt-1">
                  <div
                    className={`flex min-h-[54px] items-center rounded-2xl transition ${
                      isBrandsActive ? "bg-black/[0.05]" : "hover:bg-black/[0.035]"
                    }`}
                  >
                    <Link
                      href="/brands"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-4"
                    >
                      <span className="w-5 text-[8px] tracking-wider text-[#9d7d3f]/70">03</span>
                      <span className="text-[13px] font-medium">Brands</span>
                    </Link>
                    <button
                      type="button"
                      aria-label="Expand brands"
                      aria-expanded={mobileBrandOpen}
                      onClick={() => setMobileBrandOpen((value) => !value)}
                      className="mr-2 flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.07] bg-white text-black/45 transition hover:border-[#cdb47b]/50 hover:text-[#a27d37]"
                    >
                      <ChevronDown open={mobileBrandOpen} />
                    </button>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      mobileBrandOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="mx-3 mb-2 mt-1 rounded-2xl border border-[#a27d37]/15 bg-white/70 p-2">
                      <Link
                        href="/brands"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[8px] font-bold uppercase tracking-[0.12em] text-[#a27d37]"
                      >
                        View all brands
                        <ArrowRight />
                      </Link>

                      <div className="grid grid-cols-2 gap-1">
                        {sortedBrands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/shop?brand=${encodeURIComponent(brand.slug)}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex min-h-[42px] items-center justify-between rounded-xl px-3 text-[8px] font-bold uppercase tracking-[0.06em] text-black/50 transition hover:bg-[#f5f2eb] hover:text-black"
                          >
                            <span className="truncate">{brand.name}</span>
                            <span className="ml-1 shrink-0 text-[#a27d37]">→</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/our-story"
                  onClick={() => setIsMenuOpen(false)}
                  className={`mt-1 flex min-h-[54px] items-center justify-between rounded-2xl px-4 transition ${
                    pathname.startsWith("/our-story") ? "bg-black/[0.05]" : "hover:bg-black/[0.035]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-[8px] tracking-wider text-[#9d7d3f]/70">04</span>
                    <span className="text-[13px] font-medium">Our Story</span>
                  </div>
                  <span className="text-[#9d7d3f]">↗</span>
                </Link>

                <Link
                  href="/store"
                  onClick={() => setIsMenuOpen(false)}
                  className={`mt-1 flex min-h-[54px] items-center justify-between rounded-2xl px-4 transition ${
                    pathname.startsWith("/store") ? "bg-black/[0.05]" : "hover:bg-black/[0.035]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-[8px] tracking-wider text-[#9d7d3f]/70">05</span>
                    <span className="text-[13px] font-medium">Store</span>
                  </div>
                  <span className="text-[#9d7d3f]">↗</span>
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setIsMenuOpen(false)}
                      className="mt-1 flex min-h-[54px] items-center justify-between rounded-2xl bg-black/[0.025] px-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-[8px] tracking-wider text-[#9d7d3f]/70">06</span>
                        <span className="text-[13px] font-medium">My Account</span>
                      </div>
                      <span className="text-[#9d7d3f]">↗</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="mt-1 flex min-h-[54px] w-full items-center rounded-2xl px-4 text-left text-[13px] font-medium text-black/55 transition hover:bg-red-50 hover:text-red-600"
                    >
                      {signingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-1 flex min-h-[54px] items-center rounded-2xl bg-black/[0.025] px-4 text-[13px] font-medium"
                  >
                    Login
                  </Link>
                )}
              </nav>

              <div className="p-3 pt-1">
                <Link
                  href="/shop"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e2c98d,#cdb47b_45%,#b8994f)] text-[9px] font-bold uppercase tracking-[0.17em] text-[#11100e] shadow-[0_16px_32px_-16px_rgba(184,153,79,0.9)]"
                >
                  Explore The Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}

export default Navbar;