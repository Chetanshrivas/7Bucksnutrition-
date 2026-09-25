"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type {
  Product,
  ProductImage,
} from "../../lib/products";
import { normalizeSize } from "../../lib/products";
import { useCart } from "../cart/CartProvider";

interface ProductDetailProps {
  product: Product;
}

type ProductWithSimpleFields = Product & {
  stock?: number;
  sku?: string;
  isAvailable?: boolean;
};

export default function ProductDetail({
  product,
}: ProductDetailProps) {
  const { addItem } = useCart();

  const productWithSimpleFields =
    product as ProductWithSimpleFields;

  const hasVariants =
    product.variants.length > 0;

  const [selectedVariantId, setSelectedVariantId] =
    useState("");

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) {
      return undefined;
    }

    return product.variants.find(
      (variant) =>
        variant.id === selectedVariantId
    );
  }, [
    product.variants,
    selectedVariantId,
  ]);

  const allProductImages =
    product.productImages ?? [];

  const commonImages = useMemo(() => {
    return allProductImages
      .filter(
        (image) => image.variant_id === null
      )
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }

        return a.id.localeCompare(b.id);
      });
  }, [allProductImages]);

  const selectedVariantImages = useMemo(() => {
    if (!selectedVariant) {
      return [];
    }

    return allProductImages
      .filter(
        (image) =>
          image.variant_id ===
          selectedVariant.id
      )
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }

        return a.id.localeCompare(b.id);
      });
  }, [
    allProductImages,
    selectedVariant,
  ]);

  const otherVariantImages = useMemo(() => {
    return allProductImages
      .filter((image) => {
        if (image.variant_id === null) {
          return false;
        }

        if (!selectedVariant) {
          return true;
        }

        return (
          image.variant_id !==
          selectedVariant.id
        );
      })
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }

        return a.id.localeCompare(b.id);
      });
  }, [
    allProductImages,
    selectedVariant,
  ]);

  const galleryImages = useMemo(() => {
    const ordered: ProductImage[] = [];
    const seen = new Set<string>();

    const addImages = (
      images: ProductImage[]
    ) => {
      images.forEach((image) => {
        if (
          !image.image_url ||
          seen.has(image.id)
        ) {
          return;
        }

        seen.add(image.id);
        ordered.push(image);
      });
    };

    if (!selectedVariant) {
      addImages(commonImages);
      addImages(otherVariantImages);
    } else {
      addImages(selectedVariantImages);
      addImages(commonImages);
      addImages(otherVariantImages);
    }

    addImages(allProductImages);

    return ordered;
  }, [
    allProductImages,
    commonImages,
    selectedVariant,
    selectedVariantImages,
    otherVariantImages,
  ]);

  const commonPrimaryImage = useMemo(() => {
    return (
      commonImages.find(
        (image) => image.is_primary
      ) ?? commonImages[0]
    );
  }, [commonImages]);

  const variantPrimaryImage = useMemo(() => {
    if (!selectedVariant) {
      return undefined;
    }

    return (
      selectedVariantImages.find(
        (image) => image.is_primary
      ) ?? selectedVariantImages[0]
    );
  }, [
    selectedVariant,
    selectedVariantImages,
  ]);

  const fallbackImage = useMemo(() => {
    if (selectedVariant) {
      return (
        variantPrimaryImage?.image_url ??
        commonPrimaryImage?.image_url ??
        selectedVariantImages[0]?.image_url ??
        commonImages[0]?.image_url ??
        product.image ??
        galleryImages[0]?.image_url
      );
    }

    return (
      commonPrimaryImage?.image_url ??
      commonImages[0]?.image_url ??
      product.image ??
      galleryImages[0]?.image_url
    );
  }, [
    selectedVariant,
    variantPrimaryImage,
    commonPrimaryImage,
    selectedVariantImages,
    commonImages,
    product.image,
    galleryImages,
  ]);

  const currentGalleryImage =
    galleryImages[activeImage];

  const currentImage =
    currentGalleryImage?.image_url ??
    fallbackImage;

  const simpleStock = Math.max(
    0,
    Number(
      productWithSimpleFields.stock ?? 0
    )
  );

  const simpleAvailable =
    productWithSimpleFields.isAvailable ??
    simpleStock > 0;

  const availableStock = hasVariants
    ? selectedVariant?.stock ?? 0
    : simpleStock;

  const currentPrice = hasVariants
    ? selectedVariant?.price ?? product.price
    : product.price;

  const currentCompareAt = hasVariants
    ? selectedVariant?.compareAt
    : product.compareAt;

  const currentAvailable = hasVariants
    ? Boolean(
        selectedVariant?.available &&
          selectedVariant.stock > 0
      )
    : Boolean(
        simpleAvailable &&
          simpleStock > 0
      );

  const sizes = useMemo(() => {
    const values = product.variants
      .map((variant) => variant.size)
      .filter(Boolean) as string[];

    return Array.from(
      new Set(
        values.map((size) =>
          normalizeSize(size)
        )
      )
    );
  }, [product.variants]);

  const sizeGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        label: string;
        variants: typeof product.variants;
      }
    >();

    product.variants.forEach((variant) => {
      if (!variant.size) {
        return;
      }

      const key = normalizeSize(
        variant.size
      );

      if (!key) {
        return;
      }

      const existing = groups.get(key);

      if (existing) {
        existing.variants.push(variant);
      } else {
        groups.set(key, {
          label: variant.size.trim(),
          variants: [variant],
        });
      }
    });

    return Array.from(groups.values());
  }, [product.variants]);

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(
        Math.max(availableStock, 1),
        current + 1
      )
    );
  };

  const selectVariant = (
    variantId: string
  ) => {
    const variant = product.variants.find(
      (item) => item.id === variantId
    );

    if (!variant) {
      return;
    }

    setSelectedVariantId(variant.id);
    setQuantity(1);
    setActiveImage(0);
  };

  const goToPreviousImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }

    setActiveImage((current) =>
      current === 0
        ? galleryImages.length - 1
        : current - 1
    );
  };

  const goToNextImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }

    setActiveImage((current) =>
      current === galleryImages.length - 1
        ? 0
        : current + 1
    );
  };

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (galleryImages.length <= 1) {
      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (
      galleryImages.length <= 1 ||
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const deltaX =
      touch.clientX - touchStartX.current;

    const deltaY =
      touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    const horizontalSwipe =
      Math.abs(deltaX) > 50 &&
      Math.abs(deltaX) >
        Math.abs(deltaY) * 1.2;

    if (!horizontalSwipe) {
      return;
    }

    if (deltaX < 0) {
      goToNextImage();
    } else {
      goToPreviousImage();
    }
  };

  const handleTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const cartImage =
    variantPrimaryImage?.image_url ??
    commonPrimaryImage?.image_url ??
    selectedVariantImages[0]?.image_url ??
    commonImages[0]?.image_url ??
    selectedVariant?.image ??
    product.image ??
    product.images[0];

  const handleAddToBag = () => {
    if (!hasVariants) {
      if (
        !simpleAvailable ||
        simpleStock <= 0
      ) {
        toast.error(
          "This product is currently out of stock."
        );
        return;
      }

      addItem(
        {
          productSlug: product.slug,
          productName: product.name,
          brand: product.brand,

          variantId: product.id,
          isVariant: false,

          sku:
            productWithSimpleFields.sku ??
            "",
          price: product.price,
          compareAt: product.compareAt,

          image: cartImage,

          stock: simpleStock,
        },
        quantity
      );

      toast.success(
        `${product.name} added to your bag.`,
        {
          duration: 1000,
        }
      );

      return;
    }

    if (!selectedVariant) {
      toast.error(
        "Please select a variant."
      );
      return;
    }

    if (
      !selectedVariant.available ||
      selectedVariant.stock <= 0
    ) {
      toast.error(
        "This variant is currently out of stock."
      );
      return;
    }

    addItem(
      {
        productSlug: product.slug,
        productName: product.name,
        brand: product.brand,

        variantId: selectedVariant.id,
        isVariant: true,

        flavor: selectedVariant.flavor,
        size: selectedVariant.size,
        servings: selectedVariant.servings,

        sku: selectedVariant.sku,
        price: selectedVariant.price,
        compareAt: selectedVariant.compareAt,

        image: cartImage,

        stock: selectedVariant.stock,
      },
      quantity
    );

    toast.success(
      `${product.name} added to your bag.`,
      {
        duration: 1000,
      }
    );
  };

  const discount =
    currentCompareAt &&
    currentCompareAt > currentPrice
      ? Math.round(
          ((currentCompareAt -
            currentPrice) /
            currentCompareAt) *
            100
        )
      : null;

  return (
    <main className="min-h-screen bg-ivory text-espresso">
      <div className="mx-auto max-w-[1440px] px-5 pb-4 pt-28 sm:px-8 lg:px-12">
        <div className="flex gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-espresso/40">
          <Link
            href="/"
            className="transition hover:text-espresso"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/shop"
            className="transition hover:text-espresso"
          >
            Shop
          </Link>

          <span>/</span>

          <span className="max-w-[200px] truncate text-espresso/70">
            {product.name}
          </span>
        </div>
      </div>

      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:gap-14">
          <div>
            <div
              className="relative overflow-hidden rounded-3xl bg-white touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              <div className="aspect-square">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={
                      selectedVariant?.flavor
                        ? `${product.name} ${selectedVariant.flavor}`
                        : product.name
                    }
                    className="h-full w-full select-none object-contain"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-serif text-3xl italic text-espresso/25">
                      {product.brand}
                    </span>
                  </div>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/85 px-2.5 py-1.5 backdrop-blur-sm">
                  {galleryImages.map(
                    (image, index) => (
                      <span
                        key={`${image.id}-dot-${index}`}
                        className={`h-1.5 rounded-full transition-all ${
                          activeImage === index
                            ? "w-4 bg-espresso"
                            : "w-1.5 bg-espresso/25"
                        }`}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {galleryImages.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {galleryImages.map(
                  (image, index) => {
                    const isActive =
                      activeImage === index;

                    return (
                      <button
                        key={`${image.id}-${index}`}
                        type="button"
                        onClick={() =>
                          setActiveImage(index)
                        }
                        className={`relative aspect-square overflow-hidden rounded-xl border bg-white transition ${
                          isActive
                            ? "border-espresso"
                            : "border-border hover:border-espresso/40"
                        }`}
                      >
                        <img
                          src={image.image_url}
                          alt={
                            image.alt_text ||
                            `${product.name} image ${
                              index + 1
                            }`
                          }
                          className="h-full w-full object-contain"
                          draggable={false}
                        />

                        {image.variant_id ===
                          null && (
                          <span className="absolute bottom-1 left-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-[0.08em] text-espresso/50">
                            Common
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-clay">
              {product.brand}
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            <p className="mt-4 text-sm leading-6 text-espresso/55">
              {product.subtitle}
            </p>

            <div className="mt-5 text-xs text-espresso/60">
              <span className="text-gold">
                ★★★★★
              </span>{" "}
              {product.rating.toFixed(1)} (
              {product.reviews.toLocaleString(
                "en-IN"
              )}
              )
            </div>

            <div className="mt-7 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold">
                ₹
                {currentPrice.toLocaleString(
                  "en-IN"
                )}
              </span>

              {currentCompareAt &&
                currentCompareAt >
                  currentPrice && (
                  <>
                    <span className="text-sm text-espresso/35 line-through">
                      ₹
                      {currentCompareAt.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    {discount && (
                      <span className="rounded-full bg-clay px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-ivory">
                        {discount}% off
                      </span>
                    )}
                  </>
                )}
            </div>

            {hasVariants &&
              sizeGroups.length > 0 && (
                <div className="mt-8 border-t border-border pt-7">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Select Size
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {sizeGroups.map(
                      (sizeGroup) => {
                        const availableVariant =
                          sizeGroup.variants.find(
                            (variant) =>
                              variant.available
                          );

                        const isActive =
                          sizeGroup.variants.some(
                            (variant) =>
                              variant.id ===
                              selectedVariant?.id
                          );

                        return (
                          <button
                            key={normalizeSize(
                              sizeGroup.label
                            )}
                            type="button"
                            disabled={
                              !availableVariant
                            }
                            onClick={() => {
                              if (
                                availableVariant
                              ) {
                                selectVariant(
                                  availableVariant.id
                                );
                              }
                            }}
                            className={`rounded-xl border px-4 py-3 text-left transition ${
                              isActive
                                ? "border-espresso bg-espresso text-ivory"
                                : "border-border bg-card hover:border-espresso/40"
                            } ${
                              !availableVariant
                                ? "cursor-not-allowed opacity-35"
                                : ""
                            }`}
                          >
                            <p className="text-sm font-semibold">
                              {
                                sizeGroup.label
                              }
                            </p>

                            <p className="mt-1 text-[9px] uppercase tracking-[0.1em] opacity-60">
                              {sizeGroup.variants.length >
                              1
                                ? `${sizeGroup.variants.length} options`
                                : availableVariant
                                  ? "Available"
                                  : "Out of stock"}
                            </p>
                          </button>
                        );
                      }
                    )}
                  </div>

                  {selectedVariant?.size && (
                    <div className="mt-4 grid gap-2">
                      {product.variants
                        .filter(
                          (variant) =>
                            normalizeSize(
                              variant.size
                            ) ===
                            normalizeSize(
                              selectedVariant.size
                            )
                        )
                        .map((variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            disabled={
                              !variant.available
                            }
                            onClick={() =>
                              selectVariant(
                                variant.id
                              )
                            }
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                              variant.id ===
                              selectedVariant.id
                                ? "border-espresso bg-espresso text-ivory"
                                : "border-border bg-card hover:border-espresso/40"
                            } ${
                              !variant.available
                                ? "cursor-not-allowed opacity-35"
                                : ""
                            }`}
                          >
                            <div>
                              <p className="text-xs font-semibold">
                                {variant.flavor ??
                                  "Standard"}
                              </p>

                              {variant.servings && (
                                <p className="mt-1 text-[9px] uppercase tracking-[0.1em] opacity-60">
                                  {
                                    variant.servings
                                  }{" "}
                                  Servings
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-bold">
                                ₹
                                {variant.price.toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                              <p className="mt-1 text-[9px] uppercase tracking-[0.1em] opacity-60">
                                {variant.available
                                  ? `${variant.stock} in stock`
                                  : "Out of stock"}
                              </p>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

            {!hasVariants && (
              <div className="mt-7 border-t border-border pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-espresso/40">
                  {simpleStock > 0
                    ? `${simpleStock} units available`
                    : "Currently unavailable"}
                </p>
              </div>
            )}

            <div className="mt-7 flex gap-3">
              <div className="flex h-14 items-center rounded-xl border border-border bg-card">
                <button
                  type="button"
                  onClick={
                    decreaseQuantity
                  }
                  disabled={
                    quantity <= 1
                  }
                  className="flex h-full w-12 items-center justify-center text-lg transition hover:bg-sand disabled:opacity-30"
                >
                  −
                </button>

                <span className="w-8 text-center text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={
                    increaseQuantity
                  }
                  disabled={
                    !currentAvailable ||
                    availableStock <=
                      quantity
                  }
                  className="flex h-full w-12 items-center justify-center text-lg transition hover:bg-sand disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={
                  handleAddToBag
                }
                disabled={
                  hasVariants
                    ? !selectedVariant ||
                      !currentAvailable
                    : !currentAvailable
                }
                className="h-14 flex-1 rounded-xl bg-espresso px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {hasVariants &&
                !selectedVariant
                  ? "Choose Variant"
                  : currentAvailable
                    ? "Add to Bag"
                    : "Out of Stock"}
              </button>
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-espresso/40">
              {hasVariants
                ? selectedVariant
                  ? currentAvailable
                    ? `${availableStock} units available`
                    : "Currently unavailable"
                  : "Select a variant"
                : currentAvailable
                  ? `${availableStock} units available`
                  : "Currently unavailable"}
            </p>

            <div className="mt-9 border-t border-border pt-7">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]">
                Product Details
              </p>

              <p className="text-sm leading-7 text-espresso/60">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}