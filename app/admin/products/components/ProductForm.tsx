"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { toast } from "sonner";
import { supabase } from "../../../../lib/supabase";

export type Brand = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
};

export type ProductFormData = {
  name: string;
  slug: string;
  brand_id: string;
  category_id: string;

  subtitle: string;
  description: string;
  short_description: string;
  specifications: string;

  // Product-level values.
  // Used only when there are NO variants.
  price: string;
  compare_at_price: string;
  sku: string;
  stock_quantity: string;
  is_available: boolean;

  // Product-level merchandising/status.
  // These remain applicable even when variants exist.
  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;

  seo_title: string;
  seo_description: string;
};

type ProductFormProps = {
  value: ProductFormData;

  onChangeAction: (
    value: ProductFormData
  ) => void;

  disabled?: boolean;

  /**
   * true when the product currently has
   * at least one variant.
   *
   * When true:
   * - product price is reset to 0
   * - compare-at is reset to 0
   * - product SKU is cleared
   * - product stock is reset to 0
   * - product availability is disabled
   *
   * Variant-level values become the source
   * of price, SKU, stock and availability.
   */
  hasVariants?: boolean;
};

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Product-level SKU.
 *
 * The SKU is intentionally generated automatically.
 * The admin does not type it manually.
 *
 * Example:
 * 7B-C4-ORIGINAL-PRE-WORKOUT-A81F29D3
 */
function makeProductSku(
  name: string,
  slug?: string
): string {
  const source =
    slug?.trim() ||
    makeSlug(name);

  const cleanSource = source
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 28);

  let uniquePart = "";

  try {
    uniquePart = crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 8)
      .toUpperCase();
  } catch {
    uniquePart = Math.random()
      .toString(36)
      .slice(2, 10)
      .toUpperCase();
  }

  return [
    "7B",
    cleanSource || "PRODUCT",
    uniquePart,
  ].join("-");
}

