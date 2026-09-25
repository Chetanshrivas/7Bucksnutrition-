"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function normalizeImageUrl(
  imageUrl: string | null | undefined
): string | null {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

function BrandVisual({
  brand,
  featured = false,
}: {
  brand: Brand;
  featured?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  const image = normalizeImageUrl(brand.logo_url);

  const initials = brand.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  if (!image || failed) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center overflow-hidden ${
          featured
            ? "bg-gradient-to-br from-[#eee7da] via-[#ded5c6] to-[#c9bdaa]"
            : "bg-gradient-to-br from-[#f7f3eb] via-[#e7dfd2] to-[#d5cabb]"
        }`}
      >
        <div className="absolute inset-0">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full border border-[#a38752]/10" />
          <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-[#a38752]/10" />
        </div>

        <div className="relative flex flex-col items-center justify-center px-6 text-center">
          <span
            className={`font-serif font-medium leading-none tracking-[-0.06em] ${
              featured
                ? "text-6xl text-[#241a14]/15 sm:text-7xl"
                : "text-5xl text-[#241a14]/15 sm:text-6xl"
            }`}
          >
            {initials}
          </span>

          <span
            className={`mt-3 font-serif leading-tight ${
              featured
                ? "text-sm text-[#241a14]/45 sm:text-base"
                : "text-xs text-[#241a14]/40 sm:text-sm"
            }`}
          >
            {brand.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f7f3eb]">
      <img
        src={image}
        alt={brand.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
        onError={() => setFailed(true)}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.14] via-transparent to-white/[0.07]" />
    </div>
  );
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadBrands() {
      setLoading(true);

      const { data, error } = await supabase
        .from("brands")
        .select(
          `
            id,
            name,
            slug,
            description,
            logo_url,
            website_url,
            is_featured,
            is_active,
            sort_order,
            created_at,
            updated_at
          `
        )
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error("Brands loading error:", error);

        if (mounted) {
          setBrands([]);
          setLoading(false);
        }

        return;
      }

      const loadedBrands = (data ?? []) as Brand[];

      if (mounted) {
        setBrands(loadedBrands);
        setLoading(false);
      }
    }

    void loadBrands();

    return () => {
      mounted = false;
    };
  }, []);

  const featuredBrands = useMemo(() => {
    return brands.filter((brand) => brand.is_featured);
  }, [brands]);

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return brands;
    }

    return brands.filter((brand) => {
      const nameMatch = brand.name.toLowerCase().includes(query);

      const descriptionMatch = brand.description
        ?.toLowerCase()
        .includes(query);

      return nameMatch || Boolean(descriptionMatch);
    });
  }, [brands, search]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3eee4]">
        <section className="mx-auto max-w-7xl px-5 pb-16 pt-24 sm:px-8 sm:pt-32 lg:pb-20 lg:pt-36">
          <div className="max-w-3xl">
            <div className="h-3 w-28 animate-pulse rounded-full bg-[#d8d0c2]" />

            <div className="mt-5 h-14 w-[420px] max-w-full animate-pulse rounded-xl bg-[#d8d0c2]" />

            <div className="mt-5 h-4 w-[520px] max-w-full animate-pulse rounded-full bg-[#d8d0c2]" />
          </div>

          <div className="mt-10 max-w-xl">
            <div className="h-14 animate-pulse rounded-full bg-[#ddd6ca]" />
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className={`animate-pulse rounded-[24px] ${
                  index % 2 === 0
                    ? "bg-[#171717]"
                    : "bg-[#ddd5c7]"
                } ${
                  index % 3 === 1
                    ? "h-[280px]"
                    : "h-[230px]"
                }`}
              />
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3eee4] text-[#241a14]">
      {/* HERO */}

      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-24 sm:px-8 sm:pb-14 sm:pt-32 lg:pb-16 lg:pt-36">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:gap-16">
            {/* HERO COPY */}

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#241a14]/[0.07] bg-white/50 px-3 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a38752]" />

                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#a38752]">
                  The brands we trust
                </p>
              </div>

              <h1 className="mt-5 font-serif text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Shop by{" "}
                <span className="italic text-[#b89658]">
                  brand.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#241a14]/50 sm:text-base">
                Discover trusted nutrition brands carefully
                selected for your performance, strength and
                everyday goals.
              </p>
            </div>

            {/* SEARCH */}

            <div className="w-full lg:justify-self-end">
              <div className="lg:ml-auto lg:max-w-[520px]">
                <p className="mb-3 hidden text-[8px] font-bold uppercase tracking-[0.28em] text-[#a38752] lg:block">
                  Find your brand
                </p>

                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#241a14]/35"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />
                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search brands..."
                    className="h-14 w-full rounded-full border border-[#241a14]/10 bg-white/65 pl-12 pr-12 text-sm text-[#241a14] outline-none backdrop-blur-md transition placeholder:text-[#241a14]/30 focus:border-[#a38752]/50 focus:bg-white"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#241a14]/5 text-lg text-[#241a14]/45 transition hover:bg-[#241a14]/10 hover:text-[#241a14]"
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="mt-3 hidden items-center justify-between px-1 lg:flex">
                  <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-[#241a14]/25">
                    Explore our collection
                  </span>

                  <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#241a14]/30">
                    {brands.length}{" "}
                    {brands.length === 1
                      ? "Brand"
                      : "Brands"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}

      {!search && featuredBrands.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:pb-16">
          <div className="mb-7 flex items-end justify-between gap-5">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#a38752]">
                Featured
              </p>

              <h2 className="mt-2 font-serif text-3xl tracking-[-0.035em] sm:text-4xl">
                Brands worth{" "}
                <span className="italic text-[#b89658]">
                  knowing.
                </span>
              </h2>
            </div>

            <span className="hidden text-[8px] font-bold uppercase tracking-[0.2em] text-[#241a14]/30 sm:block">
              {featuredBrands.length} Featured
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {featuredBrands.map((brand, index) => (
              <Link
                key={brand.id}
                href={`/shop?brand=${encodeURIComponent(
                  brand.slug
                )}`}
                className={`group relative overflow-hidden rounded-[27px] border border-black/[0.06] shadow-[0_14px_40px_rgba(54,39,27,0.065)] transition-all duration-500 hover:-translate-y-1 hover:border-black/[0.1] hover:shadow-[0_24px_55px_rgba(54,39,27,0.12)] ${
                  index % 3 === 1
                    ? "min-h-[270px] sm:min-h-[295px]"
                    : "min-h-[235px] sm:min-h-[255px]"
                }`}
              >
                <BrandVisual
                  brand={brand}
                  featured
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <span className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/15 text-xs text-white backdrop-blur-md transition-all duration-300 group-hover:bg-white group-hover:text-[#241a14]">
                  ↗
                </span>

                <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
                  <p className="text-[7px] font-bold uppercase tracking-[0.24em] text-[#d6b875]">
                    Featured brand
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <h3 className="font-sans text-xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-2xl">
                      {brand.name}
                    </h3>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ALL BRANDS */}

      <section className="border-t border-[#241a14]/[0.08] bg-[#e8e0d2]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:py-16">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#a38752]">
                {search
                  ? "Search results"
                  : "Our collection"}
              </p>

              <h2 className="mt-2 font-serif text-3xl tracking-[-0.035em] sm:text-4xl">
                {search
                  ? `Results for "${search}"`
                  : "Explore all brands."}
              </h2>
            </div>

            <p className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-[#241a14]/35 sm:block">
              {filteredBrands.length}{" "}
              {filteredBrands.length === 1
                ? "Brand"
                : "Brands"}
            </p>
          </div>

          {filteredBrands.length > 0 ? (
            <div className="mt-9 grid grid-cols-2 items-start gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {filteredBrands.map((brand, index) => {
                const tall = index % 3 === 1;
                const dark = index % 2 === 0;

                return (
                  <Link
                    key={brand.id}
                    href={`/shop?brand=${encodeURIComponent(
                      brand.slug
                    )}`}
                    className={`group relative flex flex-col overflow-hidden rounded-[24px] border shadow-[0_12px_32px_rgba(35,27,20,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(35,27,20,0.16)] ${
                      dark
                        ? "border-[#171717] bg-[#171717] text-white"
                        : "border-[#d2c8b8] bg-[#f4eee3] text-[#241a14]"
                    } ${
                      tall
                        ? "min-h-[275px] sm:min-h-[300px]"
                        : "min-h-[225px] sm:min-h-[250px]"
                    }`}
                  >
                    <div className="relative min-h-0 flex-1 overflow-hidden">
                      <BrandVisual brand={brand} />

                      <div
                        className={`pointer-events-none absolute inset-0 ${
                          dark
                            ? "bg-gradient-to-t from-black/25 via-transparent to-transparent"
                            : "bg-gradient-to-t from-[#241a14]/10 via-transparent to-transparent"
                        }`}
                      />

                      <span
                        className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
                          dark
                            ? "border-white/20 bg-black/20 text-white/70 group-hover:bg-white group-hover:text-[#171717]"
                            : "border-black/10 bg-white/75 text-[#241a14]/50 group-hover:bg-[#171717] group-hover:text-white"
                        }`}
                      >
                        ↗
                      </span>
                    </div>

                    <div
                      className={`relative px-4 py-4 sm:px-5 sm:py-[18px] ${
                        dark
                          ? "bg-[#171717]"
                          : "bg-[#f4eee3]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3
                          className={`truncate font-sans text-[15px] font-black uppercase leading-none tracking-[-0.025em] sm:text-[17px] ${
                            dark
                              ? "text-white"
                              : "text-[#241a14]"
                          }`}
                        >
                          {brand.name}
                        </h3>

                        <span
                          className={`shrink-0 text-[11px] font-bold opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 ${
                            dark
                              ? "text-[#d6b875]"
                              : "text-[#a38752]"
                          }`}
                        >
                          →
                        </span>
                      </div>

                      {brand.description && (
                        <p
                          className={`mt-2 line-clamp-1 text-[9px] leading-4 ${
                            dark
                              ? "text-white/40"
                              : "text-[#241a14]/40"
                          }`}
                        >
                          {brand.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-[#241a14]/[0.07] bg-[#f4eee3] px-6 py-16 text-center shadow-[0_10px_30px_rgba(54,39,27,0.04)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#241a14]/5">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path d="m20 20-4-4" />
                </svg>
              </div>

              <h3 className="mt-5 font-serif text-2xl">
                No brands found
              </h3>

              <p className="mt-2 text-sm text-[#241a14]/40">
                Try searching with another brand name.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-6 rounded-full bg-[#241a14] px-6 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b2b21]"
              >
                View all brands
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}