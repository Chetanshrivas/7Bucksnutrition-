"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "../../../../lib/supabase";

import ProductForm, {
  type ProductFormData,
} from "../components/ProductForm";

import ProductVariants, {
  type ProductVariantFormData,
} from "../components/ProductVariants";

import ProductImages, {
  type ProductImageFormData,
} from "../components/ProductImages";

const INITIAL_PRODUCT: ProductFormData = {
  name: "",
  slug: "",
  brand_id: "",
  category_id: "",
  subtitle: "",
  description: "",
  short_description: "",
  specifications: "",

  // Simple product fields
  price: "0",
  compare_at_price: "0",
  sku: "",
  stock_quantity: "0",
  is_available: true,

  // Product-level merchandising/status
  is_featured: false,
  is_bestseller: false,
  is_active: true,

  seo_title: "",
  seo_description: "",
};

/**
 * Resolves the selected category into:
 *
 * category_id
 * = exact category selected in ProductForm
 *
 * parent_category_id
 * = top-level/main category
 *
 * Example:
 *
 * Protein
 *   └── Whey Protein
 *
 * Selected:
 *   category_id = Whey Protein
 *   parent_category_id = Protein
 *
 * If a main category itself is selected:
 *   category_id = Protein
 *   parent_category_id = Protein
 */
async function resolveCategoryIds(
  selectedCategoryId: string
): Promise<{
  categoryId: string;
  parentCategoryId: string;
}> {
  const { data: selectedCategory, error } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("id", selectedCategoryId)
    .single();

  if (error) {
    throw new Error(
      `Could not resolve selected category: ${error.message}`
    );
  }

  if (!selectedCategory?.id) {
    throw new Error("Selected category was not found.");
  }

  // Selected category is already top-level.
  if (!selectedCategory.parent_id) {
    return {
      categoryId: selectedCategory.id,
      parentCategoryId: selectedCategory.id,
    };
  }

  // Walk upward through the hierarchy.
  let currentParentId: string | null =
    selectedCategory.parent_id;

  let safetyCounter = 0;

  while (currentParentId && safetyCounter < 20) {
    safetyCounter++;

    const {
      data: parentCategory,
      error: parentError,
    } = await supabase
      .from("categories")
      .select("id, parent_id")
      .eq("id", currentParentId)
      .single();

    if (parentError) {
      throw new Error(
        `Could not resolve parent category: ${parentError.message}`
      );
    }

    if (!parentCategory?.id) {
      throw new Error(
        "The selected category has an invalid parent category."
      );
    }

    if (!parentCategory.parent_id) {
      return {
        categoryId: selectedCategory.id,
        parentCategoryId: parentCategory.id,
      };
    }

    currentParentId = parentCategory.parent_id;
  }

  throw new Error(
    "Category hierarchy could not be resolved. Please check the category parent relationship."
  );
}

