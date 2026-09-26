"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { supabase } from "../../../../../lib/supabase";

import ProductForm, {
  type ProductFormData,
} from "../../components/ProductForm";

import ProductVariants, {
  type ProductVariantFormData,
} from "../../components/ProductVariants";

import ProductImages, {
  type ProductImageFormData,
} from "../../components/ProductImages";

import { revalidateHomepage } from "../../actions";

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

  // Product-level flags
  is_featured: false,
  is_bestseller: false,
  is_active: true,

  seo_title: "",
  seo_description: "",
};

type InventoryRow = {
  id: string;
  variant_id: string;
  stock_quantity: number | null;
  reserved_quantity: number | null;
  low_stock_threshold: number | null;
};

/**
 * Resolves:
 *
 * category_id
 * = exact selected category
 *
 * parent_category_id
 * = top-level/main category
 */
async function resolveCategoryIds(
  selectedCategoryId: string
): Promise<{
  categoryId: string;
  parentCategoryId: string;
}> {
  const { data: selectedCategory, error } =
    await supabase
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
    throw new Error(
      "Selected category was not found."
    );
  }

  if (!selectedCategory.parent_id) {
    return {
      categoryId: selectedCategory.id,
      parentCategoryId: selectedCategory.id,
    };
  }

  let currentParentId: string | null =
    selectedCategory.parent_id;

  let safetyCounter = 0;

  while (
    currentParentId &&
    safetyCounter < 20
  ) {
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
        parentCategoryId:
          parentCategory.id,
      };
    }

    currentParentId =
      parentCategory.parent_id;
  }

  throw new Error(
    "Category hierarchy could not be resolved. Please check the category parent relationship."
  );
}

