"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { supabase } from "../../../lib/supabase";

type Product = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  rating: number;
  review_count: number;
  is_active: boolean;
  is_bestseller: boolean;
  is_featured: boolean;

  brands: {
    name: string;
  } | null;

  categories: {
    name: string;
  } | null;
};

type StatusFilter = "all" | "active" | "inactive";

const PAGE_SIZE = 10;

function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "P";

  if (words.length === 1) {
    return words[0]?.slice(0, 2).toUpperCase() || "P";
  }

  return (
    `${words[0]?.charAt(0) || ""}${words[1]?.charAt(0) || ""}`.toUpperCase() ||
    "P"
  );
}

function SearchIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function BoxIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function ChevronLeft() {
  return (
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function getPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [page, setPage] = useState(1);

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);

  const [statsLoading, setStatsLoading] = useState(true);

  const totalPages = Math.max(
    1,
    Math.ceil(totalProducts / PAGE_SIZE)
  );

  const currentStart =
    totalProducts === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1;

  const currentEnd = Math.min(
    page * PAGE_SIZE,
    totalProducts
  );

  /*
   * Fetch ONLY the current 10 products.
   * Search + status are handled by Supabase itself.
   */
  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("products")
        .select(
          `
            id,
            name,
            slug,
            subtitle,
            rating,
            review_count,
            is_active,
            is_bestseller,
            is_featured,
            brands (
              name
            ),
            categories!products_category_id_fkey (
              name
            )
          `,
          { count: "exact" }
        )
        .order("created_at", {
          ascending: false,
        });

      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        const safeSearch = trimmedSearch
          .replace(/[%_]/g, "")
          .replace(/,/g, " ");

        query = query.or(
          `name.ilike.%${safeSearch}%,slug.ilike.%${safeSearch}%,subtitle.ilike.%${safeSearch}%`
        );
      }

      if (statusFilter === "active") {
        query = query.eq("is_active", true);
      }

      if (statusFilter === "inactive") {
        query = query.eq("is_active", false);
      }

      const {
        data,
        error: fetchError,
        count,
      } = await query.range(from, to);

      if (fetchError) {
        console.error("Admin products loading failed:", {
          raw: fetchError,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
        });

        toast.error("Could not load products", {
          description: fetchError.message,
        });

        setProducts([]);
        setLoading(false);
        return;
      }

      setProducts(
        (data ?? []) as unknown as Product[]
      );

      /*
       * This count is the count AFTER search/filter.
       * Therefore pagination also works correctly with filters.
       */
      setTotalProducts(count ?? 0);
    } catch (error) {
      console.error("Admin products request threw:", {
        raw: error,
        message: error instanceof Error ? error.message : String(error),
      });

      toast.error("Something went wrong", {
        description: "Could not load products.",
      });

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  /*
   * Load global stats separately.
   * These are lightweight count queries and DO NOT download
   * the complete products table.
   */
  const loadStats = useCallback(async () => {
    setStatsLoading(true);

    try {
      const [allResult, activeResult, inactiveResult] =
        await Promise.all([
          supabase
            .from("products")
            .select("id", {
              count: "exact",
              head: true,
            }),

          supabase
            .from("products")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("is_active", true),

          supabase
            .from("products")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("is_active", false),
        ]);

      if (allResult.error) {
        console.error("Products stats (all) failed:", {
          raw: allResult.error,
          message: allResult.error.message,
          details: allResult.error.details,
          hint: allResult.error.hint,
          code: allResult.error.code,
        });
      }

      if (activeResult.error) {
        console.error("Products stats (active) failed:", {
          raw: activeResult.error,
          message: activeResult.error.message,
          details: activeResult.error.details,
          hint: activeResult.error.hint,
          code: activeResult.error.code,
        });
      }

      if (inactiveResult.error) {
        console.error("Products stats (inactive) failed:", {
          raw: inactiveResult.error,
          message: inactiveResult.error.message,
          details: inactiveResult.error.details,
          hint: inactiveResult.error.hint,
          code: inactiveResult.error.code,
        });
      }

      setTotalProducts(
        allResult.count ?? 0
      );

      setTotalActive(
        activeResult.count ?? 0
      );

      setTotalInactive(
        inactiveResult.count ?? 0
      );
    } catch (error) {
      console.error("Admin products request threw:", {
        raw: error,
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /*
   * Initial/global stats.
   */
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /*
   * Current page data.
   */
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /*
   * If a product is deleted and current page becomes invalid,
   * move back to the last available page.
   */
  useEffect(() => {
    if (
      !loading &&
      totalProducts > 0 &&
      page > totalPages
    ) {
      setPage(totalPages);
    }

    if (
      !loading &&
      totalProducts === 0 &&
      page !== 1
    ) {
      setPage(1);
    }
  }, [
    loading,
    page,
    totalPages,
    totalProducts,
  ]);

  /*
   * Search/filter changes should always start from page 1.
   */
  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (
    value: StatusFilter
  ) => {
    setStatusFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  const hasFilters =
    search.trim().length > 0 ||
    statusFilter !== "all";

  const pageNumbers = useMemo(
    () => getPageNumbers(page, totalPages),
    [page, totalPages]
  );

  const pageActiveCount = products.filter(
    (product) => product.is_active
  ).length;

  const pageInactiveCount =
    products.length - pageActiveCount;

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#171512]">
      <div className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9c8250]" />

              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#9c8250]">
                Store Management
              </p>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">
                Products
              </h1>

              {!statsLoading && (
                <span className="rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-black/45 sm:px-3 sm:text-[9px]">
                  {totalProducts} total
                </span>
              )}
            </div>

            <p className="mt-2 max-w-xl text-[11px] leading-5 text-black/40 sm:text-xs">
              Manage your product catalog, variants,
              visibility and storefront content.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#171512] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f5f2eb] shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:bg-black sm:w-auto"
          >
            <span className="text-base font-light leading-none">
              +
            </span>
            Add Product
          </Link>
        </div>

        {/* =====================================================
            GLOBAL STATS
        ====================================================== */}
        <section className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/35">
              Total Products
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
              {statsLoading ? "—" : totalProducts}
            </p>

            <p className="mt-1 text-[8px] text-black/30">
              Entire catalog
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/35">
              Active
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />

              <p className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                {statsLoading ? "—" : totalActive}
              </p>
            </div>

            <p className="mt-1 text-[8px] text-black/30">
              Currently visible
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/35">
              Inactive
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-black/20" />

              <p className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                {statsLoading ? "—" : totalInactive}
              </p>
            </div>

            <p className="mt-1 text-[8px] text-black/30">
              Hidden from storefront
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/35">
              Current Page
            </p>

            <div className="mt-2 flex items-baseline gap-1.5">
              <p className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                {loading ? "—" : products.length}
              </p>

              {!loading && (
                <span className="text-[8px] text-black/30">
                  / 10
                </span>
              )}
            </div>

            <p className="mt-1 text-[8px] text-black/30">
              {loading
                ? "Loading..."
                : `${pageActiveCount} active · ${pageInactiveCount} inactive`}
            </p>
          </div>
        </section>

        {/* =====================================================
            TOOLBAR
        ====================================================== */}
        <section className="mt-5 rounded-2xl border border-black/[0.07] bg-white p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-black/[0.08] bg-[#faf9f6] px-3.5 transition focus-within:border-black/20 focus-within:bg-white">
              <span className="mr-3 shrink-0 text-black/30">
                <SearchIcon />
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  handleSearchChange(
                    event.target.value
                  )
                }
                placeholder="Search products, brands, categories..."
                className="min-w-0 w-full bg-transparent text-xs outline-none placeholder:text-black/30"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    handleSearchChange("")
                  }
                  className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base text-black/35 transition hover:bg-black/[0.05] hover:text-black"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="grid h-11 w-full grid-cols-3 items-center gap-1 rounded-xl border border-black/[0.08] bg-[#faf9f6] p-1 lg:w-auto lg:min-w-[255px]">
              {(
                [
                  ["all", "All"],
                  ["active", "Active"],
                  ["inactive", "Inactive"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    handleStatusChange(value)
                  }
                  className={`h-9 rounded-lg px-2 text-[8px] font-bold uppercase tracking-[0.08em] transition sm:px-3 sm:text-[9px] ${
                    statusFilter === value
                      ? "bg-[#171512] text-white shadow-sm"
                      : "text-black/40 hover:bg-white hover:text-black"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter information */}
          <div className="mt-3 flex flex-col gap-2 border-t border-black/[0.06] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] text-black/40">
              {loading ? (
                "Loading products..."
              ) : totalProducts === 0 ? (
                "No products found"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-black/60">
                    {currentStart}–{currentEnd}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-black/60">
                    {totalProducts}
                  </span>
                </>
              )}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="self-start text-[9px] font-bold uppercase tracking-[0.1em] text-[#9c8250] transition hover:text-[#806b42] sm:self-auto"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* =====================================================
            PRODUCT CONTENT
        ====================================================== */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.025)]">

          {/* Loading skeleton */}
          {loading && (
            <>
              {/* Desktop */}
              <div className="hidden lg:block">
                <div className="border-b border-black/[0.07] bg-[#faf9f6] px-6 py-3">
                  <div className="grid grid-cols-[2fr_1fr_1fr_0.7fr_1fr_0.6fr] gap-4">
                    {[
                      1, 2, 3, 4, 5, 6,
                    ].map((item) => (
                      <div
                        key={item}
                        className="h-2 animate-pulse rounded bg-black/[0.06]"
                      />
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-black/[0.05]">
                  {[1, 2, 3, 4, 5].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-4 px-6 py-5"
                      >
                        <div className="h-12 w-12 animate-pulse rounded-xl bg-black/[0.05]" />

                        <div className="min-w-0 flex-1">
                          <div className="h-3 w-52 animate-pulse rounded bg-black/[0.06]" />
                          <div className="mt-2 h-2.5 w-72 animate-pulse rounded bg-black/[0.04]" />
                        </div>

                        <div className="hidden h-3 w-20 animate-pulse rounded bg-black/[0.05] xl:block" />

                        <div className="hidden h-3 w-24 animate-pulse rounded bg-black/[0.05] xl:block" />

                        <div className="hidden h-3 w-16 animate-pulse rounded bg-black/[0.05] sm:block" />

                        <div className="h-7 w-16 animate-pulse rounded-full bg-black/[0.05]" />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-black/[0.05] lg:hidden">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="p-4 sm:p-5"
                  >
                    <div className="flex gap-3">
                      <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-black/[0.05]" />

                      <div className="min-w-0 flex-1">
                        <div className="h-3 w-40 animate-pulse rounded bg-black/[0.06]" />
                        <div className="mt-2 h-2.5 w-full max-w-[240px] animate-pulse rounded bg-black/[0.04]" />

                        <div className="mt-4 flex gap-2">
                          <div className="h-6 w-16 animate-pulse rounded-lg bg-black/[0.05]" />
                          <div className="h-6 w-20 animate-pulse rounded-lg bg-black/[0.05]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty */}
          {!loading &&
            products.length === 0 && (
              <div className="flex min-h-[360px] items-center justify-center px-5 py-12">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f2eb] text-black/30">
                    <BoxIcon size={25} />
                  </div>

                  <h2 className="mt-5 text-base font-semibold">
                    {hasFilters
                      ? "No matching products"
                      : "Your catalog is empty"}
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-black/40">
                    {hasFilters
                      ? "Try another search or change the status filter."
                      : "Add your first product to start building the Seven Bucks Nutrition catalog."}
                  </p>

                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-6 inline-flex h-10 items-center rounded-xl bg-[#171512] px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-black"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <Link
                      href="/admin/products/new"
                      className="mt-6 inline-flex h-10 items-center rounded-xl bg-[#171512] px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-black"
                    >
                      Add First Product
                    </Link>
                  )}
                </div>
              </div>
            )}

          {/* Products */}
          {!loading &&
            products.length > 0 && (
              <>
                {/* =================================================
                    DESKTOP TABLE
                ================================================== */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[980px]">
                    <thead>
                      <tr className="border-b border-black/[0.07] bg-[#faf9f6] text-left">
                        <th className="px-6 py-3.5 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Product
                        </th>

                        <th className="px-4 py-3.5 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Brand
                        </th>

                        <th className="px-4 py-3.5 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Category
                        </th>

                        <th className="px-4 py-3.5 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Rating
                        </th>

                        <th className="px-4 py-3.5 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Status
                        </th>

                        <th className="px-6 py-3.5 text-right text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.map(
                        (product) => (
                          <tr
                            key={product.id}
                            className="group border-b border-black/[0.05] transition hover:bg-[#faf9f6]/70 last:border-0"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3.5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-[#f5f2eb] text-[10px] font-bold text-black/45">
                                  {getInitials(
                                    product.name
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="max-w-[310px] truncate text-xs font-semibold">
                                      {product.name}
                                    </p>

                                    {product.is_bestseller && (
                                      <span className="hidden rounded-full bg-[#171512] px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-white xl:inline-flex">
                                        Bestseller
                                      </span>
                                    )}
                                  </div>

                                  {product.subtitle && (
                                    <p className="mt-1 max-w-[340px] truncate text-[9px] text-black/35">
                                      {
                                        product.subtitle
                                      }
                                    </p>
                                  )}

                                  <p className="mt-1 max-w-[340px] truncate font-mono text-[8px] text-black/25">
                                    /{product.slug}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-xs text-black/60">
                              {product.brands?.name ??
                                "—"}
                            </td>

                            <td className="px-4 py-4">
                              <span className="inline-flex rounded-lg bg-[#f5f2eb] px-2.5 py-1.5 text-[8px] font-semibold text-black/50">
                                {product.categories
                                  ?.name ??
                                  "Uncategorized"}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold">
                                  {Number(
                                    product.rating || 0
                                  ).toFixed(1)}
                                </span>

                                <span className="text-[10px] text-[#9c8250]">
                                  ★
                                </span>

                                <span className="text-[8px] text-black/30">
                                  {product.review_count ||
                                    0}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${
                                    product.is_active
                                      ? "bg-green-50 text-green-700"
                                      : "bg-black/[0.05] text-black/40"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      product.is_active
                                        ? "bg-green-500"
                                        : "bg-black/20"
                                    }`}
                                  />

                                  {product.is_active
                                    ? "Active"
                                    : "Inactive"}
                                </span>

                                {product.is_featured && (
                                  <span className="inline-flex rounded-full bg-[#f5f2eb] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-[#8a7247]">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3.5 text-[9px] font-bold uppercase tracking-[0.1em] text-black/55 transition hover:border-black/20 hover:bg-[#171512] hover:text-white"
                              >
                                Edit
                                <span className="text-xs">
                                  →
                                </span>
                              </Link>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    MOBILE PRODUCT CARDS
                ================================================== */}
                <div className="divide-y divide-black/[0.06] lg:hidden">
                  {products.map(
                    (product, index) => (
                      <article
                        key={product.id}
                        className="p-4 sm:p-5"
                      >
                        <div className="flex gap-3.5">
                          {/* Number + initials */}
                          <div className="relative shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-black/[0.07] bg-[#f5f2eb] text-[10px] font-bold text-black/45">
                              {getInitials(
                                product.name
                              )}
                            </div>

                            <span className="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#171512] px-1 text-[7px] font-bold text-white">
                              {(page - 1) *
                                PAGE_SIZE +
                                index +
                                1}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* Name + Status */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <p className="break-words text-xs font-semibold leading-4">
                                    {product.name}
                                  </p>

                                  {product.is_bestseller && (
                                    <span className="shrink-0 rounded-full bg-[#171512] px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.06em] text-white">
                                      Bestseller
                                    </span>
                                  )}
                                </div>

                                {product.subtitle && (
                                  <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-black/40">
                                    {
                                      product.subtitle
                                    }
                                  </p>
                                )}
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.08em] ${
                                  product.is_active
                                    ? "bg-green-50 text-green-700"
                                    : "bg-black/[0.05] text-black/40"
                                }`}
                              >
                                {product.is_active
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>

                            {/* Meta */}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              <span className="max-w-full truncate rounded-lg bg-[#f5f2eb] px-2 py-1 text-[8px] font-semibold text-black/45">
                                {product.brands?.name ??
                                  "No brand"}
                              </span>

                              <span className="max-w-full truncate rounded-lg bg-[#f5f2eb] px-2 py-1 text-[8px] font-semibold text-black/45">
                                {product.categories
                                  ?.name ??
                                  "No category"}
                              </span>

                              {product.is_featured && (
                                <span className="rounded-lg bg-[#f5f2eb] px-2 py-1 text-[8px] font-semibold text-[#8a7247]">
                                  Featured
                                </span>
                              )}
                            </div>

                            {/* Bottom row */}
                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 text-[9px] text-black/40">
                                  <span className="font-semibold text-black/65">
                                    {Number(
                                      product.rating ||
                                        0
                                    ).toFixed(1)}
                                  </span>

                                  <span className="text-[#9c8250]">
                                    ★
                                  </span>

                                  <span>
                                    {product.review_count ||
                                      0}{" "}
                                    reviews
                                  </span>
                                </div>

                                <p className="mt-1 max-w-[180px] truncate font-mono text-[7px] text-black/20">
                                  /{product.slug}
                                </p>
                              </div>

                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 text-[8px] font-bold uppercase tracking-[0.1em] text-black/55 transition active:scale-[0.98] hover:border-black/20 hover:bg-[#171512] hover:text-white"
                              >
                                Edit
                                <span className="text-xs">
                                  →
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </>
            )}
        </section>

        {/* =====================================================
            PAGINATION
        ====================================================== */}
        {!loading &&
          totalProducts > 0 && (
            <section className="mt-4 rounded-2xl border border-black/[0.07] bg-white p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Info */}
                <div className="text-center sm:text-left">
                  <p className="text-[9px] text-black/35">
                    Page{" "}
                    <span className="font-semibold text-black/60">
                      {page}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-black/60">
                      {totalPages}
                    </span>
                  </p>

                  <p className="mt-0.5 text-[8px] text-black/25">
                    {currentStart}–{currentEnd} of{" "}
                    {totalProducts} products
                  </p>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-black/45 transition hover:bg-[#f5f2eb] hover:text-black disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </button>

                  {/* Desktop page numbers */}
                  <div className="hidden items-center gap-1 sm:flex">
                    {pageNumbers.map(
                      (pageNumber, index) => {
                        if (
                          pageNumber === "..."
                        ) {
                          return (
                            <span
                              key={`dots-${index}`}
                              className="flex h-9 w-7 items-center justify-center text-[9px] text-black/25"
                            >
                              …
                            </span>
                          );
                        }

                        return (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() =>
                              setPage(
                                pageNumber as number
                              )
                            }
                            className={`h-9 min-w-9 rounded-lg px-2 text-[9px] font-bold transition ${
                              page ===
                              pageNumber
                                ? "bg-[#171512] text-white"
                                : "border border-black/[0.08] bg-white text-black/45 hover:bg-[#f5f2eb] hover:text-black"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                    )}
                  </div>

                  {/* Mobile current page */}
                  <div className="flex h-9 min-w-[74px] items-center justify-center rounded-lg bg-[#171512] px-3 text-[8px] font-bold uppercase tracking-[0.08em] text-white sm:hidden">
                    {page} / {totalPages}
                  </div>

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-black/45 transition hover:bg-[#f5f2eb] hover:text-black disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </section>
          )}

        {/* =====================================================
            FOOTER
        ====================================================== */}
        {!loading &&
          totalProducts > 0 && (
            <div className="flex flex-col gap-1 px-1 py-4 text-center text-[8px] text-black/25 sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <span>
                {products.length} products loaded from
                Supabase for this page
              </span>

              <span className="font-mono">
                Seven Bucks Nutrition · Admin
              </span>
            </div>
          )}
      </div>
    </main>
  );
}