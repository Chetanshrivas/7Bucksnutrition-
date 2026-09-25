"use client";

import Link from "next/link";

const GOALS = [
  {
    number: "01",
    eyebrow: "MUSCLE & STRENGTH",
    title: "Build Muscle",
    description:
      "Protein, creatine and performance essentials for supporting strength and muscle growth.",
    href: "/shop?goal=build-muscle",
    products: "Protein · Creatine · Gainers",
  },
  {
    number: "02",
    eyebrow: "LEAN NUTRITION",
    title: "Lean & Fit",
    description:
      "Smart protein and everyday nutrition for staying active, strong and on track.",
    href: "/shop?goal=lean-fit",
    products: "Whey · Isolate · Fit Foods",
  },
  {
    number: "03",
    eyebrow: "TRAIN HARDER",
    title: "Performance",
    description:
      "Pre-workout, creatine and training essentials built around better workout performance.",
    href: "/shop?goal=performance",
    products: "Pre-Workout · Creatine · Recovery",
  },
  {
    number: "04",
    eyebrow: "EVERYDAY WELLNESS",
    title: "Daily Wellness",
    description:
      "Simple nutrition essentials for filling everyday gaps and supporting an active lifestyle.",
    href: "/shop?goal=daily-wellness",
    products: "Vitamins · Omega 3 · Essentials",
  },
];

export function ShopByGoal() {
  return (
    <section className="relative overflow-hidden bg-[#171512]">
      {/* Subtle background details */}
      <div className="pointer-events-none absolute -right-40 top-[-120px] h-96 w-96 rounded-full bg-[#a27d37]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-[-160px] h-96 w-96 rounded-full bg-white/[0.025] blur-3xl" />

      {/* Very subtle texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-7 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#d4b56a]" />

              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#d4b56a]">
                Shop By Goal
              </p>
            </div>

            <h2 className="mt-4 font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
              Shop for what
              <br />
              <span className="italic text-[#d4b56a]">
                you&apos;re working towards.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-[12px] leading-6 text-white/45 sm:text-[13px]">
              Start with your goal and discover the protein,
              performance and nutrition products that fit your
              routine.
            </p>
          </div>

          <Link
            href="/shop"
            className="group inline-flex w-fit shrink-0 items-center gap-3 rounded-full border border-white/15 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/75 transition-all duration-300 hover:border-[#d4b56a]/50 hover:bg-[#d4b56a] hover:text-[#171512]"
          >
            Shop All Products
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* =====================================================
            GOAL GRID
        ====================================================== */}

        <div className="mt-9 grid gap-3 sm:mt-11 sm:grid-cols-2 lg:grid-cols-4">
          {GOALS.map((goal) => (
            <Link
              key={goal.number}
              href={goal.href}
              className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.055] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#d4b56a]/25 hover:bg-white/[0.075] hover:shadow-[0_25px_60px_rgba(0,0,0,0.22)] sm:min-h-[305px] sm:p-7"
            >
              {/* Card glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#a27d37]/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />

              {/* Number + arrow */}
              <div className="relative flex items-center justify-between">
                <span className="font-serif text-sm italic text-[#d4b56a]">
                  {goal.number}
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-sm text-white/45 transition-all duration-300 group-hover:border-[#d4b56a]/40 group-hover:bg-[#d4b56a] group-hover:text-[#171512]">
                  →
                </span>
              </div>

              {/* Main content */}
              <div className="relative mt-auto pt-12">
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#d4b56a]">
                  {goal.eyebrow}
                </p>

                <h3 className="mt-2 font-serif text-[29px] leading-none tracking-[-0.03em] text-white sm:text-[31px]">
                  {goal.title}
                </h3>

                <p className="mt-3 max-w-[270px] text-[11px] leading-5 text-white/40">
                  {goal.description}
                </p>
              </div>

              {/* Product categories */}
              <div className="relative mt-5 border-t border-white/[0.08] pt-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/30">
                    Shop
                  </span>

                  <span className="text-right text-[8px] font-semibold uppercase tracking-[0.08em] text-white/50">
                    {goal.products}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* =====================================================
            BOTTOM GUIDANCE STRIP
        ====================================================== */}

        <div className="mt-3 rounded-[24px] border border-white/[0.07] bg-white/[0.035] px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d4b56a]/20 bg-[#d4b56a]/[0.06]">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#d4b56a]"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 10v6" />
                  <path d="M12 7h.01" />
                </svg>
              </div>

              <p className="text-[10px] leading-5 text-white/40">
                Not sure which products fit your goal?
                <span className="text-white/65">
                  {" "}
                  Browse the full collection and compare.
                </span>
              </p>
            </div>

            <Link
              href="/shop"
              className="group inline-flex shrink-0 items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[#d4b56a] transition-colors hover:text-white"
            >
              Explore Collection
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopByGoal;