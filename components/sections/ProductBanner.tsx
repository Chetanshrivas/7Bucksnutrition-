"use client";

import Link from "next/link";

export function ProductBanner() {
  return (
    <section className="px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-[1440px]">
        <div className="relative min-h-[390px] overflow-hidden rounded-[30px] bg-[#171512] sm:min-h-[410px] lg:min-h-[430px]">
          {/* Background details */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#a27d37]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-[#a27d37]/10 blur-3xl" />

          {/* Subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          <div className="relative grid h-full min-h-[390px] lg:min-h-[430px] lg:grid-cols-[0.9fr_1.1fr]">
            {/* =================================================
                LEFT — COPY
            ================================================== */}

            <div className="relative z-20 flex flex-col justify-center px-7 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              {/* Eyebrow */}
              <div className="flex items-center gap-3">
                <span className="h-px w-7 bg-[#d4b56a]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#d4b56a]">
                  Protein Collection
                </p>
              </div>

              {/* Heading */}
              <h2 className="mt-5 max-w-xl font-serif text-[38px] leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-[58px]">
                The right protein
                <br />
                <span className="italic text-[#d4b56a]">
                  for your routine.
                </span>
              </h2>

              {/* Description */}
              <p className="mt-5 max-w-md text-[12px] leading-6 text-white/50 sm:text-[13px]">
                Whey, isolate, plant protein and gainers from
                trusted sports-nutrition brands — all in one
                place.
              </p>

              {/* CTA */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/shop?category=protein"
                  className="group inline-flex h-11 items-center justify-center gap-3 rounded-full bg-white px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#171512] transition-all duration-300 hover:bg-[#d4b56a]"
                >
                  Shop Protein
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/shop"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/70 transition-all duration-300 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
                >
                  View All
                </Link>
              </div>

              {/* Bottom trust line */}
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4b56a]" />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/40">
                    40+ Brands
                  </span>
                </div>

                <span className="h-3 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4b56a]" />
                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/40">
                    Protein Focused
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT — PRODUCT IMAGE AREA
            ================================================== */}

            <div className="relative min-h-[220px] lg:min-h-0">
              {/* Product-stage glow */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4b56a]/10 blur-3xl sm:h-80 sm:w-80" />

              {/* 
                =================================================
                IMAGE PLACEHOLDER

                Replace this src later with your generated image.

                Recommended:
                /images/banners/protein-collection.webp
                =================================================
              */}

              <div className="absolute inset-0 flex items-center justify-center px-8 pb-8 pt-2 sm:px-12 sm:pb-10 lg:px-8 lg:py-8">
                <img
                  src="/images/banners/protein-collection.webp"
                  alt="Protein collection"
                  className="relative z-10 h-full max-h-[310px] w-full object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.38)] sm:max-h-[350px] lg:max-h-[390px]"
                />
              </div>

              {/* Floating label */}
              <div className="absolute bottom-5 right-5 z-20 hidden rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-md sm:block lg:bottom-7 lg:right-8">
                <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-white/55">
                  Explore Protein
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductBanner;