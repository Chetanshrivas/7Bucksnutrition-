"use client";

import Link from "next/link";
import { toast } from "sonner";
import type { Product } from "../../lib/products";
import { AutoCycleImage } from "./AutoCycleImage";
import { useCart } from "../cart/CartProvider";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const hasVariants = product.hasVariants;

  const variant = hasVariants
    ? product.variants.find((item) => item.available) ?? product.variants[0]
    : undefined;

  const price = hasVariants ? variant?.price ?? product.price : product.price;
  const compareAt = hasVariants ? variant?.compareAt ?? product.compareAt : product.compareAt;
  const stock = hasVariants ? variant?.stock ?? 0 : product.stock;
  const available = hasVariants
    ? Boolean(variant?.available) && stock > 0
    : Boolean(product.available) && stock > 0;

  const baseImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const galleryImages = variant?.image
    ? [variant.image, ...baseImages.filter((img) => img !== variant.image)]
    : baseImages;

  const discount =
    compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : null;

  const sizes = hasVariants
    ? Array.from(
        new Set(
          product.variants.map((item) => item.size).filter((size): size is string => Boolean(size))
        )
      )
    : [];

  const handleAddToCart = () => {
    if (hasVariants) return;

    if (!available || stock <= 0) {
      toast.error("Out of Stock", {
        description: `${product.name} is currently unavailable.`,
        duration: 1500,
      });
      return;
    }

    addItem({
      productSlug: product.slug,
      productName: product.name,
      brand: product.brand,
      variantId: product.id,
      isVariant: false,
      sku: product.sku ?? "",
      price,
      compareAt,
      image: product.image,
      stock,
    });

    toast.success("Added to Cart", {
      description: `${product.name} has been added to your cart.`,
      duration: 1500,
    });
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#211710]/[0.065] bg-white shadow-[0_6px_24px_rgba(36,26,20,0.04)] transition-all duration-500 hover:-translate-y-1 hover:border-[#211710]/[0.1] hover:shadow-[0_18px_45px_rgba(36,26,20,0.09)]">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-white">
          <div className="pointer-events-none absolute inset-2.5 rounded-[17px] border border-[#211710]/[0.035] sm:inset-3" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#faf9f6] blur-2xl" />

          <div className="relative flex h-full w-full items-center justify-center p-6 sm:p-8 lg:p-9">
            <div className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04] [&_img]:!h-full [&_img]:!w-full [&_img]:!object-contain">
              <AutoCycleImage images={galleryImages} alt={product.name} />
            </div>
          </div>

          {discount !== null && discount > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#211710] px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-[0.11em] text-[#f5f1e8] shadow-[0_5px_16px_rgba(0,0,0,0.12)] sm:left-4 sm:top-4">
              {discount}% Off
            </span>
          )}

          {!available && (
            <span className="absolute right-3 top-3 z-10 rounded-full border border-[#211710]/[0.07] bg-white/90 px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-[0.1em] text-[#211710]/50 shadow-sm backdrop-blur-md sm:right-4 sm:top-4">
              Out of Stock
            </span>
          )}

          {galleryImages.length > 1 && (
            <span className="absolute bottom-3 right-3 z-10 hidden rounded-full border border-[#211710]/[0.06] bg-white/85 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-[#211710]/40 backdrop-blur-md sm:block">
              +{galleryImages.length - 1} Photos
            </span>
          )}
        </div>

        <div className="h-px w-full bg-[#211710]/[0.05]" />

        <div className="px-3.5 pb-3.5 pt-3.5 sm:px-5 sm:pb-4 sm:pt-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#9a7b3f] sm:text-[9px]">
            {product.brand}
          </p>

          <h3 className="mt-1 line-clamp-2 text-[12px] font-semibold leading-[1.3] tracking-[-0.012em] text-[#211710] sm:text-[14px]">
            {product.name}
          </h3>

          {product.subtitle && (
            <p className="mt-1 line-clamp-1 text-[9px] leading-4 text-[#211710]/38 sm:text-[10px]">
              {product.subtitle}
            </p>
          )}

          <div className="mt-2.5 flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-full border border-[#211710]/[0.05] bg-[#f6f3ec] px-1.5 py-1">
              <span className="text-[8px] text-[#9a7b3f]">★</span>
              <span className="text-[8px] font-semibold text-[#211710]/65">
                {product.rating.toFixed(1)}
              </span>
            </div>

            <span className="text-[8px] text-[#211710]/30">
              {product.reviews.toLocaleString("en-IN")} reviews
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-[15px] font-bold tracking-[-0.025em] text-[#211710] sm:text-[17px]">
              ₹{price.toLocaleString("en-IN")}
            </span>

            {compareAt && compareAt > price && (
              <span className="text-[9px] text-[#211710]/30 line-through sm:text-[10px]">
                ₹{compareAt.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {sizes.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="rounded-full border border-[#211710]/[0.065] bg-[#faf9f6] px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.05em] text-[#211710]/45"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="mt-auto px-3.5 pb-3.5 sm:px-5 sm:pb-4">
        {hasVariants ? (
          <Link
            href={`/product/${product.slug}`}
            className="group/btn flex h-9 w-full items-center justify-center gap-2 rounded-full bg-[#211710] text-[8px] font-bold uppercase tracking-[0.17em] text-[#f5f1e8] shadow-[0_6px_18px_rgba(33,23,16,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9a7b3f] hover:shadow-[0_10px_25px_rgba(154,123,63,0.18)] sm:h-10"
          >
            <span>Choose Options</span>
            <span className="text-xs transition-transform duration-300 group-hover/btn:translate-x-1">
              →
            </span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!available}
            className="group/btn flex h-9 w-full items-center justify-center gap-2 rounded-full bg-[#211710] text-[8px] font-bold uppercase tracking-[0.17em] text-[#f5f1e8] shadow-[0_6px_18px_rgba(33,23,16,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#9a7b3f] hover:shadow-[0_10px_25px_rgba(154,123,63,0.18)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:bg-[#211710] disabled:hover:shadow-none sm:h-10"
          >
            {available ? (
              <>
                <span>Add to Cart</span>
                <span className="text-xs transition-transform duration-300 group-hover/btn:translate-x-1">
                  →
                </span>
              </>
            ) : (
              <span>Out of Stock</span>
            )}
          </button>
        )}
      </div>
    </article>
  );
}