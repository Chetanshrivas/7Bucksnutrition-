"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getCategories,
  getBrands,
  getProductsPage,
  type Category,
  type Brand,
  type Product,
  type ProductSortOption,
} from "../../lib/products";

import ProductCard from "../ui/ProductCard";

const PAGE_SIZE = 20;

type SortOption = ProductSortOption;

/* =========================================================
   ICONS
========================================================= */

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function SearchEmptyIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
      <path d="M8 11h6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/* =========================================================
   SHOP PAGE
========================================================= */

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);

  const [sortBy, setSortBy] =
    useState<SortOption>("featured");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [mobileCategoryOpen, setMobileCategoryOpen] =
    useState(false);

  const [mobileBrandOpen, setMobileBrandOpen] =
    useState(false);

  /* =========================================================
     MAIN CATEGORIES
  ========================================================= */

  const mainCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.parent_id === null
      ),
    [categories]
  );

  /* =========================================================
     ACTIVE CATEGORY
  ========================================================= */

  const activeCategoryObject = useMemo(
    () =>
      categories.find(
        (category) => category.id === activeCategory
      ),
    [categories, activeCategory]
  );

  const activeMainCategory = useMemo(() => {
    if (!activeCategoryObject) {
      return null;
    }

    if (activeCategoryObject.parent_id === null) {
      return activeCategoryObject;
    }

    return (
      categories.find(
        (category) =>
          category.id === activeCategoryObject.parent_id
      ) ?? null
    );
  }, [activeCategoryObject, categories]);

  const subCategories = useMemo(() => {
    if (!activeMainCategory) {
      return [];
    }

    return categories.filter(
      (category) =>
        category.parent_id === activeMainCategory.id
    );
  }, [activeMainCategory, categories]);

  /* =========================================================
     CATEGORY IDS FOR QUERY
  ========================================================= */

  const categoryIdsForQuery = useMemo(() => {
    if (activeCategory === "all") {
      return undefined;
    }

    if (activeCategoryObject?.parent_id === null) {
      const children = categories
        .filter(
          (category) =>
            category.parent_id === activeCategoryObject.id
        )
        .map((category) => category.id);

      return children.length > 0
        ? children
        : [activeCategoryObject.id];
    }

    return [activeCategory];
  }, [
    activeCategory,
    activeCategoryObject,
    categories,
  ]);

  /* =========================================================
     SELECTED BRANDS
  ========================================================= */

  const selectedBrands = useMemo(
    () =>
      brands.filter((brand) =>
        selectedBrandIds.includes(brand.id)
      ),
    [brands, selectedBrandIds]
  );

  const selectedBrandLabel = useMemo(() => {
    if (selectedBrands.length === 0) {
      return "All Brands";
    }

    if (selectedBrands.length === 1) {
      return selectedBrands[0]?.name ?? "All Brands";
    }

    if (selectedBrands.length === 2) {
      return selectedBrands
        .map((brand) => brand.name)
        .join(" + ");
    }

    return `${selectedBrands.length} Brands`;
  }, [selectedBrands]);

  /* =========================================================
     LOAD CATEGORIES + BRANDS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      try {
        const [categoryData, brandData] =
          await Promise.all([
            getCategories(),
            getBrands(),
          ]);

        if (cancelled) {
          return;
        }

        setCategories(categoryData);
        setBrands(brandData);
      } catch (error) {
        console.error(
          "Shop filters loading failed:",
          error
        );
      }
    }

    void loadFilters();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     READ URL FILTERS

     Supports:

     /shop?brands=muscletech
     /shop?brands=muscletech,muscleblaze
     /shop?brand=muscletech

     Also supports brand IDs.
  ========================================================= */

  useEffect(() => {
    if (
      categories.length === 0 &&
      brands.length === 0
    ) {
      return;
    }

    const categoryFromUrl =
      searchParams.get("category");

    if (!categoryFromUrl) {
      setActiveCategory("all");
    } else {
      const matchedCategory =
        categories.find(
          (category) =>
            category.id === categoryFromUrl ||
            category.slug === categoryFromUrl
        );

      setActiveCategory(
        matchedCategory?.id ?? "all"
      );
    }

    /*
     * Support both:
     *
     * ?brands=a,b
     *
     * and:
     *
     * ?brand=a
     */

    const brandsFromUrl =
      searchParams.get("brands") ??
      searchParams.get("brand");

    if (!brandsFromUrl) {
      setSelectedBrandIds([]);
    } else {
      const urlBrandValues =
        brandsFromUrl
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean);

      const matchedBrandIds =
        brands
          .filter(
            (brand) =>
              urlBrandValues.includes(brand.id) ||
              urlBrandValues.includes(brand.slug)
          )
          .map((brand) => brand.id);

      setSelectedBrandIds(
        Array.from(new Set(matchedBrandIds))
      );
    }

    setCurrentPage(1);
  }, [
    categories,
    brands,
    searchParams,
  ]);

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      if (categories.length === 0) {
        return;
      }

      setPageLoading(true);

      try {
        const result =
          await getProductsPage({
            page: currentPage,
            pageSize: PAGE_SIZE,

            categoryId: activeCategory,

            categoryIds:
              categoryIdsForQuery,

            brandIds:
              selectedBrandIds,

            search,

            sortBy,
          });

        if (cancelled) {
          return;
        }

        setProducts(result.products);
        setTotalProducts(result.total);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error(
          "Shop products loading failed:",
          error
        );

        if (!cancelled) {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setPageLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    activeCategory,
    categoryIdsForQuery,
    categories.length,
    selectedBrandIds,
    search,
    sortBy,
  ]);

  /* =========================================================
     CHANGE CATEGORY
  ========================================================= */

  const changeCategory = (
    categoryId: string
  ) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
    setMobileCategoryOpen(false);

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (categoryId === "all") {
      params.delete("category");
    } else {
      const selected =
        categories.find(
          (category) =>
            category.id === categoryId
        );

      params.set(
        "category",
        selected?.slug ?? categoryId
      );
    }

    const query = params.toString();

    router.replace(
      query
        ? `/shop?${query}`
        : "/shop",
      {
        scroll: false,
      }
    );
  };

  /* =========================================================
     TOGGLE BRAND

     IMPORTANT:
     router.replace() MUST NOT be inside
     setSelectedBrandIds updater.

     This fixes:

     Cannot update a component (Router)
     while rendering a different component (ShopPage)
  ========================================================= */

  const toggleBrand = (
    brandId: string
  ) => {
    const exists =
      selectedBrandIds.includes(brandId);

    const next = exists
      ? selectedBrandIds.filter(
          (id) => id !== brandId
        )
      : [
          ...selectedBrandIds,
          brandId,
        ];

    setSelectedBrandIds(next);
    setCurrentPage(1);

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (next.length === 0) {
      params.delete("brands");
      params.delete("brand");
    } else {
      const brandSlugs =
        next
          .map(
            (id) =>
              brands.find(
                (brand) =>
                  brand.id === id
              )?.slug
          )
          .filter(
            (
              slug
            ): slug is string =>
              Boolean(slug)
          );

      params.delete("brand");

      if (brandSlugs.length > 0) {
        params.set(
          "brands",
          brandSlugs.join(",")
        );
      } else {
        params.delete("brands");
      }
    }

    const query =
      params.toString();

    router.replace(
      query
        ? `/shop?${query}`
        : "/shop",
      {
        scroll: false,
      }
    );
  };

  /* =========================================================
     CLEAR BRANDS
  ========================================================= */

  const clearBrands = () => {
    setSelectedBrandIds([]);
    setCurrentPage(1);

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.delete("brands");
    params.delete("brand");

    const query =
      params.toString();

    router.replace(
      query
        ? `/shop?${query}`
        : "/shop",
      {
        scroll: false,
      }
    );
  };

  /* =========================================================
     SORT
  ========================================================= */

  const changeSort = (
    value: SortOption
  ) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const changeSearch = (
    value: string
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    setSearch("");
    setSortBy("featured");
    setActiveCategory("all");
    setSelectedBrandIds([]);
    setCurrentPage(1);
    setMobileCategoryOpen(false);
    setMobileBrandOpen(false);

    router.replace("/shop", {
      scroll: false,
    });
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const paginationItems = () => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const items: (
      | number
      | "ellipsis-left"
      | "ellipsis-right"
    )[] = [1];

    if (currentPage > 3) {
      items.push("ellipsis-left");
    }

    const start =
      Math.max(
        2,
        currentPage - 1
      );

    const end =
      Math.min(
        totalPages - 1,
        currentPage + 1
      );

    for (
      let page = start;
      page <= end;
      page += 1
    ) {
      if (!items.includes(page)) {
        items.push(page);
      }
    }

    if (
      currentPage <
      totalPages - 2
    ) {
      items.push("ellipsis-right");
    }

    if (
      !items.includes(totalPages)
    ) {
      items.push(totalPages);
    }

    return items;
  };

  const selectedLabel =
    activeCategory === "all"
      ? "All Products"
      : activeCategoryObject?.name ??
        "Category";

  const hasActiveCategory =
    activeCategory !== "all";

  const showingParentCategory =
    activeCategory !== "all" &&
    activeCategoryObject?.parent_id ===
      null;

  /* =========================================================
     SKELETON
  ========================================================= */

  const skeletonCards =
    Array.from(
      { length: PAGE_SIZE },
      (_, index) => (
        <div
          key={index}
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white"
        >
          <div className="aspect-square animate-pulse bg-black/[0.06]" />

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-black/[0.08]" />
            <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-black/[0.08]" />
            <div className="h-2.5 w-2/5 animate-pulse rounded-full bg-black/[0.06]" />
            <div className="mt-1 h-4 w-1/3 animate-pulse rounded-full bg-black/[0.08]" />

            <div className="mt-1 flex gap-1.5">
              <div className="h-5 w-10 animate-pulse rounded-full bg-black/[0.06]" />
              <div className="h-5 w-10 animate-pulse rounded-full bg-black/[0.06]" />
            </div>
          </div>

          <div className="p-4 pt-0">
            <div className="h-10 w-full animate-pulse rounded-full bg-black/[0.08]" />
          </div>
        </div>
      )
    );

  /* =========================================================
     INITIAL LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] text-[#171512]">
        <section className="border-b border-black/[0.08] px-5 pb-8 pt-36 sm:px-8 sm:pb-10 lg:px-12 lg:pt-40">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a27d37]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a27d37]">
                Seven Bucks Nutrition
              </p>
            </div>

            <h1 className="max-w-[850px] text-[clamp(52px,7vw,96px)] font-semibold leading-[0.9] tracking-[-0.065em]">
              Shop
              <span className="ml-3 font-serif italic text-[#a27d37]">
                Performance.
              </span>
            </h1>
          </div>
        </section>

        <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
              {skeletonCards}
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f5f2eb] text-[#171512]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-black/[0.08] px-5 pb-8 pt-36 sm:px-8 sm:pb-10 lg:px-12 lg:pt-40">
        <div className="mx-auto max-w-[1440px]">

          <div className="mb-8 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-black/35">
            <Link
              href="/"
              className="transition-colors hover:text-black"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-black/70">
              Shop
            </span>

            {hasActiveCategory && (
              <>
                <span>/</span>

                <span className="text-[#a27d37]">
                  {selectedLabel}
                </span>
              </>
            )}

            {selectedBrandIds.length > 0 && (
              <>
                <span>/</span>

                <span className="max-w-[180px] truncate text-[#a27d37]">
                  {selectedBrandLabel}
                </span>
              </>
            )}
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">

            <div>
              <div className="mb-3 inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a27d37]" />

                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a27d37]">
                  Seven Bucks Nutrition
                </p>
              </div>

              <h1 className="max-w-[850px] text-[clamp(52px,7vw,96px)] font-semibold leading-[0.9] tracking-[-0.065em]">
                Shop
                <span className="ml-3 font-serif italic text-[#a27d37]">
                  Performance.
                </span>
              </h1>

              <p className="mt-6 max-w-[560px] text-[13px] leading-6 text-black/50">
                Every product here earns its place on the shelf —
                dosed the way the research says, verified before it
                ships.
              </p>
            </div>

            <div className="flex items-end gap-7 lg:pb-1">

              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/30">
                  Collection
                </p>

                <p className="mt-2 max-w-[140px] truncate text-sm font-semibold">
                  {selectedLabel}
                </p>
              </div>

              <div className="h-12 w-px bg-black/10" />

              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/30">
                  Products
                </p>

                <p className="mt-2 font-serif text-xl italic text-[#a27d37]">
                  {totalProducts}
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <section className="sticky top-0 z-30 border-b border-black/[0.08] bg-[#f5f2eb]/95 px-5 backdrop-blur-md sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">

          {/* DESKTOP */}

          <div className="hidden md:block">

            <div className="flex min-h-[76px] items-center justify-between gap-6">

              {/* CATEGORY */}

              <div className="flex min-w-0 items-center gap-2 overflow-x-auto py-3 scrollbar-none">

                <button
                  type="button"
                  onClick={() =>
                    changeCategory("all")
                  }
                  className={`shrink-0 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.13em] transition-all ${
                    activeCategory === "all"
                      ? "bg-[#171512] text-white shadow-[0_6px_16px_rgba(23,21,18,0.25)]"
                      : "border border-black/10 bg-white/40 text-black/45 hover:border-black/20 hover:bg-white hover:text-black"
                  }`}
                >
                  All Categories
                </button>

                {mainCategories.map(
                  (category) => {
                    const active =
                      activeCategory ===
                        category.id ||
                      activeMainCategory?.id ===
                        category.id;

                    const childCount =
                      categories.filter(
                        (child) =>
                          child.parent_id ===
                          category.id
                      ).length;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          changeCategory(
                            category.id
                          )
                        }
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.13em] transition-all ${
                          active
                            ? "bg-[#171512] text-white shadow-[0_6px_16px_rgba(23,21,18,0.25)]"
                            : "border border-black/10 bg-white/40 text-black/45 hover:border-black/20 hover:bg-white hover:text-black"
                        }`}
                      >
                        {category.name}

                        {childCount > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[7px] ${
                              active
                                ? "bg-white/20"
                                : "bg-black/[0.06]"
                            }`}
                          >
                            {childCount}
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {/* SEARCH + BRAND + SORT */}

              <div className="flex shrink-0 items-center gap-2">

                {/* SEARCH */}

                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30">
                    <SearchIcon />
                  </span>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      changeSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search products"
                    className="h-10 w-44 rounded-full border border-black/10 bg-white/50 pl-10 pr-4 text-[10px] outline-none transition-all placeholder:text-black/25 focus:border-black/25 focus:bg-white"
                    aria-label="Search products"
                  />
                </div>

                {/* BRAND */}

                <div className="relative">

                  <button
                    type="button"
                    onClick={() =>
                      setMobileBrandOpen(
                        (open) => !open
                      )
                    }
                    className={`flex h-10 max-w-[190px] items-center gap-2 rounded-full border px-4 text-[9px] font-bold uppercase tracking-[0.1em] transition ${
                      selectedBrandIds.length > 0
                        ? "border-[#a27d37]/40 bg-[#a27d37]/10 text-[#8b692d]"
                        : "border-black/10 bg-white/50 text-black/55 hover:bg-white"
                    }`}
                  >
                    <span className="max-w-[130px] truncate">
                      {selectedBrandLabel}
                    </span>

                    {selectedBrandIds.length > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a27d37] px-1 text-[7px] text-white">
                        {selectedBrandIds.length}
                      </span>
                    )}

                    <ChevronDown
                      open={mobileBrandOpen}
                    />
                  </button>

                  {mobileBrandOpen && (
                    <div className="absolute right-0 top-12 z-50 w-[260px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]">

                      <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">

                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/35">
                            Filter by
                          </p>

                          <p className="mt-1 text-[11px] font-semibold">
                            Brands
                          </p>
                        </div>

                        {selectedBrandIds.length > 0 && (
                          <button
                            type="button"
                            onClick={clearBrands}
                            className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#a27d37] hover:text-black"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="max-h-[320px] overflow-y-auto p-2">

                        <button
                          type="button"
                          onClick={clearBrands}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                            selectedBrandIds.length === 0
                              ? "bg-[#171512] text-white"
                              : "hover:bg-[#f5f2eb]"
                          }`}
                        >
                          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">
                            All Brands
                          </span>

                          {selectedBrandIds.length === 0 && (
                            <CheckIcon />
                          )}
                        </button>

                        {brands.map(
                          (brand) => {
                            const selected =
                              selectedBrandIds.includes(
                                brand.id
                              );

                            return (
                              <button
                                key={brand.id}
                                type="button"
                                onClick={() =>
                                  toggleBrand(
                                    brand.id
                                  )
                                }
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                                  selected
                                    ? "bg-[#f5f2eb]"
                                    : "hover:bg-[#f5f2eb]"
                                }`}
                              >
                                <span className="flex min-w-0 items-center gap-3">

                                  <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                      selected
                                        ? "border-[#a27d37] bg-[#a27d37] text-white"
                                        : "border-black/10 bg-black/[0.02] text-transparent"
                                    }`}
                                  >
                                    <CheckIcon />
                                  </span>

                                  <span className="truncate text-[9px] font-bold uppercase tracking-[0.08em]">
                                    {brand.name}
                                  </span>

                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>

                      {selectedBrandIds.length > 0 && (
                        <div className="border-t border-black/[0.06] px-3 py-2.5">
                          <p className="text-center text-[8px] font-semibold uppercase tracking-[0.12em] text-black/30">
                            {selectedBrandIds.length} brand
                            {selectedBrandIds.length > 1
                              ? "s"
                              : ""}{" "}
                            selected
                          </p>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* SORT */}

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      changeSort(
                        event.target
                          .value as SortOption
                      )
                    }
                    className="h-10 appearance-none rounded-full border border-black/10 bg-white/50 pl-4 pr-8 text-[9px] font-bold uppercase tracking-[0.1em] outline-none transition hover:bg-white"
                    aria-label="Sort products"
                  >
                    <option value="featured">
                      Featured
                    </option>

                    <option value="rating">
                      Top Rated
                    </option>

                    <option value="price-low">
                      Price: Low
                    </option>

                    <option value="price-high">
                      Price: High
                    </option>
                  </select>

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/30">
                    <ChevronDown open={false} />
                  </span>
                </div>

              </div>
            </div>

            {/* SUB CATEGORIES */}

            {activeMainCategory &&
              subCategories.length > 0 && (
                <div className="flex items-center gap-4 border-t border-black/[0.06] py-3">

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#a27d37]" />

                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/35">
                      {activeMainCategory.name}
                    </span>
                  </div>

                  <div className="h-4 w-px bg-black/10" />

                  <div className="flex min-w-0 gap-1.5 overflow-x-auto scrollbar-none">

                    {subCategories.map(
                      (category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() =>
                            changeCategory(
                              category.id
                            )
                          }
                          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] transition ${
                            activeCategory ===
                            category.id
                              ? "bg-[#a27d37] text-white"
                              : "text-black/40 hover:bg-white hover:text-black"
                          }`}
                        >
                          {category.name}
                        </button>
                      )
                    )}

                  </div>

                  {activeCategoryObject?.parent_id && (
                    <button
                      type="button"
                      onClick={() =>
                        changeCategory(
                          activeMainCategory.id
                        )
                      }
                      className="ml-auto hidden shrink-0 text-[8px] font-bold uppercase tracking-[0.1em] text-[#a27d37] transition hover:text-black lg:block"
                    >
                      All {activeMainCategory.name}
                    </button>
                  )}

                </div>
              )}

          </div>

          {/* MOBILE */}

          <div className="py-3 md:hidden">

            <div className="grid grid-cols-2 gap-2">

              {/* CATEGORY */}

              <button
                type="button"
                onClick={() =>
                  setMobileCategoryOpen(
                    (open) => !open
                  )
                }
                className="flex h-12 min-w-0 items-center justify-between rounded-2xl border border-black/10 bg-white/60 px-4 text-left shadow-sm transition active:scale-[0.98]"
              >
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-black/30">
                    Category
                  </p>

                  <p className="mt-0.5 truncate text-[11px] font-semibold">
                    {selectedLabel}
                  </p>
                </div>

                <ChevronDown
                  open={mobileCategoryOpen}
                />
              </button>

              {/* BRAND */}

              <button
                type="button"
                onClick={() =>
                  setMobileBrandOpen(
                    (open) => !open
                  )
                }
                className={`flex h-12 min-w-0 items-center justify-between rounded-2xl border px-4 text-left shadow-sm transition active:scale-[0.98] ${
                  selectedBrandIds.length > 0
                    ? "border-[#a27d37]/40 bg-[#a27d37]/10"
                    : "border-black/10 bg-white/60"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-black/30">
                    Brand
                  </p>

                  <p className="mt-0.5 truncate text-[11px] font-semibold">
                    {selectedBrandLabel}
                  </p>
                </div>

                <ChevronDown
                  open={mobileBrandOpen}
                />
              </button>

            </div>

            {/* SEARCH + SORT */}

            <div className="mt-2 flex gap-2">

              <div className="flex h-11 min-w-0 flex-1 items-center rounded-2xl border border-black/10 bg-white/50 px-3.5 shadow-sm">

                <span className="mr-2 text-black/30">
                  <SearchIcon />
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    changeSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search products..."
                  className="min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:text-black/25"
                  aria-label="Search products"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      changeSearch("")
                    }
                    className="ml-2 text-lg leading-none text-black/30"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}

              </div>

              <div className="relative w-[112px] shrink-0">

                <select
                  value={sortBy}
                  onChange={(event) =>
                    changeSort(
                      event.target
                        .value as SortOption
                    )
                  }
                  className="h-11 w-full appearance-none rounded-2xl border border-black/10 bg-white/60 pl-3 pr-6 text-[8px] font-bold uppercase tracking-[0.08em] shadow-sm outline-none"
                  aria-label="Sort products"
                >
                  <option value="featured">
                    Featured
                  </option>

                  <option value="rating">
                    Top Rated
                  </option>

                  <option value="price-low">
                    Low Price
                  </option>

                  <option value="price-high">
                    High Price
                  </option>
                </select>

                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-black/30">
                  <ChevronDown open={false} />
                </span>

              </div>
            </div>

            {/* MOBILE CATEGORY MENU */}

            {mobileCategoryOpen && (
              <>
                <div
                  onClick={() =>
                    setMobileCategoryOpen(false)
                  }
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                  aria-hidden="true"
                />

                <div className="relative z-50 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]">

                  <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">

                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                      Browse categories
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setMobileCategoryOpen(false)
                      }
                      className="flex h-6 w-6 items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black"
                      aria-label="Close category menu"
                    >
                      ×
                    </button>

                  </div>

                  <div className="max-h-[60vh] overflow-y-auto p-2">

                    <button
                      type="button"
                      onClick={() =>
                        changeCategory("all")
                      }
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] ${
                        activeCategory === "all"
                          ? "bg-[#171512] text-white"
                          : "text-black/50 hover:bg-[#f5f2eb]"
                      }`}
                    >
                      All Categories

                      {activeCategory === "all" && (
                        <ArrowRight />
                      )}
                    </button>

                    {mainCategories.map(
                      (category) => {
                        const children =
                          categories.filter(
                            (child) =>
                              child.parent_id ===
                              category.id
                          );

                        const mainActive =
                          activeCategory ===
                            category.id ||
                          activeMainCategory?.id ===
                            category.id;

                        return (
                          <div
                            key={category.id}
                            className="mt-1"
                          >

                            <button
                              type="button"
                              onClick={() =>
                                changeCategory(
                                  category.id
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] ${
                                mainActive
                                  ? "bg-[#f5f2eb] text-black"
                                  : "text-black/50 hover:bg-[#f5f2eb]"
                              }`}
                            >
                              <span>
                                {category.name}
                              </span>

                              {children.length > 0 && (
                                <span className="text-[8px] text-black/25">
                                  {children.length}
                                </span>
                              )}
                            </button>

                            {mainActive &&
                              children.length > 0 && (
                                <div className="ml-3 border-l border-black/10 py-1 pl-2">

                                  {children.map(
                                    (child) => (
                                      <button
                                        key={child.id}
                                        type="button"
                                        onClick={() =>
                                          changeCategory(
                                            child.id
                                          )
                                        }
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[8px] font-bold uppercase tracking-[0.1em] ${
                                          activeCategory ===
                                          child.id
                                            ? "bg-[#a27d37] text-white"
                                            : "text-black/40 hover:bg-[#f5f2eb] hover:text-black"
                                        }`}
                                      >
                                        {child.name}

                                        {activeCategory ===
                                          child.id && (
                                          <ArrowRight />
                                        )}
                                      </button>
                                    )
                                  )}

                                </div>
                              )}

                          </div>
                        );
                      }
                    )}

                  </div>
                </div>
              </>
            )}

            {/* MOBILE BRAND MENU */}

            {mobileBrandOpen && (
              <>
                <div
                  onClick={() =>
                    setMobileBrandOpen(false)
                  }
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
                  aria-hidden="true"
                />

                <div className="relative z-50 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]">

                  <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                        Filter by
                      </p>

                      <p className="mt-1 text-[12px] font-semibold">
                        Brands
                      </p>
                    </div>

                    <div className="flex items-center gap-3">

                      {selectedBrandIds.length > 0 && (
                        <button
                          type="button"
                          onClick={clearBrands}
                          className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#a27d37]"
                        >
                          Clear
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setMobileBrandOpen(false)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-full text-black/40 hover:bg-black/5"
                        aria-label="Close brand menu"
                      >
                        ×
                      </button>

                    </div>
                  </div>

                  <div className="max-h-[55vh] overflow-y-auto p-2">

                    {/* ALL BRANDS */}

                    <button
                      type="button"
                      onClick={clearBrands}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.12em] ${
                        selectedBrandIds.length === 0
                          ? "bg-[#171512] text-white"
                          : "text-black/50 hover:bg-[#f5f2eb]"
                      }`}
                    >
                      All Brands

                      {selectedBrandIds.length === 0 && (
                        <CheckIcon />
                      )}
                    </button>

                    {brands.map(
                      (brand) => {
                        const selected =
                          selectedBrandIds.includes(
                            brand.id
                          );

                        return (
                          <button
                            key={brand.id}
                            type="button"
                            onClick={() =>
                              toggleBrand(
                                brand.id
                              )
                            }
                            className={`mt-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                              selected
                                ? "bg-[#f5f2eb]"
                                : "hover:bg-[#f5f2eb]"
                            }`}
                          >
                            <span className="flex items-center gap-3">

                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-[#a27d37] bg-[#a27d37] text-white"
                                    : "border-black/10 text-transparent"
                                }`}
                              >
                                <CheckIcon />
                              </span>

                              <span className="text-[9px] font-bold uppercase tracking-[0.08em]">
                                {brand.name}
                              </span>

                            </span>

                            {selected && (
                              <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#a27d37]">
                                Selected
                              </span>
                            )}

                          </button>
                        );
                      }
                    )}

                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY CONTEXT
      ===================================================== */}

      {activeMainCategory &&
        subCategories.length > 0 && (
          <section className="border-b border-black/[0.07] bg-[#eeebe3] px-5 py-7 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-[1440px]">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#a27d37]/30 bg-[#a27d37]/10 sm:flex">
                    <span className="h-2 w-2 rounded-full bg-[#a27d37]" />
                  </div>

                  <div>

                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#a27d37]">
                      {activeMainCategory.name}
                    </p>

                    <h2 className="mt-1 font-serif text-xl italic tracking-[-0.02em]">
                      {showingParentCategory
                        ? `Explore ${activeMainCategory.name}`
                        : selectedLabel}
                    </h2>

                    <p className="mt-1 text-[10px] text-black/35">
                      {showingParentCategory
                        ? `${subCategories.length} categories available`
                        : `Products from ${selectedLabel}`}
                    </p>

                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">

                  {subCategories.map(
                    (category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          changeCategory(
                            category.id
                          )
                        }
                        className={`rounded-full border px-3.5 py-2 text-[8px] font-bold uppercase tracking-[0.1em] transition ${
                          activeCategory ===
                          category.id
                            ? "border-[#a27d37] bg-[#a27d37] text-white"
                            : "border-black/10 bg-white/50 text-black/45 hover:border-black/20 hover:bg-white hover:text-black"
                        }`}
                      >
                        {category.name}
                      </button>
                    )
                  )}

                </div>
              </div>
            </div>
          </section>
        )}

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[1440px]">

          <div className="mb-7 flex flex-col gap-4 border-b border-black/[0.08] pb-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#a27d37]">
                Collection
              </p>

              <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]">
                {selectedLabel}
              </h2>

              {/* SELECTED BRAND CHIPS */}

              {selectedBrandIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">

                  {selectedBrands.map(
                    (brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() =>
                          toggleBrand(
                            brand.id
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#a27d37]/10 px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.1em] text-[#8b692d] transition hover:bg-[#a27d37]/20"
                      >
                        {brand.name}

                        <span className="text-[10px] leading-none">
                          ×
                        </span>
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={clearBrands}
                    className="inline-flex items-center rounded-full border border-black/10 px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.1em] text-black/35 transition hover:border-black/20 hover:text-black"
                  >
                    Clear all
                  </button>

                </div>
              )}

            </div>

            <div className="text-left sm:text-right">

              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/30">
                Showing
              </p>

              <p className="mt-1 font-serif text-lg italic text-black">
                {totalProducts}
              </p>

            </div>
          </div>

          {pageLoading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
              {skeletonCards}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
                {products.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  )
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-14 flex flex-col items-center gap-5 border-t border-black/10 pt-7 sm:flex-row sm:justify-between">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-black/35">
                    Page {currentPage} of {totalPages}
                  </p>

                  <div className="flex items-center gap-1.5">

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.max(
                              1,
                              page - 1
                            )
                        )
                      }
                      disabled={
                        currentPage === 1 ||
                        pageLoading
                      }
                      className="flex h-9 min-w-9 items-center justify-center rounded-full border border-black/10 bg-white/40 px-3 text-[9px] font-bold transition hover:border-black hover:bg-white disabled:pointer-events-none disabled:opacity-25"
                      aria-label="Previous page"
                    >
                      ←
                    </button>

                    {paginationItems().map(
                      (item) =>
                        typeof item ===
                        "number" ? (
                          <button
                            key={item}
                            type="button"
                            onClick={() =>
                              setCurrentPage(
                                item
                              )
                            }
                            disabled={
                              pageLoading
                            }
                            className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-[9px] font-bold transition ${
                              currentPage ===
                              item
                                ? "border-[#171512] bg-[#171512] text-white shadow-[0_6px_16px_rgba(23,21,18,0.25)]"
                                : "border-black/10 bg-white/40 text-black/50 hover:border-black hover:bg-white hover:text-black"
                            }`}
                          >
                            {item}
                          </button>
                        ) : (
                          <span
                            key={item}
                            className="flex h-9 min-w-7 items-center justify-center text-[9px] text-black/30"
                          >
                            …
                          </span>
                        )
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          (page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                        )
                      }
                      disabled={
                        currentPage ===
                          totalPages ||
                        pageLoading
                      }
                      className="flex h-9 min-w-9 items-center justify-center rounded-full border border-black/10 bg-white/40 px-3 text-[9px] font-bold transition hover:border-black hover:bg-white disabled:pointer-events-none disabled:opacity-25"
                      aria-label="Next page"
                    >
                      →
                    </button>

                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-black/10 bg-white/40 px-6 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#a27d37]/30 bg-[#a27d37]/10 text-[#a27d37]">
                <SearchEmptyIcon />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
                No products found
              </p>

              <p className="mt-3 max-w-sm text-sm leading-6 text-black/40">
                Try another search, brand, or category.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#171512] px-6 text-[9px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-black/80"
              >
                Reset Filters
                <ArrowRight />
              </button>

            </div>
          )}

        </div>
      </section>

    </main>
  );
}