export default function ProductForm({
  value,
  onChangeAction,
  disabled = false,
  hasVariants = false,
}: ProductFormProps) {
  const [brands, setBrands] =
    useState<Brand[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [
    selectedMainCategoryId,
    setSelectedMainCategoryId,
  ] = useState("");

  const [
    selectedSubCategoryId,
    setSelectedSubCategoryId,
  ] = useState("");

  const seoTitleManuallyEdited =
    useRef(
      Boolean(value.seo_title?.trim())
    );

  const seoDescriptionManuallyEdited =
    useRef(
      Boolean(value.seo_description?.trim())
    );

  const slugManuallyEdited =
    useRef(
      Boolean(value.slug?.trim())
    );

  const productSkuGenerated =
    useRef(
      Boolean(value.sku?.trim())
    );

  const previousHasVariants =
    useRef(hasVariants);

  // ==================================================
  // LOAD BRANDS + CATEGORIES
  // ==================================================

  useEffect(() => {
    let mounted = true;

    async function loadOptions() {
      setLoadingOptions(true);

      const [
        brandsResult,
        categoriesResult,
      ] = await Promise.all([
        supabase
          .from("brands")
          .select("id, name")
          .order("name", {
            ascending: true,
          }),

        supabase
          .from("categories")
          .select(
            "id, name, parent_id"
          )
          .order("name", {
            ascending: true,
          }),
      ]);

      if (!mounted) return;

      if (brandsResult.error) {
        console.error(
          "Brands error:",
          brandsResult.error
        );

        toast.error(
          "Could not load brands",
          {
            description:
              brandsResult.error.message,
          }
        );

        setLoadingOptions(false);
        return;
      }

      if (categoriesResult.error) {
        console.error(
          "Categories error:",
          categoriesResult.error
        );

        toast.error(
          "Could not load categories",
          {
            description:
              categoriesResult.error.message,
          }
        );

        setLoadingOptions(false);
        return;
      }

      setBrands(
        (brandsResult.data ??
          []) as Brand[]
      );

      setCategories(
        (categoriesResult.data ??
          []) as Category[]
      );

      setLoadingOptions(false);
    }

    void loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  // ==================================================
  // VARIANT MODE SWITCH
  // ==================================================
  //
  // When first variant is added:
  //
  // price             -> 0
  // compare_at_price  -> 0
  // sku               -> ""
  // stock_quantity    -> 0
  // is_available      -> false
  //
  // This makes it impossible for product-level
  // pricing/inventory to accidentally compete with
  // variant-level pricing/inventory.
  //
  // When all variants are removed:
  //
  // product-level mode becomes active again.
  // A fresh automatic SKU is generated.
  // ==================================================

  useEffect(() => {
    const changed =
      previousHasVariants.current !==
      hasVariants;

    if (!changed) return;

    previousHasVariants.current =
      hasVariants;

    if (hasVariants) {
      onChangeAction({
        ...value,
        price: "0",
        compare_at_price: "0",
        sku: "",
        stock_quantity: "0",
        is_available: false,
      });

      productSkuGenerated.current =
        false;

      return;
    }

    /*
     * No variants now.
     *
     * Product-level pricing becomes active again.
     */
    const generatedSku =
      value.sku?.trim() ||
      makeProductSku(
        value.name,
        value.slug
      );

    onChangeAction({
      ...value,
      price:
        value.price || "",
      compare_at_price:
        value.compare_at_price || "",
      sku: generatedSku,
      stock_quantity:
        value.stock_quantity || "0",
      is_available: true,
    });

    productSkuGenerated.current =
      true;
  }, [
    hasVariants,
    onChangeAction,
    value,
  ]);

  // ==================================================
  // MAIN CATEGORIES
  // ==================================================

  const mainCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category.parent_id === null
        ),
      [categories]
    );

  // ==================================================
  // SUB CATEGORIES
  // ==================================================

  const subCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category.parent_id ===
            selectedMainCategoryId
        ),
      [
        categories,
        selectedMainCategoryId,
      ]
    );

  const mainHasChildren =
    subCategories.length > 0;

  // ==================================================
  // RESTORE CATEGORY ON EDIT
  // ==================================================

  useEffect(() => {
    if (
      !categories.length ||
      !value.category_id
    ) {
      return;
    }

    const selectedCategory =
      categories.find(
        (category) =>
          category.id ===
          value.category_id
      );

    if (!selectedCategory) return;

    if (
      selectedCategory.parent_id
    ) {
      setSelectedMainCategoryId(
        selectedCategory.parent_id
      );

      setSelectedSubCategoryId(
        selectedCategory.id
      );
    } else {
      setSelectedMainCategoryId(
        selectedCategory.id
      );

      setSelectedSubCategoryId("");
    }
  }, [
    categories,
    value.category_id,
  ]);

  // ==================================================
  // UPDATE FIELD
  // ==================================================

  function updateField<
    K extends keyof ProductFormData
  >(
    field: K,
    fieldValue: ProductFormData[K]
  ) {
    onChangeAction({
      ...value,
      [field]: fieldValue,
    });
  }

  // ==================================================
  // MAIN CATEGORY
  // ==================================================

  function handleMainCategoryChange(
    categoryId: string
  ) {
    setSelectedMainCategoryId(
      categoryId
    );

    setSelectedSubCategoryId("");

    const children =
      categories.filter(
        (category) =>
          category.parent_id ===
          categoryId
      );

    updateField(
      "category_id",
      children.length === 0
        ? categoryId
        : ""
    );
  }

  // ==================================================
  // SUB CATEGORY
  // ==================================================

  function handleSubCategoryChange(
    categoryId: string
  ) {
    setSelectedSubCategoryId(
      categoryId
    );

    updateField(
      "category_id",
      categoryId
    );
  }

  // ==================================================
  // PRODUCT NAME
  // ==================================================

  function handleNameChange(
    name: string
  ) {
    const nextSlug =
      slugManuallyEdited.current
        ? value.slug
        : makeSlug(name);

    const nextSeoTitle =
      seoTitleManuallyEdited.current
        ? value.seo_title
        : name.trim()
          ? `${name.trim()} | Seven Bucks Nutrition`
          : "";

    const sourceDescription =
      value.short_description?.trim() ||
      value.description?.trim() ||
      "";

    const nextSeoDescription =
      seoDescriptionManuallyEdited.current
        ? value.seo_description
        : sourceDescription.slice(
            0,
            320
          );

    let nextSku = value.sku;

    if (
      !hasVariants &&
      !productSkuGenerated.current &&
      name.trim()
    ) {
      nextSku =
        makeProductSku(
          name,
          nextSlug
        );

      productSkuGenerated.current =
        true;
    }

    onChangeAction({
      ...value,
      name,
      slug: nextSlug,
      sku: nextSku,
      seo_title:
        nextSeoTitle.slice(
          0,
          160
        ),
      seo_description:
        nextSeoDescription.slice(
          0,
          320
        ),
    });
  }

  // ==================================================
  // SLUG
  // ==================================================

  function handleSlugChange(
    slug: string
  ) {
    slugManuallyEdited.current =
      true;

    const nextSlug =
      makeSlug(slug);

    let nextSku = value.sku;

    if (
      !hasVariants &&
      !productSkuGenerated.current &&
      nextSlug
    ) {
      nextSku =
        makeProductSku(
          value.name,
          nextSlug
        );

      productSkuGenerated.current =
        true;
    }

    onChangeAction({
      ...value,
      slug: nextSlug,
      sku: nextSku,
    });
  }

  // ==================================================
  // SHORT DESCRIPTION
  // ==================================================

  function handleShortDescriptionChange(
    shortDescription: string
  ) {
    const nextSeoDescription =
      seoDescriptionManuallyEdited.current
        ? value.seo_description
        : (
            shortDescription.trim() ||
            value.description?.trim() ||
            ""
          ).slice(0, 320);

    onChangeAction({
      ...value,
      short_description:
        shortDescription,
      seo_description:
        nextSeoDescription,
    });
  }

  // ==================================================
  // DESCRIPTION
  // ==================================================

  function handleDescriptionChange(
    description: string
  ) {
    const nextSeoDescription =
      seoDescriptionManuallyEdited.current
        ? value.seo_description
        : (
            value.short_description?.trim() ||
            description.trim() ||
            ""
          ).slice(0, 320);

    onChangeAction({
      ...value,
      description,
      seo_description:
        nextSeoDescription,
    });
  }

  // ==================================================
  // SEO
  // ==================================================

  function handleSeoTitleChange(
    seoTitle: string
  ) {
    seoTitleManuallyEdited.current =
      true;

    updateField(
      "seo_title",
      seoTitle
    );
  }

  function handleSeoDescriptionChange(
    seoDescription: string
  ) {
    seoDescriptionManuallyEdited.current =
      true;

    updateField(
      "seo_description",
      seoDescription
    );
  }

  // ==================================================
  // PRODUCT PRICE
  // ==================================================

  function handlePriceChange(
    input: string
  ) {
    if (hasVariants) return;

    const cleaned =
      input.replace(
        /[^\d.]/g,
        ""
      );

    updateField(
      "price",
      cleaned
    );
  }

  // ==================================================
  // COMPARE AT
  // ==================================================

  function handleCompareAtChange(
    input: string
  ) {
    if (hasVariants) return;

    const cleaned =
      input.replace(
        /[^\d.]/g,
        ""
      );

    updateField(
      "compare_at_price",
      cleaned
    );
  }

  // ==================================================
  // STOCK
  // ==================================================

  function handleStockChange(
    input: string
  ) {
    if (hasVariants) return;

    const cleaned =
      input.replace(
        /[^\d]/g,
        ""
      );

    updateField(
      "stock_quantity",
      cleaned
    );
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/[0.07] bg-white">
        {/* HEADER */}
        <div className="border-b border-black/[0.07] px-5 py-5 sm:px-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
            Product Information
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
            Basic details
          </h2>

          <p className="mt-1 text-[10px] leading-5 text-black/40">
            {hasVariants
              ? "Variant mode is active. Price, SKU, stock and availability are managed inside the variants."
              : "Single-product mode is active. Price, SKU, stock and availability are managed here."}
          </p>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
          {/* NAME */}

          <div className="md:col-span-2">
            <label
              htmlFor="product-name"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
            >
              Product Name
            </label>

            <input
              id="product-name"
              type="text"
              value={value.name}
              onChange={(event) =>
                handleNameChange(
                  event.target.value
                )
              }
              placeholder="e.g. Gold Standard 100% Whey"
              disabled={disabled}
              required
              className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* SLUG */}

          <div>
            <label
              htmlFor="product-slug"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
            >
              Slug
            </label>

            <input
              id="product-slug"
              type="text"
              value={value.slug}
              onChange={(event) =>
                handleSlugChange(
                  event.target.value
                )
              }
              placeholder="gold-standard-100-whey"
              disabled={disabled}
              required
              className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-[9px] text-black/35">
              Used in the product URL.
            </p>
          </div>

          {/* SUBTITLE */}

          <div>
            <label
              htmlFor="product-subtitle"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
            >
              Subtitle
            </label>

            <input
              id="product-subtitle"
              type="text"
              value={value.subtitle}
              onChange={(event) =>
                updateField(
                  "subtitle",
                  event.target.value
                )
              }
              placeholder="24g protein · premium whey"
              disabled={disabled}
              className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* BRAND */}

          <div>
            <label
              htmlFor="product-brand"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
            >
              Brand
            </label>

            <select
              id="product-brand"
              value={value.brand_id}
              onChange={(event) =>
                updateField(
                  "brand_id",
                  event.target.value
                )
              }
              disabled={
                disabled ||
                loadingOptions
              }
              required
              className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {loadingOptions
                  ? "Loading brands..."
                  : "Select brand"}
              </option>

              {brands.map(
                (brand) => (
                  <option
                    key={brand.id}
                    value={brand.id}
                  >
                    {brand.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* MAIN CATEGORY */}

          <div>
            <label
              htmlFor="product-main-category"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
            >
              Main Category
            </label>

            <select
              id="product-main-category"
              value={
                selectedMainCategoryId
              }
              onChange={(event) =>
                handleMainCategoryChange(
                  event.target.value
                )
              }
              disabled={
                disabled ||
                loadingOptions
              }
              required
              className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {loadingOptions
                  ? "Loading categories..."
                  : "Select main category"}
              </option>

              {mainCategories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* SUB CATEGORY */}

          <div>
            <label
              htmlFor="product-sub-category"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
            >
              Sub Category

              <span className="ml-1 font-normal text-black/25">
                (Optional)
              </span>
            </label>

            <select
              id="product-sub-category"
              value={
                selectedSubCategoryId
              }
              onChange={(event) =>
                handleSubCategoryChange(
                  event.target.value
                )
              }
              disabled={
                disabled ||
                loadingOptions ||
                !selectedMainCategoryId ||
                !mainHasChildren
              }
              className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {!selectedMainCategoryId
                  ? "Select main category first"
                  : !mainHasChildren
                    ? "No sub-categories"
                    : "Select sub category"}
              </option>

              {subCategories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>

            {selectedMainCategoryId &&
              mainHasChildren &&
              !selectedSubCategoryId && (
                <p className="mt-2 text-[9px] text-[#9c8250]">
                  Select a sub-category
                  to assign the product.
                </p>
              )}
          </div>

          {/* CATEGORY INFO */}

          <div className="md:col-span-2 rounded-xl border border-black/[0.07] bg-[#faf9f6] px-4 py-3">
            <p className="text-[9px] leading-4 text-black/40">
              If the selected main category
              has subcategories, the product
              is assigned to the selected
              subcategory. Otherwise the main
              category is saved.
            </p>
          </div>

          {/* ==================================================
              PRICING + INVENTORY
              ================================================== */}

          <div className="md:col-span-2">
            <div
              className={`rounded-2xl border p-4 transition sm:p-5 ${
                hasVariants
                  ? "border-[#9c8250]/20 bg-[#f8f5ed]"
                  : "border-black/[0.08] bg-[#faf9f6]"
              }`}
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9c8250]">
                    Pricing & Inventory
                  </p>

                  <h3 className="mt-1 text-sm font-semibold">
                    {hasVariants
                      ? "Managed by variants"
                      : "Product-level pricing"}
                  </h3>

                  <p className="mt-1 max-w-2xl text-[9px] leading-5 text-black/40">
                    {hasVariants
                      ? "This product has variants. Product-level price, SKU, stock and availability are not used. Set those values inside each variant below."
                      : "This product has no variants. Enter its selling price, compare-at price and stock here."}
                  </p>
                </div>

                <span
                  className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] ${
                    hasVariants
                      ? "bg-[#171512] text-white"
                      : "bg-white text-black/40"
                  }`}
                >
                  {hasVariants
                    ? "Variant Mode"
                    : "Simple Product"}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* PRICE */}

                <div>
                  <label
                    htmlFor="product-price"
                    className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                  >
                    Selling Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-black/40">
                      ₹
                    </span>

                    <input
                      id="product-price"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={value.price}
                      onChange={(event) =>
                        handlePriceChange(
                          event.target.value
                        )
                      }
                      placeholder="2999"
                      disabled={
                        disabled ||
                        hasVariants
                      }
                      className="h-11 w-full rounded-xl border border-black/[0.1] bg-white pl-8 pr-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:bg-black/[0.02] disabled:text-black/25"
                    />
                  </div>
                </div>

                {/* COMPARE AT */}

                <div>
                  <label
                    htmlFor="product-compare-at-price"
                    className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                  >
                    Compare-at Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-black/40">
                      ₹
                    </span>

                    <input
                      id="product-compare-at-price"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={
                        value.compare_at_price
                      }
                      onChange={(event) =>
                        handleCompareAtChange(
                          event.target.value
                        )
                      }
                      placeholder="3499"
                      disabled={
                        disabled ||
                        hasVariants
                      }
                      className="h-11 w-full rounded-xl border border-black/[0.1] bg-white pl-8 pr-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:bg-black/[0.02] disabled:text-black/25"
                    />
                  </div>
                </div>

                {/* STOCK */}

                <div>
                  <label
                    htmlFor="product-stock-quantity"
                    className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                  >
                    Stock Quantity
                  </label>

                  <input
                    id="product-stock-quantity"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={
                      value.stock_quantity
                    }
                    onChange={(event) =>
                      handleStockChange(
                        event.target.value
                      )
                    }
                    placeholder="25"
                    disabled={
                      disabled ||
                      hasVariants
                    }
                    className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:bg-black/[0.02] disabled:text-black/25"
                  />
                </div>

                {/* SKU */}

                <div>
                  <label
                    htmlFor="product-sku"
                    className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                  >
                    Product SKU
                  </label>

                  <div
                    className={`flex h-11 items-center justify-between gap-2 rounded-xl border px-3.5 ${
                      hasVariants
                        ? "border-black/[0.06] bg-black/[0.02]"
                        : "border-black/[0.1] bg-white"
                    }`}
                  >
                    <p
                      id="product-sku"
                      className="min-w-0 truncate font-mono text-[9px] text-black/55"
                      title={
                        value.sku ||
                        "No product SKU"
                      }
                    >
                      {value.sku ||
                        (hasVariants
                          ? "Not used — variant SKU"
                          : "Generating...")}
                    </p>

                    <span className="shrink-0 rounded-full bg-[#f5f2eb] px-2 py-1 text-[7px] font-bold uppercase tracking-[0.1em] text-black/40">
                      {hasVariants
                        ? "Variant"
                        : "Auto"}
                    </span>
                  </div>

                  <p className="mt-2 text-[8px] leading-4 text-black/35">
                    {hasVariants
                      ? "Each variant has its own SKU."
                      : "Generated automatically."}
                  </p>
                </div>
              </div>

              {/* AVAILABLE */}

              <label
                className={`mt-4 flex min-h-12 items-center gap-3 rounded-xl border px-3.5 transition ${
                  hasVariants
                    ? "cursor-not-allowed border-black/[0.06] bg-black/[0.02] opacity-60"
                    : "cursor-pointer border-black/[0.08] bg-white hover:border-black/[0.15]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    value.is_available
                  }
                  onChange={(event) =>
                    updateField(
                      "is_available",
                      event.target.checked
                    )
                  }
                  disabled={
                    disabled ||
                    hasVariants
                  }
                  className="h-4 w-4 accent-[#171512]"
                />

                <span>
                  <span className="block text-xs font-semibold">
                    Product Available
                  </span>

                  <span className="block text-[8px] text-black/35">
                    {hasVariants
                      ? "Availability is controlled per variant."
                      : "Customers can purchase this product."}
                  </span>
                </span>
              </label>

              {/* VARIANT MODE NOTICE */}

              {hasVariants && (
                <div className="mt-4 rounded-xl border border-[#9c8250]/15 bg-white px-4 py-3">
                  <p className="text-[9px] font-semibold text-black/60">
                    Variant pricing is active.
                  </p>

                  <p className="mt-1 text-[8px] leading-4 text-black/35">
                    Product-level price, compare-at,
                    SKU, stock and availability are
                    disabled because the values will
                    come from the selected variant.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              PRODUCT FLAGS
              ================================================== */}

          <div className="md:col-span-2">
            <div className="rounded-2xl border border-black/[0.08] bg-[#faf9f6] p-4 sm:p-5">
              <div className="mb-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9c8250]">
                  Storefront Settings
                </p>

                <h3 className="mt-1 text-sm font-semibold">
                  Visibility & merchandising
                </h3>

                <p className="mt-1 text-[9px] leading-5 text-black/40">
                  These settings belong to the
                  product itself and remain available
                  whether or not the product has variants.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {/* FEATURED */}

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/[0.08] bg-white px-4 py-3 transition hover:border-black/[0.16]">
                  <input
                    type="checkbox"
                    checked={
                      value.is_featured
                    }
                    onChange={(event) =>
                      updateField(
                        "is_featured",
                        event.target.checked
                      )
                    }
                    disabled={disabled}
                    className="h-4 w-4 accent-[#171512]"
                  />

                  <span>
                    <span className="block text-xs font-semibold">
                      Featured
                    </span>

                    <span className="block text-[8px] text-black/35">
                      Show in featured products.
                    </span>
                  </span>
                </label>

                {/* BESTSELLER */}

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/[0.08] bg-white px-4 py-3 transition hover:border-black/[0.16]">
                  <input
                    type="checkbox"
                    checked={
                      value.is_bestseller
                    }
                    onChange={(event) =>
                      updateField(
                        "is_bestseller",
                        event.target.checked
                      )
                    }
                    disabled={disabled}
                    className="h-4 w-4 accent-[#171512]"
                  />

                  <span>
                    <span className="block text-xs font-semibold">
                      Bestseller
                    </span>

                    <span className="block text-[8px] text-black/35">
                      Mark as a bestseller.
                    </span>
                  </span>
                </label>

                {/* ACTIVE */}

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/[0.08] bg-white px-4 py-3 transition hover:border-black/[0.16]">
                  <input
                    type="checkbox"
                    checked={
                      value.is_active
                    }
                    onChange={(event) =>
                      updateField(
                        "is_active",
                        event.target.checked
                      )
                    }
                    disabled={disabled}
                    className="h-4 w-4 accent-[#171512]"
                  />

                  <span>
                    <span className="block text-xs font-semibold">
                      Active
                    </span>

                    <span className="block text-[8px] text-black/35">
                      Product is visible in the store.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* SHORT DESCRIPTION */}

          <div className="md:col-span-2">
            <label
              htmlFor="product-short-description"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
            >
              Short Description
            </label>

            <textarea
              id="product-short-description"
              value={
                value.short_description
              }
              onChange={(event) =>
                handleShortDescriptionChange(
                  event.target.value
                )
              }
              placeholder="Short product summary for cards and listings."
              disabled={disabled}
              rows={3}
              className="w-full resize-none rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 py-3 text-sm leading-6 outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* DESCRIPTION */}

          <div className="md:col-span-2">
            <label
              htmlFor="product-description"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
            >
              Description
            </label>

            <textarea
              id="product-description"
              value={value.description}
              onChange={(event) =>
                handleDescriptionChange(
                  event.target.value
                )
              }
              placeholder="Write the complete product description..."
              disabled={disabled}
              rows={7}
              className="w-full resize-y rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 py-3 text-sm leading-6 outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* SEO DESCRIPTION */}

          <div>
            <label
              htmlFor="product-seo-description"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
            >
              SEO Description
            </label>

            <textarea
              id="product-seo-description"
              value={
                value.seo_description
              }
              onChange={(event) =>
                handleSeoDescriptionChange(
                  event.target.value
                )
              }
              placeholder="Write a concise search-engine-friendly description..."
              disabled={disabled}
              maxLength={320}
              rows={4}
              className="w-full resize-none rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 py-3 text-sm leading-6 outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-[9px] text-black/35">
              {
                value.seo_description
                  .length
              }
              /320 characters
            </p>
          </div>

          {/* SEO TITLE */}

          <div>
            <label
              htmlFor="product-seo-title"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
            >
              SEO Title
            </label>

            <input
              id="product-seo-title"
              type="text"
              value={value.seo_title}
              onChange={(event) =>
                handleSeoTitleChange(
                  event.target.value
                )
              }
              placeholder="Product SEO title"
              disabled={disabled}
              maxLength={160}
              className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
      </section>
    </div>
  );
}