"use client";

import { useState } from "react";
import { toast } from "sonner";

export type ProductVariantFormData = {
  id?: string;

  flavor: string;
  size: string;
  servings: string;
  price: string;
  compareAt: string;

  stock: string;

  sku: string;
  available: boolean;
};

type ProductVariantsProps = {
  variants: ProductVariantFormData[];

  onChangeAction: (
    variants: ProductVariantFormData[]
  ) => void;

  disabled?: boolean;
};

const EMPTY_VARIANT: ProductVariantFormData = {
  flavor: "",
  size: "",
  servings: "",
  price: "",
  compareAt: "",
  stock: "0",
  sku: "",
  available: true,
};

function makeSku(
  variantId: string | undefined,
  flavor: string,
  size: string
): string {
  const clean = (input: string) =>
    input
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const flavorPart = clean(flavor);
  const sizePart = clean(size);

  const idPart = (
    variantId ?? crypto.randomUUID()
  )
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  return [
    "7B",
    sizePart || "VAR",
    flavorPart || "STD",
    idPart,
  ].join("-");
}

function createVariant(): ProductVariantFormData {
  const id = crypto.randomUUID();

  return {
    ...EMPTY_VARIANT,
    id,
    sku: makeSku(id, "", ""),
  };
}

function normalizeVariant(
  variant: ProductVariantFormData
): ProductVariantFormData {
  const id = variant.id;

  return {
    ...EMPTY_VARIANT,
    ...variant,

    id,

    flavor: variant.flavor ?? "",
    size: variant.size ?? "",
    servings: variant.servings ?? "",
    price: variant.price ?? "",
    compareAt: variant.compareAt ?? "",
    stock: variant.stock ?? "0",

    sku:
      variant.sku?.trim() ||
      makeSku(
        id,
        variant.flavor ?? "",
        variant.size ?? ""
      ),

    available: variant.available ?? true,
  };
}