function parseNumber(
  value: string | number | undefined,
  fieldName: string
): number {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    throw new Error(
      `${fieldName} is required.`
    );
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

function parseSpecifications(
  value: string | undefined
): Record<string, unknown> | null {
  const text = value?.trim();

  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(text);

    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<
        string,
        unknown
      >;
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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [product, setProduct] =
    useState<ProductFormData>(
      INITIAL_PRODUCT
    );

  const [variants, setVariants] =
    useState<ProductVariantFormData[]>(
      []
    );

  const [images, setImages] =
    useState<ProductImageFormData[]>(
      []
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const hasVariants =
    variants.length > 0;

  /**
   * LOAD PRODUCT
   */
  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        toast.error(
          "Product ID is missing."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // ---------------------------------------------
        // PRODUCT
        // ---------------------------------------------
        const {
          data: productData,
          error: productError,
        } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (productError) {
          throw new Error(
            `Could not load product: ${productError.message}`
          );
        }

        if (!productData) {
          throw new Error(
            "Product was not found."
          );
        }

        setProduct({
          name: productData.name ?? "",
          slug: productData.slug ?? "",
          brand_id:
            productData.brand_id ?? "",
          category_id:
            productData.category_id ?? "",

          subtitle:
            productData.subtitle ?? "",

          description:
            productData.description ?? "",

          short_description:
            productData.short_description ??
            "",

          specifications:
            typeof productData.specifications ===
            "string"
              ? productData.specifications
              : productData.specifications
                ? JSON.stringify(
                    productData.specifications,
                    null,
                    2
                  )
                : "",

          // -----------------------------------------
          // SIMPLE PRODUCT FIELDS
          // -----------------------------------------
          price:
            productData.price == null
              ? "0"
              : String(productData.price),

          compare_at_price:
            productData.compare_at_price ==
            null
              ? "0"
              : String(
                  productData.compare_at_price
                ),

          sku:
            productData.sku ?? "",

          stock_quantity:
            productData.stock_quantity == null
              ? "0"
              : String(
                  productData.stock_quantity
                ),

          is_available:
            productData.is_available ??
            true,

          // -----------------------------------------
          // PRODUCT FLAGS
          // -----------------------------------------
          is_featured:
            productData.is_featured ??
            false,

          is_bestseller:
            productData.is_bestseller ??
            false,

          is_active:
            productData.is_active ?? true,

          seo_title:
            productData.seo_title ?? "",

          seo_description:
            productData.seo_description ??
            "",
        });

        // ---------------------------------------------
        // VARIANTS
        // ---------------------------------------------
        const {
          data: variantData,
          error: variantError,
        } = await supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", productId)
          .order("created_at", {
            ascending: true,
          });

        if (variantError) {
          throw new Error(
            `Could not load variants: ${variantError.message}`
          );
        }

        const variantIds =
          (variantData ?? [])
            .map(
              (variant) => variant.id
            )
            .filter(
              (
                id
              ): id is string =>
                Boolean(id)
            );

        // ---------------------------------------------
        // INVENTORY
        // ---------------------------------------------
        let inventoryData: InventoryRow[] =
          [];

        if (variantIds.length > 0) {
          const {
            data,
            error: inventoryError,
          } = await supabase
            .from("inventory")
            .select(
              "id, variant_id, stock_quantity, reserved_quantity, low_stock_threshold"
            )
            .in(
              "variant_id",
              variantIds
            );

          if (inventoryError) {
            throw new Error(
              `Could not load inventory: ${inventoryError.message}`
            );
          }

          inventoryData =
            (data ?? []) as InventoryRow[];
        }

        // ---------------------------------------------
        // MERGE VARIANTS + INVENTORY
        // ---------------------------------------------
        const mergedVariants =
          (variantData ?? []).map(
            (variant) => {
              const inventory =
                inventoryData.find(
                  (item) =>
                    item.variant_id ===
                    variant.id
                );

              return {
                id: variant.id,

                sku:
                  variant.sku ?? "",

                flavor:
                  variant.flavor ?? "",

                size:
                  variant.size ?? "",

                servings:
                  variant.servings == null
                    ? ""
                    : String(
                        variant.servings
                      ),

                price:
                  variant.price == null
                    ? ""
                    : String(
                        variant.price
                      ),

                compareAt:
                  variant.compare_at_price ==
                  null
                    ? ""
                    : String(
                        variant.compare_at_price
                      ),

                stock:
                  inventory?.stock_quantity ==
                  null
                    ? "0"
                    : String(
                        inventory.stock_quantity
                      ),

                available:
                  variant.is_available ??
                  true,
              };
            }
          );

        setVariants(
          mergedVariants as ProductVariantFormData[]
        );

        // ---------------------------------------------
        // IMAGES
        // ---------------------------------------------
        const {
          data: imageData,
          error: imageError,
        } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", productId)
          .order("sort_order", {
            ascending: true,
          });

        if (imageError) {
          throw new Error(
            `Could not load images: ${imageError.message}`
          );
        }

        setImages(
          (imageData ?? []).map(
            (
              image
            ): ProductImageFormData => ({
              id: image.id,

              image_url:
                image.image_url ?? "",

              alt_text:
                image.alt_text ?? "",

              is_primary:
                image.is_primary ??
                false,

              sort_order:
                image.sort_order ?? 0,

              variant_id:
                image.variant_id ??
                null,

              cloudinary_public_id:
                image.cloudinary_public_id ??
                null,

              image_type:
                image.image_type ??
                "gallery",
            })
          )
        );
      } catch (error) {
        console.error(
          "Load product error:",
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProduct();
  }, [productId]);

  /**
   * VALIDATE SIMPLE PRODUCT
   */
  function validateSimpleProduct(): boolean {
    try {
      parseNumber(
        product.price,
        "Price"
      );

      if (
        product.compare_at_price !==
          undefined &&
        product.compare_at_price !==
          null &&
        String(
          product.compare_at_price
        ).trim() !== ""
      ) {
        parseNumber(
          product.compare_at_price,
          "Compare-at price"
        );
      }

      const stock = parseNumber(
        product.stock_quantity,
        "Stock"
      );

      if (!Number.isInteger(stock)) {
        toast.error(
          "Stock must be a whole number."
        );
        return false;
      }

      if (!product.sku?.trim()) {
        toast.error(
          "Product SKU is required."
        );
        return false;
      }

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Invalid product information."
      );

      return false;
    }
  }

  /**
   * VALIDATE VARIANTS
   */
  function validateVariants(): boolean {
    if (variants.length === 0) {
      return true;
    }

    const skuSet = new Set<string>();

    for (
      let index = 0;
      index < variants.length;
      index++
    ) {
      const variant =
        variants[index];

      if (!variant) {
        toast.error(
          `Variant ${
            index + 1
          } is invalid.`
        );
        return false;
      }

      const number =
        index + 1;

      const sku =
        variant.sku?.trim();

      if (!sku) {
        toast.error(
          `SKU is required for Variant ${number}.`
        );
        return false;
      }

      const normalizedSku =
        sku.toUpperCase();

      if (
        skuSet.has(
          normalizedSku
        )
      ) {
        toast.error(
          `Duplicate SKU found in Variant ${number}.`
        );
        return false;
      }

      skuSet.add(
        normalizedSku
      );

      // PRICE
      if (
        variant.price ===
          undefined ||
        variant.price === null ||
        variant.price === ""
      ) {
        toast.error(
          `Price is required for Variant ${number}.`
        );
        return false;
      }

      const price = Number(
        variant.price
      );

      if (
        !Number.isFinite(
          price
        ) ||
        price < 0
      ) {
        toast.error(
          `Valid non-negative price is required for Variant ${number}.`
        );
        return false;
      }

      // COMPARE AT
      if (
        variant.compareAt !==
          undefined &&
        variant.compareAt !==
          null &&
        variant.compareAt !== ""
      ) {
        const compareAt =
          Number(
            variant.compareAt
          );

        if (
          !Number.isFinite(
            compareAt
          ) ||
          compareAt < 0
        ) {
          toast.error(
            `Valid non-negative compare-at price is required for Variant ${number}.`
          );
          return false;
        }
      }

      // STOCK
      if (
        variant.stock !==
          undefined &&
        variant.stock !==
          null &&
        variant.stock !== ""
      ) {
        const stock = Number(
          variant.stock
        );

        if (
          !Number.isFinite(
            stock
          ) ||
          stock < 0
        ) {
          toast.error(
            `Valid non-negative stock is required for Variant ${number}.`
          );
          return false;
        }

        if (
          !Number.isInteger(
            stock
          )
        ) {
          toast.error(
            `Stock must be a whole number for Variant ${number}.`
          );
          return false;
        }
      }

      // SERVINGS
      if (
        variant.servings !==
          undefined &&
        variant.servings !==
          null &&
        variant.servings !== ""
      ) {
        const servings =
          Number(
            variant.servings
          );

        if (
          !Number.isFinite(
            servings
          ) ||
          servings < 0
        ) {
          toast.error(
            `Valid non-negative servings are required for Variant ${number}.`
          );
          return false;
        }

        if (
          !Number.isInteger(
            servings
          )
        ) {
          toast.error(
            `Servings must be a whole number for Variant ${number}.`
          );
          return false;
        }
      }
    }

    return true;
  }

  /**
   * VALIDATE IMAGE -> VARIANT RELATION
   */
  function validateImages(): boolean {
    for (
      let index = 0;
      index < images.length;
      index++
    ) {
      const image =
        images[index];

      if (!image) {
        continue;
      }

      if (!image.variant_id) {
        continue;
      }

      // Simple product cannot have
      // variant-specific images.
      if (!hasVariants) {
        toast.error(
          `Image ${
            index + 1
          } is assigned to a variant, but this is a simple product.`
        );
        return false;
      }

      const exists =
        variants.some(
          (variant) =>
            variant.id ===
            image.variant_id
        );

      if (!exists) {
        toast.error(
          `Image ${
            index + 1
          } is assigned to an invalid variant.`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * SAVE PRODUCT
   */
  async function handleSave() {
    if (saving) {
      return;
    }

    if (!productId) {
      toast.error(
        "Product ID is missing."
      );
      return;
    }

    // ---------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------
    if (!product.name.trim()) {
      toast.error(
        "Product name is required."
      );
      return;
    }

    if (!product.slug.trim()) {
      toast.error(
        "Product slug is required."
      );
      return;
    }

    if (!product.brand_id) {
      toast.error(
        "Please select a brand."
      );
      return;
    }

    if (!product.category_id) {
      toast.error(
        "Please select a category."
      );
      return;
    }

    // ---------------------------------------------
    // PRODUCT TYPE VALIDATION
    // ---------------------------------------------
    //
    // 0 variants = SIMPLE
    // 1+ variants = VARIABLE
    //
    if (hasVariants) {
      if (!validateVariants()) {
        return;
      }
    } else {
      if (!validateSimpleProduct()) {
        return;
      }
    }

    if (!validateImages()) {
      return;
    }

    setSaving(true);

    const toastId =
      toast.loading(
        "Saving product..."
      );

    try {
      // ---------------------------------------------
      // CATEGORY
      // ---------------------------------------------
      const {
        categoryId,
        parentCategoryId,
      } =
        await resolveCategoryIds(
          product.category_id
        );

      // ---------------------------------------------
      // SPECIFICATIONS
      // ---------------------------------------------
      const specifications =
        parseSpecifications(
          product.specifications
        );

      // ---------------------------------------------
      // PRODUCT-LEVEL SIMPLE FIELDS
      // ---------------------------------------------
      let simplePrice:
        | number
        | null = null;

      let simpleCompareAt:
        | number
        | null = null;

      let simpleSku:
        | string
        | null = null;

      let simpleStock = 0;

      let simpleAvailable =
        false;

      if (!hasVariants) {
        simplePrice =
          parseNumber(
            product.price,
            "Price"
          );

        if (
          product.compare_at_price !==
            undefined &&
          product.compare_at_price !==
            null &&
          String(
            product.compare_at_price
          ).trim() !== ""
        ) {
          simpleCompareAt =
            parseNumber(
              product.compare_at_price,
              "Compare-at price"
            );
        }

        simpleSku =
          product.sku?.trim() ||
          null;

        if (!simpleSku) {
          throw new Error(
            "Product SKU is required."
          );
        }

        simpleStock =
          parseNumber(
            product.stock_quantity,
            "Stock"
          );

        if (
          !Number.isInteger(
            simpleStock
          )
        ) {
          throw new Error(
            "Stock must be a whole number."
          );
        }

        simpleAvailable =
          Boolean(
            product.is_available
          );
      }

      // ---------------------------------------------
      // 1. UPDATE PRODUCT
      // ---------------------------------------------
      //
      // SIMPLE:
      // product-level pricing/stock/SKU
      //
      // VARIABLE:
      // product-level pricing/stock/SKU
      // are cleared because variants own them.
      //
      const {
        error: productError,
      } = await supabase
        .from("products")
        .update({
          name: product.name.trim(),

          slug: product.slug.trim(),

          brand_id:
            product.brand_id,

          category_id:
            categoryId,

          parent_category_id:
            parentCategoryId,

          subtitle:
            product.subtitle?.trim() ||
            null,

          description:
            product.description?.trim() ||
            null,

          short_description:
            product.short_description?.trim() ||
            null,

          specifications,

          // SIMPLE PRODUCT DATA
          price: simplePrice,

          compare_at_price:
            simpleCompareAt,

          sku: simpleSku,

          stock_quantity:
            simpleStock,

          is_available:
            simpleAvailable,

          // PRODUCT-LEVEL FLAGS
          is_featured:
            Boolean(
              product.is_featured
            ),

          is_bestseller:
            Boolean(
              product.is_bestseller
            ),

          is_active:
            Boolean(
              product.is_active
            ),

          seo_title:
            product.seo_title?.trim() ||
            null,

          seo_description:
            product.seo_description?.trim() ||
            null,
        })
        .eq("id", productId);

      if (productError) {
        throw new Error(
          `Product update failed: ${productError.message}`
        );
      }

      // ---------------------------------------------
      // GET EXISTING VARIANTS
      // ---------------------------------------------
      const {
        data: existingVariants,
        error:
          existingVariantsError,
      } = await supabase
        .from("product_variants")
        .select("id")
        .eq(
          "product_id",
          productId
        );

      if (existingVariantsError) {
        throw new Error(
          `Could not read existing variants: ${existingVariantsError.message}`
        );
      }

      const existingVariantIds =
        (
          existingVariants ?? []
        )
          .map(
            (variant) =>
              variant.id
          )
          .filter(
            (
              id
            ): id is string =>
              Boolean(id)
          );

      const currentVariantIds =
        variants
          .map(
            (variant) =>
              variant.id
          )
          .filter(
            (
              id
            ): id is string =>
              Boolean(id)
          );

      // ---------------------------------------------
      // DELETE REMOVED VARIANTS
      // ---------------------------------------------
      //
      // This is important when:
      //
      // Variable:
      //   Variant A
      //   Variant B
      //
      // User removes B.
      //
      // We delete:
      // inventory(B)
      // images(B)
      // variant(B)
      //
      const removedVariantIds =
        existingVariantIds.filter(
          (id) =>
            !currentVariantIds.includes(
              id
            )
        );

      if (
        removedVariantIds.length >
        0
      ) {
        const {
          error:
            inventoryDeleteError,
        } = await supabase
          .from("inventory")
          .delete()
          .in(
            "variant_id",
            removedVariantIds
          );

        if (
          inventoryDeleteError
        ) {
          throw new Error(
            `Could not remove old inventory: ${inventoryDeleteError.message}`
          );
        }

        const {
          error:
            imageDeleteError,
        } = await supabase
          .from("product_images")
          .delete()
          .in(
            "variant_id",
            removedVariantIds
          );

        if (
          imageDeleteError
        ) {
          throw new Error(
            `Could not remove old variant images: ${imageDeleteError.message}`
          );
        }

        const {
          error:
            variantDeleteError,
        } = await supabase
          .from("product_variants")
          .delete()
          .in(
            "id",
            removedVariantIds
          );

        if (
          variantDeleteError
        ) {
          throw new Error(
            `Could not remove old variants: ${variantDeleteError.message}`
          );
        }
      }

      // ---------------------------------------------
      // IF SIMPLE PRODUCT
      // ---------------------------------------------
      //
      // There must be ZERO variants.
      //
      // Any existing variants have already been
      // removed above.
      //
      // No inventory rows are created.
      //
      if (!hasVariants) {
        // Safety cleanup for any inventory rows
        // that somehow remain attached to an
        // old variant of this product.
        //
        // At this point existing variants should
        // already have been removed.
      }

      // ---------------------------------------------
      // VARIABLE PRODUCT:
      // UPDATE / CREATE VARIANTS
      // ---------------------------------------------
      const variantIdMap =
        new Map<string, string>();

      if (hasVariants) {
        for (
          let index = 0;
          index < variants.length;
          index++
        ) {
          const variant =
            variants[index];

          if (!variant) {
            throw new Error(
              `Variant ${
                index + 1
              } is invalid.`
            );
          }

          const variantNumber =
            index + 1;

          const variantPayload = {
            product_id:
              productId,

            sku:
              variant.sku.trim(),

            flavor:
              variant.flavor?.trim() ||
              null,

            size:
              variant.size?.trim() ||
              null,

            servings:
              variant.servings ===
                "" ||
              variant.servings ===
                undefined ||
              variant.servings ===
                null
                ? null
                : Number(
                    variant.servings
                  ),

            price:
              Number(
                variant.price
              ),

            compare_at_price:
              variant.compareAt ===
                "" ||
              variant.compareAt ===
                undefined ||
              variant.compareAt ===
                null
                ? null
                : Number(
                    variant.compareAt
                  ),

            is_available:
              variant.available ??
              true,
          };

          let savedVariantId:
            | string
            | null = null;

          // -----------------------------------------
          // UPDATE EXISTING VARIANT
          // -----------------------------------------
          if (
            variant.id &&
            existingVariantIds.includes(
              variant.id
            )
          ) {
            const {
              data,
              error:
                updateVariantError,
            } = await supabase
              .from(
                "product_variants"
              )
              .update(
                variantPayload
              )
              .eq(
                "id",
                variant.id
              )
              .eq(
                "product_id",
                productId
              )
              .select("id")
              .single();

            if (
              updateVariantError
            ) {
              throw new Error(
                `Variant ${variantNumber} update failed: ${updateVariantError.message}`
              );
            }

            savedVariantId =
              data?.id ??
              variant.id;
          }

          // -----------------------------------------
          // CREATE NEW VARIANT
          // -----------------------------------------
          else {
            const {
              data,
              error:
                insertVariantError,
            } = await supabase
              .from(
                "product_variants"
              )
              .insert(
                variantPayload
              )
              .select("id")
              .single();

            if (
              insertVariantError
            ) {
              throw new Error(
                `Variant ${variantNumber} creation failed: ${insertVariantError.message}`
              );
            }

            savedVariantId =
              data?.id ?? null;
          }

          if (!savedVariantId) {
            throw new Error(
              `Could not get database ID for Variant ${variantNumber}.`
            );
          }

          // Map frontend temporary ID
          // to database ID.
          if (variant.id) {
            variantIdMap.set(
              variant.id,
              savedVariantId
            );
          }

          // -----------------------------------------
          // INVENTORY
          // -----------------------------------------
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

          const inventoryPayload = {
            variant_id:
              savedVariantId,

            stock_quantity:
              stockQuantity,

            reserved_quantity: 0,

            low_stock_threshold: 5,
          };

          const {
            data:
              existingInventory,
            error:
              existingInventoryError,
          } = await supabase
            .from("inventory")
            .select("id")
            .eq(
              "variant_id",
              savedVariantId
            )
            .maybeSingle();

          if (
            existingInventoryError
          ) {
            throw new Error(
              `Could not check inventory for Variant ${variantNumber}: ${existingInventoryError.message}`
            );
          }

          // UPDATE INVENTORY
          if (
            existingInventory?.id
          ) {
            const {
              error:
                updateInventoryError,
            } = await supabase
              .from("inventory")
              .update(
                inventoryPayload
              )
              .eq(
                "id",
                existingInventory.id
              );

            if (
              updateInventoryError
            ) {
              throw new Error(
                `Inventory update failed for Variant ${variantNumber}: ${updateInventoryError.message}`
              );
            }
          }

          // CREATE INVENTORY
          else {
            const {
              error:
                insertInventoryError,
            } = await supabase
              .from("inventory")
              .insert(
                inventoryPayload
              );

            if (
              insertInventoryError
            ) {
              throw new Error(
                `Inventory creation failed for Variant ${variantNumber}: ${insertInventoryError.message}`
              );
            }
          }
        }
      }

      // ---------------------------------------------
      // IMAGES
      // ---------------------------------------------
      //
      // We replace product images with the current
      // state from ProductImages.
      //
      // This supports:
      // - adding images
      // - removing images
      // - reordering
      // - changing primary image
      // - changing variant assignment
      //
      const {
        error: deleteImagesError,
      } = await supabase
        .from("product_images")
        .delete()
        .eq(
          "product_id",
          productId
        );

      if (deleteImagesError) {
        throw new Error(
          `Could not update product images: ${deleteImagesError.message}`
        );
      }

      const validImages =
        images.filter(
          (image) =>
            typeof image.image_url ===
              "string" &&
            image.image_url.trim() !==
              ""
        );

      if (
        validImages.length > 0
      ) {
        const imageRows =
          validImages.map(
            (
              image,
              index
            ) => {
              let databaseVariantId:
                | string
                | null = null;

              // ---------------------------------------
              // SIMPLE PRODUCT
              // ---------------------------------------
              if (!hasVariants) {
                databaseVariantId =
                  null;
              }

              // ---------------------------------------
              // VARIABLE PRODUCT
              // ---------------------------------------
              else if (
                image.variant_id
              ) {
                databaseVariantId =
                  variantIdMap.get(
                    image.variant_id
                  ) ?? null;

                // Existing database variant IDs
                // can be used directly.
                if (
                  !databaseVariantId
                ) {
                  const existingVariant =
                    variants.find(
                      (
                        variant
                      ) =>
                        variant.id ===
                        image.variant_id
                    );

                  if (
                    existingVariant?.id &&
                    existingVariantIds.includes(
                      existingVariant.id
                    )
                  ) {
                    databaseVariantId =
                      existingVariant.id;
                  }
                }

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
                  productId,

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
          error:
            insertImagesError,
        } = await supabase
          .from("product_images")
          .insert(
            imageRows
          );

        if (
          insertImagesError
        ) {
          throw new Error(
            `Image save failed: ${insertImagesError.message}`
          );
        }
      }

      // ---------------------------------------------
      // REVALIDATE HOMEPAGE
      // ---------------------------------------------
      //
      // Featured/bestseller flags, price, stock, etc. shown on the
      // homepage need to reflect this change right away — not wait
      // for the next scheduled ISR refresh. This is a Server Action
      // (see app/admin/products/actions.ts), safe to call directly
      // from this client component.
      try {
        await revalidateHomepage();
      } catch (revalidateError) {
        // Not fatal — the homepage's own `revalidate` window (see
        // app/page.tsx) is still there as a safety net, so the
        // change will show up on its own even if this call fails.
        console.error(
          "Homepage revalidation failed:",
          revalidateError
        );
      }

      // ---------------------------------------------
      // SUCCESS
      // ---------------------------------------------
      const productType =
        hasVariants
          ? "Variable product"
          : "Simple product";

      toast.success(
        `${productType} updated successfully.`,
        {
          id: toastId,
          description: `${validImages.length} image${
            validImages.length ===
            1
              ? ""
              : "s"
          } saved.`,
        }
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            500
          )
      );

      router.push(
        "/admin/products"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Product update error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update product.",
        {
          id: toastId,
        }
      );
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-black/[0.07] bg-white p-8">
            <div className="h-4 w-32 animate-pulse rounded bg-black/5" />

            <div className="mt-4 h-8 w-64 animate-pulse rounded bg-black/5" />

            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-black/5" />

            <div className="mt-8 grid gap-4">
              <div className="h-20 animate-pulse rounded-xl bg-black/[0.03]" />

              <div className="h-20 animate-pulse rounded-xl bg-black/[0.03]" />

              <div className="h-20 animate-pulse rounded-xl bg-black/[0.03]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------------------------
  // PAGE
  // ---------------------------------------------
  return (
    <main className="min-h-screen bg-[#f5f2eb]">
      {/* HEADER */}
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
              Edit Product
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-[10px] text-black/40">
                Product ID:{" "}
                {productId}
              </p>

              <span className="text-black/20">
                •
              </span>

              <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-black/50">
                {hasVariants
                  ? "Variable Product"
                  : "Simple Product"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#171512] px-6 text-[10px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-[#292722] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-5 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* PRODUCT */}
          <ProductForm
            value={product}
            onChangeAction={
              setProduct
            }
            disabled={saving}
            hasVariants={
              hasVariants
            }
          />

          {/* VARIANTS */}
          <ProductVariants
            variants={variants}
            onChangeAction={
              setVariants
            }
            disabled={saving}
          />

          {/* IMAGES */}
          <ProductImages
            images={images}
            variants={variants}
            onChangeAction={
              setImages
            }
            disabled={saving}
          />

          {/* ACTIONS */}
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
                ? "Saving Changes..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}