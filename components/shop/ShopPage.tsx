"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
   SHOP PAGE (inner content — uses useSearchParams)
========================================================= */

function ShopPageContent() {
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
     FILTER RESULT CACHE

     Keyed by the exact filter/page/sort/search combination.
     Switching back to a filter combo already fetched this
     session renders INSTANTLY from cache — no network round
     trip, no skeleton flash — while a fresh background fetch
     still runs to keep the cache correct if data changed.

     requestTokenRef guards against race conditions: if the
     person clicks three filters quickly, only the response
     for the LAST request is ever applied to state, so an
     earlier, slower response can never overwrite newer results.
  ========================================================= */

  const resultsCacheRef = useRef(
    new Map<
      string,
      {
        products: Product[];
        total: number;
        totalPages: number;
      }
    >()
  );

  const requestTokenRef = useRef(0);

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

     FIX: previously this only returned the CHILD category ids
     when a parent/main category was selected (e.g. selecting
     "Protein" only queried by its sub-categories' ids). That
     relied entirely on the `parent_category_id.eq.<id>` half
     of the OR clause inside getProductsPage to catch products
     assigned directly to the main category itself. Including
     the main category's own id here too means the `category_id
     .in(...)` half is now also correct and self-sufficient —
     category filtering no longer depends on that second clause
     lining up exactly, which is what caused selecting a
     category to sometimes under-count or lag behind the actual
     product set.
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

      return [activeCategoryObject.id, ...children];
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

     Server-side pagination: getProductsPage() asks Supabase for
     only PAGE_SIZE rows via .range(from, to) — it never fetches
     the whole catalog. Changing `currentPage` triggers a fresh,
     small fetch for just that page, so exactly PAGE_SIZE products
     load at a time.

     CACHE + NO FULL-GRID BLANK:

     1. Build a key from every filter that affects the result.
     2. If that exact combination was already fetched this
        session, show it immediately (no spinner, no skeleton) —
        this is what makes switching between filters already
        visited feel instant.
     3. A background fetch still runs every time (even on a
        cache hit) to keep results correct if the catalog
        changed, but it updates the UI quietly — the product
        grid never gets blanked out to a skeleton again after
        the very first load, it just swaps in-place once the
        fresh data arrives.
     4. requestTokenRef makes sure that if filters change again
        before a request finishes, that stale response is
        dropped instead of overwriting newer results.
  ========================================================= */

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const cacheKey = JSON.stringify({
      page: currentPage,
      category: activeCategory,
      categoryIds: categoryIdsForQuery,
      brands: selectedBrandIds,
      search,
      sortBy,
    });

    const cached =
      resultsCacheRef.current.get(cacheKey);

    const thisRequest =
      ++requestTokenRef.current;

    if (cached) {
      // Instant render from cache — no loading state at all.
      setProducts(cached.products);
      setTotalProducts(cached.total);
      setTotalPages(cached.totalPages);
      setLoading(false);
      setPageLoading(false);
    } else {
      // No cache yet for this combination: show the loading
      // state (skeleton on first load, lightweight indicator
      // on later ones) since there's nothing to display yet.
      setPageLoading(true);
    }

    async function loadProducts() {
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

        // A newer request has started since this one fired —
        // drop this response rather than let it overwrite
        // fresher results.
        if (
          requestTokenRef.current !==
          thisRequest
        ) {
          return;
        }

        resultsCacheRef.current.set(
          cacheKey,
          {
            products: result.products,
            total: result.total,
            totalPages: result.totalPages,
          }
        );

        setProducts(result.products);
        setTotalProducts(result.total);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error(
          "Shop products loading failed:",
          error
        );

        if (
          requestTokenRef.current ===
          thisRequest &&
          !cached
        ) {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(0);
        }
      } finally {
        if (
          requestTokenRef.current ===
          thisRequest
        ) {
          setLoading(false);
          setPageLoading(false);
        }
      }
    }

    void loadProducts();
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
      <main className="min-h-screen overflow-x-hidden bg-[#f5f2eb] text-[#171512]">
        <section className="border-b border-black/[0.08] px-5 pb-5 pt-24 sm:px-8 sm:pb-7 sm:pt-28 lg:px-12 lg:pt-32">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-2.5 inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#a27d37]" />

              <p className="text-[8px] font-bold uppercase tracking-[0.26em] text-[#a27d37]">
                Seven Bucks Nutrition
              </p>
            </div>

            <h1 className="max-w-[850px] text-[clamp(42px,8.5vw,100px)] font-semibold leading-[0.92] tracking-[-0.055em] sm:leading-[0.88] sm:tracking-[-0.065em]">
              Shop
              <span className="ml-3 font-serif italic text-[#a27d37]">
                Performance.
              </span>
            </h1>
          </div>
        </section>

        <section className="px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
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
    <main className="min-h-screen overflow-x-hidden bg-[#f5f2eb] text-[#171512]">

      {/* =====================================================
          HEADER — compact eyebrow, more prominent heading,
          tighter top/bottom padding so filters + products
          come into view sooner.
      ===================================================== */}

      <section className="border-b border-black/[0.08] px-5 pb-5 pt-24 sm:px-8 sm:pb-7 sm:pt-28 lg:px-12 lg:pt-32">
        <div className="mx-auto max-w-[1440px]">

          <div className="mb-3 flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.18em] text-black/35 sm:mb-5">
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

                <span className="truncate text-[#a27d37]">
                  {selectedLabel}
                </span>
              </>
            )}

            {selectedBrandIds.length > 0 && (
              <>
                <span>/</span>

                <span className="max-w-[140px] truncate text-[#a27d37]">
                  {selectedBrandLabel}
                </span>
              </>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10">

            <div>
              <div className="mb-2 inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#a27d37]" />

                <p className="text-[8px] font-bold uppercase tracking-[0.26em] text-[#a27d37]">
                  Seven Bucks Nutrition
                </p>
              </div>

              <h1 className="max-w-[850px] text-[clamp(42px,8.5vw,100px)] font-semibold leading-[0.92] tracking-[-0.055em] sm:leading-[0.88] sm:tracking-[-0.065em]">
                Shop
                <span className="ml-3 font-serif italic text-[#a27d37]">
                  Performance.
                </span>
              </h1>

              {/* Description: hidden on the smallest screens so the
                  filter bar and products come into view sooner —
                  still shown from sm: up. */}
              <p className="mt-3 hidden max-w-[520px] text-[12px] leading-6 text-black/50 sm:block sm:mt-4">
                Every product here earns its place on the shelf —
                dosed the way the research says, verified before it
                ships.
              </p>
            </div>

            {/* Collection / Products quick-stats: desktop only. */}
            <div className="hidden items-end gap-7 lg:flex lg:pb-1">

              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/30">
                  Collection
                </p>

                <p className="mt-1.5 max-w-[140px] truncate text-sm font-semibold">
                  {selectedLabel}
                </p>
              </div>

              <div className="h-10 w-px bg-black/10" />

              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/30">
                  Products
                </p>

                <p className="mt-1.5 font-serif text-lg italic text-[#a27d37]">
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

            <div className="flex min-h-[64px] items-center justify-between gap-6">

              {/* CATEGORY — compact pill tabs, no redundant counts */}

              <div className="flex min-w-0 items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">

                <button
                  type="button"
                  onClick={() =>
                    changeCategory("all")
                  }
                  className={`shrink-0 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.12em] transition-all ${
                    activeCategory === "all"
                      ? "bg-[#171512] text-white shadow-[0_6px_16px_rgba(23,21,18,0.25)]"
                      : "border border-black/10 bg-white/40 text-black/45 hover:border-black/20 hover:bg-white hover:text-black"
                  }`}
                >
                  All
                </button>

                {mainCategories.map(
                  (category) => {
                    const active =
                      activeCategory ===
                        category.id ||
                      activeMainCategory?.id ===
                        category.id;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          changeCategory(
                            category.id
                          )
                        }
                        className={`shrink-0 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.12em] transition-all ${
                          active
                            ? "bg-[#171512] text-white shadow-[0_6px_16px_rgba(23,21,18,0.25)]"
                            : "border border-black/10 bg-white/40 text-black/45 hover:border-black/20 hover:bg-white hover:text-black"
                        }`}
                      >
                        {category.name}
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
                    className="h-9 w-44 rounded-full border border-black/10 bg-white/50 pl-10 pr-4 text-[10px] outline-none transition-all placeholder:text-black/25 focus:border-black/25 focus:bg-white"
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
                    className={`flex h-9 max-w-[190px] items-center gap-2 rounded-full border px-3.5 text-[9px] font-bold uppercase tracking-[0.1em] transition ${
                      selectedBrandIds.length > 0
                        ? "border-[#a27d37]/40 bg-[#a27d37]/10 text-[#8b692d]"
                        : "border-black/10 bg-white/50 text-black/55 hover:bg-white"
                    }`}
                  >
                    <span className="max-w-[120px] truncate">
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
                    <div className="absolute right-0 top-11 z-50 w-[260px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]">

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
                    className="h-9 appearance-none rounded-full border border-black/10 bg-white/50 pl-4 pr-8 text-[9px] font-bold uppercase tracking-[0.1em] outline-none transition hover:bg-white"
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

            {/* SUB CATEGORIES — compact inline row, only shown when
                the active main category actually has children.
                This replaces the old heavyweight "Explore X" block. */}

            {activeMainCategory &&
              subCategories.length > 0 && (
                <div className="flex items-center gap-3 border-t border-black/[0.06] py-2.5">

                  <span className="h-1 w-1 shrink-0 rounded-full bg-[#a27d37]" />

                  <div className="flex min-w-0 gap-1.5 overflow-x-auto scrollbar-none">

                    <button
                      type="button"
                      onClick={() =>
                        changeCategory(
                          activeMainCategory.id
                        )
                      }
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] transition ${
                        activeCategory ===
                        activeMainCategory.id
                          ? "bg-[#a27d37] text-white"
                          : "text-black/40 hover:bg-white hover:text-black"
                      }`}
                    >
                      All {activeMainCategory.name}
                    </button>

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
                          className={`shrink-0 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] transition ${
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

                </div>
              )}

          </div>

          {/* MOBILE — compact: search full-width, then a single
              horizontal-scroll row of filter chips (Category / Brand /
              Sort) instead of two stacked rows of big boxes. */}

          <div className="py-2.5 md:hidden">

            {/* SEARCH */}

            <div className="flex h-10 min-w-0 items-center rounded-full border border-black/10 bg-white/60 px-4 shadow-sm">

              <span className="mr-2 shrink-0 text-black/30">
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
                className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-black/25"
                aria-label="Search products"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    changeSearch("")
                  }
                  className="ml-2 shrink-0 text-lg leading-none text-black/30"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

            </div>

            {/* FILTER CHIPS */}

            <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">

              {/* CATEGORY CHIP */}
              <button
                type="button"
                onClick={() => {
                  setMobileBrandOpen(false);
                  setMobileCategoryOpen(
                    (open) => !open
                  );
                }}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[9px] font-bold uppercase tracking-[0.08em] shadow-sm transition active:scale-[0.97] ${
                  hasActiveCategory
                    ? "border-[#171512] bg-[#171512] text-white"
                    : "border-black/10 bg-white/70 text-black/60"
                }`}
              >
                <span className="max-w-[92px] truncate">
                  {selectedLabel}
                </span>

                <ChevronDown
                  open={mobileCategoryOpen}
                />
              </button>

              {/* BRAND CHIP */}
              <button
                type="button"
                onClick={() => {
                  setMobileCategoryOpen(false);
                  setMobileBrandOpen(
                    (open) => !open
                  );
                }}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[9px] font-bold uppercase tracking-[0.08em] shadow-sm transition active:scale-[0.97] ${
                  selectedBrandIds.length > 0
                    ? "border-[#a27d37]/40 bg-[#a27d37]/10 text-[#8b692d]"
                    : "border-black/10 bg-white/70 text-black/60"
                }`}
              >
                <span className="max-w-[92px] truncate">
                  {selectedBrandLabel}
                </span>

                {selectedBrandIds.length > 0 && (
                  <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#a27d37] px-1 text-[7px] text-white">
                    {selectedBrandIds.length}
                  </span>
                )}

                <ChevronDown
                  open={mobileBrandOpen}
                />
              </button>

              {/* SORT CHIP */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(event) =>
                    changeSort(
                      event.target
                        .value as SortOption
                    )
                  }
                  className="h-8 appearance-none rounded-full border border-black/10 bg-white/70 py-0 pl-3 pr-6 text-[9px] font-bold uppercase tracking-[0.08em] shadow-sm outline-none"
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

                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-black/30">
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
          PRODUCTS

          The old "Explore Protein" / sub-category showcase block
          that used to sit here (with its own heading, blurb and
          repeated chip row) has been removed entirely — the
          compact sub-category row inside the sticky filter bar
          above already covers that job without an extra section,
          so products now render immediately below the filters.
      ===================================================== */}

      <section className="px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-[1440px]">

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] pb-3 sm:mb-5 sm:pb-4">

            <div className="flex min-w-0 flex-wrap items-center gap-2">

              <h2 className="text-base font-semibold tracking-[-0.03em] sm:text-lg">
                {selectedLabel}
              </h2>

              {selectedBrandIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">

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

            <p className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/35">
              Showing{" "}
              <span className="text-black/60">
                {totalProducts}
              </span>
            </p>
          </div>

          {pageLoading && products.length === 0 ? (
            // Nothing cached/visible yet for this filter combo —
            // this is the only case that still shows the full
            // skeleton grid.
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
              {skeletonCards}
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Thin top progress bar: shown only while a
                  background refresh is running for filters that
                  already have products on screen — the grid itself
                  never disappears or flashes to a skeleton again. */}
              {pageLoading && (
                <div className="relative mb-3 h-[2px] w-full overflow-hidden rounded-full bg-black/[0.06]">
                  <div className="absolute inset-y-0 left-0 w-1/3 animate-[shopBarSweep_900ms_ease-in-out_infinite] rounded-full bg-[#a27d37]" />

                  <style>{`
                    @keyframes shopBarSweep {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(300%); }
                    }
                  `}</style>
                </div>
              )}

              <div
                className={`grid grid-cols-2 gap-x-3 gap-y-8 transition-opacity duration-200 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12 ${
                  pageLoading
                    ? "opacity-60"
                    : "opacity-100"
                }`}
              >
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

                  <div className="flex max-w-full items-center gap-1.5 overflow-x-auto px-1 scrollbar-none">

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
                      className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/40 px-3 text-[9px] font-bold transition hover:border-black hover:bg-white disabled:pointer-events-none disabled:opacity-25"
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
                            className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full border px-3 text-[9px] font-bold transition ${
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
                            className="flex h-9 min-w-7 shrink-0 items-center justify-center text-[9px] text-black/30"
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
                      className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/40 px-3 text-[9px] font-bold transition hover:border-black hover:bg-white disabled:pointer-events-none disabled:opacity-25"
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


export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageContent />
    </Suspense>
  );
}