export default function ProductVariants({
  variants,
  onChangeAction,
  disabled = false,
}: ProductVariantsProps) {
  const [expandedIndex, setExpandedIndex] =
    useState<number | null>(
      variants.length > 0 ? 0 : null
    );

  function addVariant() {
    if (disabled) return;

    const newVariant = createVariant();

    const nextVariants = [
      ...variants,
      newVariant,
    ];

    onChangeAction(nextVariants);

    setExpandedIndex(
      nextVariants.length - 1
    );
  }

  function removeVariant(index: number) {
    if (disabled) return;

    const nextVariants =
      variants.filter(
        (_, variantIndex) =>
          variantIndex !== index
      );

    onChangeAction(nextVariants);

    toast.success("Variant removed.");

    if (nextVariants.length === 0) {
      setExpandedIndex(null);
      return;
    }

    if (expandedIndex === index) {
      setExpandedIndex(
        Math.min(
          index,
          nextVariants.length - 1
        )
      );
    } else if (
      expandedIndex !== null &&
      expandedIndex > index
    ) {
      setExpandedIndex(
        expandedIndex - 1
      );
    }
  }

  function updateVariant(
    index: number,
    field: keyof ProductVariantFormData,
    fieldValue: string | boolean
  ) {
    if (disabled) return;

    const nextVariants =
      variants.map(
        (variant, variantIndex) => {
          const normalized =
            normalizeVariant(
              variant
            );

          if (
            variantIndex !== index
          ) {
            return normalized;
          }

          const nextVariant: ProductVariantFormData =
            {
              ...normalized,
              [field]: fieldValue,
            };

          // ------------------------------------------------
          // SKU
          // ------------------------------------------------
          //
          // New variants have frontend UUIDs.
          // Existing variants have DB UUIDs.
          //
          // Both are fine for generating a SKU.
          //
          // IMPORTANT:
          // We only regenerate when flavor/size changes.
          // ------------------------------------------------

          if (
            field === "flavor" ||
            field === "size"
          ) {
            nextVariant.sku =
              makeSku(
                nextVariant.id,
                nextVariant.flavor,
                nextVariant.size
              );
          }

          // ------------------------------------------------
          // STOCK
          // ------------------------------------------------

          if (field === "stock") {
            const cleanedStock =
              String(fieldValue).replace(
                /[^\d]/g,
                ""
              );

            nextVariant.stock =
              cleanedStock;
          }

          // ------------------------------------------------
          // SERVINGS
          // ------------------------------------------------

          if (field === "servings") {
            nextVariant.servings =
              String(fieldValue).replace(
                /[^\d]/g,
                ""
              );
          }

          return nextVariant;
        }
      );

    onChangeAction(nextVariants);
  }

  function duplicateVariant(
    index: number
  ) {
    if (disabled) return;

    const source =
      variants[index];

    if (!source) return;

    const normalizedSource =
      normalizeVariant(source);

    const duplicatedId =
      crypto.randomUUID();

    const duplicated: ProductVariantFormData =
      {
        ...normalizedSource,

        id: duplicatedId,

        sku: makeSku(
          duplicatedId,
          normalizedSource.flavor,
          normalizedSource.size
        ),
      };

    const nextVariants = [
      ...variants.slice(
        0,
        index + 1
      ),
      duplicated,
      ...variants.slice(
        index + 1
      ),
    ];

    onChangeAction(nextVariants);

    setExpandedIndex(index + 1);

    toast.success(
      "Variant duplicated."
    );
  }

  return (
    <section className="rounded-2xl border border-black/[0.07] bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-black/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
            Product Variants
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
            Sizes, flavours & pricing
          </h2>

          <p className="mt-1 text-[10px] leading-5 text-black/40">
            Add every purchasable combination of
            this product.
          </p>
        </div>

        <button
          type="button"
          onClick={addVariant}
          disabled={disabled}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#171512] px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#292722] disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Variant
        </button>
      </div>

      {/* Empty State */}
      {variants.length === 0 && (
        <div className="px-5 py-14 text-center sm:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f2eb]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v18" />
              <path d="M3 12h18" />
            </svg>
          </div>

          <h3 className="mt-4 text-sm font-semibold">
            No variants added
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-[10px] leading-5 text-black/40">
            Add at least one variant with its
            price, size and stock before
            publishing the product.
          </p>

          <button
            type="button"
            onClick={addVariant}
            disabled={disabled}
            className="mt-5 rounded-full border border-black/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] transition hover:bg-[#f5f2eb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add First Variant
          </button>
        </div>
      )}

      {/* Variants */}
      {variants.length > 0 && (
        <div className="divide-y divide-black/[0.07]">
          {variants.map(
            (variant, index) => {
              const safeVariant =
                normalizeVariant(
                  variant
                );

              const isExpanded =
                expandedIndex ===
                index;

              const stockNumber =
                Number(
                  safeVariant.stock
                );

              const hasStock =
                Number.isFinite(
                  stockNumber
                ) &&
                stockNumber > 0;

              return (
                <div
                  key={
                    variant.id ??
                    `variant-${index}`
                  }
                >
                  {/* Variant Header */}
                  <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIndex(
                          isExpanded
                            ? null
                            : index
                        )
                      }
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f2eb] text-[10px] font-bold">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {safeVariant.flavor ||
                            safeVariant.size ||
                            "New Variant"}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-black/40">
                          {[
                            safeVariant.size,
                            safeVariant.sku,

                            safeVariant.price
                              ? `₹${Number(
                                  safeVariant.price
                                ).toLocaleString(
                                  "en-IN"
                                )}`
                              : "",

                            `Stock: ${
                              Number.isFinite(
                                stockNumber
                              )
                                ? stockNumber
                                : 0
                            }`,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(" · ")}
                        </p>
                      </div>

                      <svg
                        className={`ml-auto shrink-0 transition-transform ${
                          isExpanded
                            ? "rotate-180"
                            : ""
                        }`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    <span
                      className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] sm:inline-flex ${
                        hasStock
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {hasStock
                        ? `${stockNumber} in stock`
                        : "Out of stock"}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        duplicateVariant(
                          index
                        )
                      }
                      disabled={disabled}
                      title="Duplicate variant"
                      className="hidden h-9 w-9 items-center justify-center rounded-xl border border-black/10 text-black/45 transition hover:bg-[#f5f2eb] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="8"
                          y="8"
                          width="12"
                          height="12"
                          rx="2"
                        />

                        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeVariant(
                          index
                        )
                      }
                      disabled={disabled}
                      title="Delete variant"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 15H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>

                  {/* Form */}
                  {isExpanded && (
                    <div className="border-t border-black/[0.05] bg-[#faf9f6] px-5 py-5 sm:px-6">
                      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {/* Flavor */}
                        <div>
                          <label
                            htmlFor={`variant-${index}-flavor`}
                            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                          >
                            Flavour
                          </label>

                          <input
                            id={`variant-${index}-flavor`}
                            type="text"
                            value={
                              safeVariant.flavor
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                "flavor",
                                event.target.value
                              )
                            }
                            placeholder="Double Rich Chocolate"
                            disabled={disabled}
                            className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>

                        {/* Size */}
                        <div>
                          <label
                            htmlFor={`variant-${index}-size`}
                            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                          >
                            Size
                          </label>

                          <input
                            id={`variant-${index}-size`}
                            type="text"
                            value={
                              safeVariant.size
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                "size",
                                event.target.value
                              )
                            }
                            placeholder="1 KG"
                            disabled={disabled}
                            className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>

                        {/* Servings */}
                        <div>
                          <label
                            htmlFor={`variant-${index}-servings`}
                            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                          >
                            Servings
                          </label>

                          <input
                            id={`variant-${index}-servings`}
                            type="number"
                            min="0"
                            step="1"
                            value={
                              safeVariant.servings
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                "servings",
                                event.target.value
                              )
                            }
                            placeholder="30"
                            disabled={disabled}
                            className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>

                        {/* Price */}
                        <div>
                          <label
                            htmlFor={`variant-${index}-price`}
                            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                          >
                            Selling Price
                          </label>

                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-black/40">
                              ₹
                            </span>

                            <input
                              id={`variant-${index}-price`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                safeVariant.price
                              }
                              onChange={(event) =>
                                updateVariant(
                                  index,
                                  "price",
                                  event.target.value
                                )
                              }
                              placeholder="5499"
                              disabled={disabled}
                              required
                              className="h-11 w-full rounded-xl border border-black/[0.1] bg-white pl-8 pr-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                        </div>

                        {/* Compare At */}
                        <div>
                          <label
                            htmlFor={`variant-${index}-compare-at`}
                            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                          >
                            Compare-at Price
                          </label>

                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-black/40">
                              ₹
                            </span>

                            <input
                              id={`variant-${index}-compare-at`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                safeVariant.compareAt
                              }
                              onChange={(event) =>
                                updateVariant(
                                  index,
                                  "compareAt",
                                  event.target.value
                                )
                              }
                              placeholder="6299"
                              disabled={disabled}
                              className="h-11 w-full rounded-xl border border-black/[0.1] bg-white pl-8 pr-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </div>
                        </div>

                        {/* Stock */}
                        <div>
                          <label
                            htmlFor={`variant-${index}-stock`}
                            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                          >
                            Stock Quantity
                          </label>

                          <input
                            id={`variant-${index}-stock`}
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={
                              safeVariant.stock
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                "stock",
                                event.target.value
                              )
                            }
                            placeholder="20"
                            disabled={disabled}
                            required
                            className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                          />

                          <p className="mt-2 text-[8px] leading-4 text-black/35">
                            Saved to inventory.stock_quantity
                            for this variant.
                          </p>
                        </div>

                        {/* SKU */}
                        <div className="md:col-span-2 lg:col-span-2">
                          <div className="flex min-h-11 items-center justify-between gap-4 rounded-xl border border-black/[0.08] bg-white px-3.5">
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                                SKU
                              </p>

                              <p className="mt-1 truncate font-mono text-[10px] text-black/55">
                                {safeVariant.sku ||
                                  "Generated automatically"}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-[#f5f2eb] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-black/40">
                              Auto
                            </span>
                          </div>
                        </div>

                        {/* Available */}
                        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-black/[0.1] bg-white px-3.5">
                          <input
                            type="checkbox"
                            checked={
                              safeVariant.available
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                "available",
                                event.target.checked
                              )
                            }
                            disabled={disabled}
                            className="h-4 w-4 accent-[#171512]"
                          />

                          <span>
                            <span className="block text-xs font-semibold">
                              Available
                            </span>

                            <span className="block text-[8px] text-black/35">
                              Customers can
                              purchase this
                              variant.
                            </span>
                          </span>
                        </label>
                      </div>

                      {/* Mobile Actions */}
                      <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4 sm:hidden">
                        <button
                          type="button"
                          onClick={() =>
                            duplicateVariant(
                              index
                            )
                          }
                          disabled={disabled}
                          className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45 hover:text-black disabled:opacity-40"
                        >
                          Duplicate variant
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeVariant(
                              index
                            )
                          }
                          disabled={disabled}
                          className="text-[9px] font-bold uppercase tracking-[0.12em] text-red-500 disabled:opacity-40"
                        >
                          Remove variant
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}

      {/* Footer */}
      {variants.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-black/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-[9px] text-black/40">
            {variants.length}{" "}
            {variants.length === 1
              ? "variant"
              : "variants"}{" "}
            added
          </p>

          <button
            type="button"
            onClick={addVariant}
            disabled={disabled}
            className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9c8250] hover:text-[#806b42] disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Add another variant
          </button>
        </div>
      )}
    </section>
  );
}