export default function NewProductPage() {
  const router = useRouter();

  const [product, setProduct] =
    useState<ProductFormData>(INITIAL_PRODUCT);

  const [variants, setVariants] = useState<
    ProductVariantFormData[]
  >([]);

  const [images, setImages] = useState<
    ProductImageFormData[]
  >([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const hasVariants = variants.length > 0;

  function showError(message: string) {
    setError(message);
    toast.error(message);
  }

  /**
   * Product specifications are stored as JSONB.
   *
   * If valid JSON object is entered:
   *   store it directly.
   *
   * Otherwise:
   *   store the text inside { details: "..." }.
   */
  function parseSpecifications(
    value: string | undefined
  ): Record<string, unknown> {
    const text = value?.trim();

    if (!text) {
      return {};
    }

    try {
      const parsed = JSON.parse(text);

      if (
        parsed !== null &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed as Record<string, unknown>;
      }

      return {
        details: text,
      };
    } catch {
      return {
        details: text,
      };
    }
  }

  /**
   * Converts a simple-product price field safely.
   */
  function parseSimpleNumber(
    value: string | number | undefined,
    fieldName: string
  ): number {
    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      throw new Error(`${fieldName} is required.`);
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      throw new Error(
        `Please enter a valid ${fieldName.toLowerCase()}.`
      );
    }

    if (numberValue < 0) {
      throw new Error(
        `${fieldName} cannot be negative.`
      );
    }

    return numberValue;
  }

  /**
   * Validates all fields belonging to a SIMPLE product.
   */
  function validateSimpleProduct(): boolean {
    try {
      const price = parseSimpleNumber(
        product.price,
        "Price"
      );

      const compareAtValue =
        product.compare_at_price;

      if (
        compareAtValue !== undefined &&
        compareAtValue !== null &&
        String(compareAtValue).trim() !== ""
      ) {
        parseSimpleNumber(
          compareAtValue,
          "Compare-at price"
        );
      }

      const stock = parseSimpleNumber(
        product.stock_quantity,
        "Stock"
      );

      if (!Number.isInteger(stock)) {
        showError("Stock must be a whole number.");
        return false;
      }

      if (!product.sku?.trim()) {
        showError(
          "Product SKU could not be generated. Please try again."
        );
        return false;
      }

      // Keep values referenced so TypeScript doesn't
      // accidentally consider validation incomplete.
      void price;

      return true;
    } catch (validationError) {
      const message =
        validationError instanceof Error
          ? validationError.message
          : "Invalid simple product information.";

      showError(message);
      return false;
    }
  }

  /**
   * Validates VARIABLE product variants.
   */
  function validateVariants(): boolean {
    if (variants.length === 0) {
      return true;
    }

    const skuSet = new Set<string>();

    for (let index = 0; index < variants.length; index++) {
      const variant = variants[index];

      if (!variant) {
        showError(
          `Variant ${index + 1} is invalid.`
        );
        return false;
      }

      const variantNumber = index + 1;

      const sku = variant.sku?.trim();

      if (!sku) {
        showError(
          `SKU is required for Variant ${variantNumber}.`
        );
        return false;
      }

      const normalizedSku = sku.toUpperCase();

      if (skuSet.has(normalizedSku)) {
        showError(
          `Duplicate SKU found in Variant ${variantNumber}.`
        );
        return false;
      }

      skuSet.add(normalizedSku);

      // ---------------------------------------------
      // PRICE
      // ---------------------------------------------
      if (
        variant.price === undefined ||
        variant.price === null ||
        variant.price === ""
      ) {
        showError(
          `Price is required for Variant ${variantNumber}.`
        );
        return false;
      }

      const price = Number(variant.price);

      if (!Number.isFinite(price)) {
        showError(
          `Valid price is required for Variant ${variantNumber}.`
        );
        return false;
      }

      if (price < 0) {
        showError(
          `Price cannot be negative for Variant ${variantNumber}.`
        );
        return false;
      }

      // ---------------------------------------------
      // COMPARE-AT PRICE
      // ---------------------------------------------
      if (
        variant.compareAt !== undefined &&
        variant.compareAt !== null &&
        variant.compareAt !== ""
      ) {
        const compareAt = Number(
          variant.compareAt
        );

        if (!Number.isFinite(compareAt)) {
          showError(
            `Valid compare-at price is required for Variant ${variantNumber}.`
          );
          return false;
        }

        if (compareAt < 0) {
          showError(
            `Compare-at price cannot be negative for Variant ${variantNumber}.`
          );
          return false;
        }
      }

      // ---------------------------------------------
      // STOCK
      // ---------------------------------------------
      if (
        variant.stock !== undefined &&
        variant.stock !== null &&
        variant.stock !== ""
      ) {
        const stock = Number(variant.stock);

        if (!Number.isFinite(stock)) {
          showError(
            `Valid stock is required for Variant ${variantNumber}.`
          );
          return false;
        }

        if (stock < 0) {
          showError(
            `Stock cannot be negative for Variant ${variantNumber}.`
          );
          return false;
        }

        if (!Number.isInteger(stock)) {
          showError(
            `Stock must be a whole number for Variant ${variantNumber}.`
          );
          return false;
        }
      }

      // ---------------------------------------------
      // SERVINGS
      // ---------------------------------------------
      if (
        variant.servings !== undefined &&
        variant.servings !== null &&
        variant.servings !== ""
      ) {
        const servings = Number(
          variant.servings
        );

        if (!Number.isFinite(servings)) {
          showError(
            `Valid servings are required for Variant ${variantNumber}.`
          );
          return false;
        }

        if (servings < 0) {
          showError(
            `Servings cannot be negative for Variant ${variantNumber}.`
          );
          return false;
        }

        if (!Number.isInteger(servings)) {
          showError(
            `Servings must be a whole number for Variant ${variantNumber}.`
          );
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validates image -> variant relationships.
   *
   * Simple product:
   *   images must not point to variants because
   *   there are no variants.
   *
   * Variable product:
   *   every assigned variant must exist in the
   *   current variant list.
   */
  function validateImages(): boolean {
    for (
      let index = 0;
      index < images.length;
      index++
    ) {
      const image = images[index];

      if (!image) {
        continue;
      }

      if (!image.variant_id) {
        continue;
      }

      if (!hasVariants) {
        showError(
          `Image ${index + 1} is assigned to a variant, but this is a simple product.`
        );
        return false;
      }

      const exists = variants.some(
        (variant) =>
          variant.id === image.variant_id
      );

      if (!exists) {
        showError(
          `Image ${index + 1} is assigned to an invalid variant.`
        );
        return false;
      }
    }

    return true;
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    setError("");

    // ---------------------------------------------
    // BASIC PRODUCT VALIDATION
    // ---------------------------------------------
    if (!product.name.trim()) {
      showError("Product name is required.");
      return;
    }

    if (!product.slug.trim()) {
      showError("Product slug is required.");
      return;
    }

    if (!product.brand_id) {
      showError("Please select a brand.");
      return;
    }

    if (!product.category_id) {
      showError("Please select a category.");
      return;
    }

    // ---------------------------------------------
    // PRODUCT TYPE VALIDATION
    // ---------------------------------------------
    //
    // 0 variants:
    //   SIMPLE PRODUCT
    //
    // 1+ variants:
    //   VARIABLE PRODUCT
    //
    if (!hasVariants) {
      const validSimple =
        validateSimpleProduct();

      if (!validSimple) {
        return;
      }
    } else {
      const validVariants =
        validateVariants();

      if (!validVariants) {
        return;
      }
    }

    // ---------------------------------------------
    // IMAGE VALIDATION
    // ---------------------------------------------
    if (!validateImages()) {
      return;
    }

    setSaving(true);

    let createdProductId: string | null = null;

    let createdVariantIds: string[] = [];

    // Keep this outside the try block so it can also
    // be used in success messaging.
    const validImages = images.filter(
      (image) =>
        typeof image.image_url === "string" &&
        image.image_url.trim() !== ""
    );

    try {
      // ---------------------------------------------
      // RESOLVE CATEGORY
      // ---------------------------------------------
      const {
        categoryId,
        parentCategoryId,
      } =
        await resolveCategoryIds(
          product.category_id
        );

      const specifications =
        parseSpecifications(
          product.specifications
        );

      // ---------------------------------------------
      // PREPARE PRODUCT-LEVEL SIMPLE FIELDS
      // ---------------------------------------------
      //
      // SIMPLE:
      //   price
      //   compare_at_price
      //   sku
      //   stock_quantity
      //   is_available
      //
      // VARIABLE:
      //   these product-level fields are intentionally
      //   null/0/false because variants own them.
      //
      let simplePrice: number | null = null;
      let simpleCompareAtPrice:
        | number
        | null = null;
      let simpleSku: string | null = null;
      let simpleStockQuantity = 0;
      let simpleIsAvailable = false;

      if (!hasVariants) {
        simplePrice = parseSimpleNumber(
          product.price,
          "Price"
        );

        if (
          product.compare_at_price !==
            undefined &&
          product.compare_at_price !== null &&
          String(
            product.compare_at_price
          ).trim() !== ""
        ) {
          simpleCompareAtPrice =
            parseSimpleNumber(
              product.compare_at_price,
              "Compare-at price"
            );
        }

        simpleSku =
          product.sku?.trim() || null;

        if (!simpleSku) {
          throw new Error(
            "Product SKU could not be generated."
          );
        }

        simpleStockQuantity =
          parseSimpleNumber(
            product.stock_quantity,
            "Stock"
          );

        if (
          !Number.isInteger(
            simpleStockQuantity
          )
        ) {
          throw new Error(
            "Stock must be a whole number."
          );
        }

        simpleIsAvailable =
          Boolean(product.is_available);
      }

      // ---------------------------------------------
      // 1. CREATE PRODUCT
      // ---------------------------------------------
      const {
        data: createdProduct,
        error: productError,
      } = await supabase
        .from("products")
        .insert({
          brand_id: product.brand_id,

          // Exact selected category.
          category_id: categoryId,

          // Top-level/main category.
          parent_category_id:
            parentCategoryId,

          name: product.name.trim(),
          slug: product.slug.trim(),

          subtitle:
            product.subtitle?.trim() || null,

          description:
            product.description?.trim() ||
            null,

          short_description:
            product.short_description?.trim() ||
            null,

          specifications,

          rating: 0,
          review_count: 0,

          // -----------------------------------------
          // SIMPLE PRODUCT FIELDS
          // -----------------------------------------
          //
          // For VARIABLE products:
          // price = null
          // compare_at_price = null
          // sku = null
          // stock_quantity = 0
          // is_available = false
          //
          // Variant data lives in product_variants
          // + inventory.
          //
          price: simplePrice,

          compare_at_price:
            simpleCompareAtPrice,

          sku: simpleSku,

          stock_quantity:
            simpleStockQuantity,

          is_available:
            simpleIsAvailable,

          // -----------------------------------------
          // PRODUCT-LEVEL FLAGS
          // -----------------------------------------
          is_featured:
            Boolean(product.is_featured),

          is_bestseller:
            Boolean(product.is_bestseller),

          is_active:
            Boolean(product.is_active),

          seo_title:
            product.seo_title?.trim() ||
            null,

          seo_description:
            product.seo_description?.trim() ||
            null,
        })
        .select("id")
        .single();

      if (productError) {
        throw new Error(
          `Product save failed: ${productError.message}`
        );
      }

      if (!createdProduct?.id) {
        throw new Error(
          "Product was created but no product ID was returned."
        );
      }

      createdProductId =
        createdProduct.id;

      // ---------------------------------------------
      // 2. VARIABLE PRODUCT ONLY:
      // CREATE VARIANTS
      // ---------------------------------------------
      //
      // SIMPLE PRODUCT:
      // skip this entire section.
      //
      if (hasVariants) {
        const variantRows =
          variants.map((variant) => {
            const price = Number(
              variant.price
            );

            const servings =
              variant.servings ===
                undefined ||
              variant.servings === null ||
              variant.servings === ""
                ? null
                : Number(
                    variant.servings
                  );

            const compareAt =
              variant.compareAt ===
                undefined ||
              variant.compareAt ===
                null ||
              variant.compareAt === ""
                ? null
                : Number(
                    variant.compareAt
                  );

            return {
              product_id:
                createdProduct.id,

              sku:
                variant.sku.trim(),

              flavor:
                variant.flavor?.trim() ||
                null,

              size:
                variant.size?.trim() ||
                null,

              servings,

              price,

              compare_at_price:
                compareAt,

              is_available:
                variant.available ??
                true,
            };
          });

        const {
          data: createdVariants,
          error: variantsError,
        } = await supabase
          .from("product_variants")
          .insert(variantRows)
          .select("id");

        if (variantsError) {
          throw new Error(
            `Variant save failed: ${variantsError.message}`
          );
        }

        if (
          !createdVariants ||
          createdVariants.length !==
            variants.length
        ) {
          throw new Error(
            "Not all product variants were created."
          );
        }

        createdVariantIds =
          createdVariants
            .map(
              (variant) => variant.id
            )
            .filter(Boolean);

        if (
          createdVariantIds.length !==
          variants.length
        ) {
          throw new Error(
            "Could not retrieve all created variant IDs."
          );
        }

        // -------------------------------------------
        // 3. FRONTEND VARIANT ID ->
        //    DATABASE VARIANT ID
        // -------------------------------------------
        const variantIdMap =
          new Map<string, string>();

        variants.forEach(
          (frontendVariant, index) => {
            const databaseVariant =
              createdVariants[index];

            if (
              frontendVariant.id &&
              databaseVariant?.id
            ) {
              variantIdMap.set(
                frontendVariant.id,
                databaseVariant.id
              );
            }
          }
        );

        // -------------------------------------------
        // 4. CREATE INVENTORY
        // -------------------------------------------
        const inventoryRows =
          variants.map(
            (variant, index) => {
              const databaseVariantId =
                createdVariants[index]?.id;

              if (!databaseVariantId) {
                throw new Error(
                  `Could not get database ID for Variant ${
                    index + 1
                  }.`
                );
              }

              const stockNumber =
                Number(
                  variant.stock ?? 0
                );

              const stockQuantity =
                Number.isFinite(
                  stockNumber
                )
                  ? Math.max(
                      0,
                      Math.floor(
                        stockNumber
                      )
                    )
                  : 0;

              return {
                variant_id:
                  databaseVariantId,

                stock_quantity:
                  stockQuantity,

                reserved_quantity: 0,

                low_stock_threshold: 5,
              };
            }
          );

        const {
          error: inventoryError,
        } = await supabase
          .from("inventory")
          .insert(
            inventoryRows
          );

        if (inventoryError) {
          throw new Error(
            `Inventory save failed: ${inventoryError.message}`
          );
        }

        // -------------------------------------------
        // CREATE IMAGES
        // -------------------------------------------
        //
        // This is done below for BOTH simple and
        // variable products.
        //
        // For variable products, variant_id is mapped
        // to the actual database variant ID.
        //
        // For simple products, variant_id remains null.
        //
        if (validImages.length > 0) {
          const imageRows =
            validImages.map(
              (image, index) => {
                let databaseVariantId:
                  | string
                  | null = null;

                if (image.variant_id) {
                  databaseVariantId =
                    variantIdMap.get(
                      image.variant_id
                    ) ?? null;

                  if (
                    !databaseVariantId
                  ) {
                    throw new Error(
                      `Could not map variant for image ${
                        index + 1
                      }.`
                    );
                  }
                }

                return {
                  product_id:
                    createdProduct.id,

                  variant_id:
                    databaseVariantId,

                  cloudinary_public_id:
                    image.cloudinary_public_id ??
                    null,

                  image_url:
                    image.image_url.trim(),

                  alt_text:
                    image.alt_text?.trim() ||
                    null,

                  image_type:
                    image.image_type?.trim() ||
                    "gallery",

                  sort_order:
                    Number.isFinite(
                      Number(
                        image.sort_order
                      )
                    )
                      ? Number(
                          image.sort_order
                        )
                      : index,

                  is_primary:
                    Boolean(
                      image.is_primary
                    ),
                };
              }
            );

          const {
            error: imagesError,
          } = await supabase
            .from("product_images")
            .insert(imageRows);

          if (imagesError) {
            throw new Error(
              `Image save failed: ${imagesError.message}`
            );
          }
        }
      } else {
        // -------------------------------------------
        // SIMPLE PRODUCT
        // -------------------------------------------
        //
        // No variants.
        // No inventory rows.
        //
        // Product-level stock/price/SKU are already
        // stored above.
        //
        if (validImages.length > 0) {
          const imageRows =
            validImages.map(
              (image, index) => {
                return {
                  product_id:
                    createdProduct.id,

                  variant_id: null,

                  cloudinary_public_id:
                    image.cloudinary_public_id ??
                    null,

                  image_url:
                    image.image_url.trim(),

                  alt_text:
                    image.alt_text?.trim() ||
                    null,

                  image_type:
                    image.image_type?.trim() ||
                    "gallery",

                  sort_order:
                    Number.isFinite(
                      Number(
                        image.sort_order
                      )
                    )
                      ? Number(
                          image.sort_order
                        )
                      : index,

                  is_primary:
                    Boolean(
                      image.is_primary
                    ),
                };
              }
            );

          const {
            error: imagesError,
          } = await supabase
            .from("product_images")
            .insert(imageRows);

          if (imagesError) {
            throw new Error(
              `Image save failed: ${imagesError.message}`
            );
          }
        }
      }

      // ---------------------------------------------
      // SUCCESS
      // ---------------------------------------------
      const productType = hasVariants
        ? "variable product"
        : "simple product";

      toast.success(
        "Product created successfully.",
        {
          description: `${productType} saved with ${validImages.length} image${
            validImages.length === 1
              ? ""
              : "s"
          }.`,
        }
      );

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 700)
      );

      router.push(
        "/admin/products"
      );

      router.refresh();
    } catch (saveError) {
      console.error(
        "Create product error:",
        saveError
      );

      // ---------------------------------------------
      // ROLLBACK
      // ---------------------------------------------
      if (createdProductId) {
        try {
          // Delete images first.
          await supabase
            .from("product_images")
            .delete()
            .eq(
              "product_id",
              createdProductId
            );

          // Delete variant inventory + variants
          // only when variants were created.
          if (
            createdVariantIds.length > 0
          ) {
            await supabase
              .from("inventory")
              .delete()
              .in(
                "variant_id",
                createdVariantIds
              );

            await supabase
              .from("product_variants")
              .delete()
              .in(
                "id",
                createdVariantIds
              );
          }

          // Finally delete product.
          const {
            error:
              rollbackProductError,
          } = await supabase
            .from("products")
            .delete()
            .eq(
              "id",
              createdProductId
            );

          if (
            rollbackProductError
          ) {
            console.error(
              "Product rollback failed:",
              rollbackProductError
            );
          }
        } catch (rollbackError) {
          console.error(
            "Rollback failed:",
            rollbackError
          );
        }
      }

      const message =
        saveError instanceof Error
          ? saveError.message
          : "Something went wrong while saving the product.";

      setError(message);

      toast.error(
        "Could not create product",
        {
          description: message,
        }
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f2eb]">
      {/* ------------------------------------------- */}
      {/* HEADER */}
      {/* ------------------------------------------- */}
      <div className="border-b border-black/[0.07] bg-[#f5f2eb] px-5 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/products"
              className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 transition hover:text-black"
            >
              ← Back to Products
            </Link>

            <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
              Products
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
              Add Product
            </h1>

            <p className="mt-2 max-w-xl text-xs leading-5 text-black/45">
              Create a simple or variable
              product, upload product
              images and prepare it for
              the storefront.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#171512] px-6 text-[10px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#292722] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Product"}
          </button>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* CONTENT */}
      {/* ------------------------------------------- */}
      <div className="px-5 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ERROR */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 shrink-0 text-red-500"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />

                  <path d="M12 8v4" />

                  <path d="M12 16h.01" />
                </svg>

                <div>
                  <p className="text-xs font-semibold text-red-700">
                    Could not save product
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-red-600">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------- */}
          {/* PRODUCT INFORMATION */}
          {/* --------------------------------------- */}
          <ProductForm
            value={product}
            onChangeAction={setProduct}
            disabled={saving}
            hasVariants={hasVariants}
          />

          {/* --------------------------------------- */}
          {/* VARIANTS */}
          {/* --------------------------------------- */}
          <ProductVariants
            variants={variants}
            onChangeAction={setVariants}
            disabled={saving}
          />

          {/* --------------------------------------- */}
          {/* IMAGES */}
          {/* --------------------------------------- */}
          <ProductImages
            images={images}
            variants={variants}
            onChangeAction={setImages}
            disabled={saving}
          />

          {/* --------------------------------------- */}
          {/* BOTTOM ACTIONS */}
          {/* --------------------------------------- */}
          <div className="flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/admin/products"
              className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white px-6 text-[10px] font-bold uppercase tracking-[0.13em] text-black/60 transition hover:bg-black/[0.03] hover:text-black"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#171512] px-8 text-[10px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#292722] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Product..."
                : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}