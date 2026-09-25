import Image from "next/image";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#171512]">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#171512] via-[#171512] to-[#5f4b28]" />

      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#d4b56a]/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#a27d37]/10 blur-3xl" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-black/20">
          {/* Image layer — replace src when image is ready */}
          <div className="absolute inset-0">
            <Image
              src="/images/banners/final-cta.webp"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 1440px"
              className="object-cover opacity-35"
            />

            {/* Readability overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#171512] via-[#171512]/90 to-[#171512]/45" />

            {/* Mobile stronger overlay */}
            <div className="absolute inset-0 bg-[#171512]/35 sm:bg-transparent" />
          </div>

          {/* =================================================
              INNER CONTENT
          ================================================== */}

          <div className="relative z-10 flex min-h-[420px] items-center px-6 py-14 sm:px-10 sm:py-16 lg:min-h-[480px] lg:px-16 lg:py-20">
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[#d4b56a]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#d4b56a]">
                  Seven Bucks Nutrition
                </p>
              </div>

              {/* Heading */}
              <h2 className="font-serif text-[42px] leading-[0.96] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl lg:text-[68px]">
                Your next
                <br />
                <span className="italic text-[#d4b56a]">
                  stack starts here.
                </span>
              </h2>

              {/* Copy */}
              <p className="mt-5 max-w-lg text-[12px] leading-6 text-white/55 sm:text-[13px]">
                Protein, creatine, pre-workout and everyday
                sports nutrition from brands you already trust.
                Find what fits your routine and get it delivered
                to your door.
              </p>

              {/* CTA */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-white px-7 text-[9px] font-bold uppercase tracking-[0.2em] text-[#171512] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d4b56a]"
                >
                  Start Shopping

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/shop?category=protein"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-7 text-[9px] font-bold uppercase tracking-[0.2em] text-white/75 transition-all duration-300 hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
                >
                  Shop Protein
                </Link>
              </div>

              {/* Trust points */}
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4b56a]" />

                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/40">
                    40+ Brands
                  </span>
                </div>

                <span className="hidden h-3 w-px bg-white/10 sm:block" />

                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4b56a]" />

                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/40">
                    Secure Checkout
                  </span>
                </div>

                <span className="hidden h-3 w-px bg-white/10 sm:block" />

                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4b56a]" />

                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/40">
                    Tracked Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative corner */}
          <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-tl-full border-l border-t border-[#d4b56a]/10" />
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;