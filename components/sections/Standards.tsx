import Link from "next/link";

const STANDARDS = [
  {
    number: "01",
    eyebrow: "AUTHENTIC PRODUCTS",
    title: "Original products.",
    highlight: "No guesswork.",
    copy: "Shop protein, creatine, pre-workout, vitamins and more from recognised nutrition brands — with product details clearly shown before you buy.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
      >
        <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    number: "02",
    eyebrow: "CLEAR INFORMATION",
    title: "Know what",
    highlight: "you're buying.",
    copy: "Protein quantity, serving size, flavour, pack size and pricing are kept easy to find so you can compare products without the confusion.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
      >
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
      </svg>
    ),
  },
  {
    number: "03",
    eyebrow: "BUILT AROUND YOUR GOAL",
    title: "The right nutrition",
    highlight: "for your routine.",
    copy: "From daily whey protein to creatine, pre-workout and wellness essentials, find products based on what you actually want to achieve.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-7 w-7"
      >
        <path d="M6 20V10" />
        <path d="M12 20V4" />
        <path d="M18 20v-7" />
        <path d="M4 20h16" />
      </svg>
    ),
  },
];

export function Standards() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* =====================================================
          BACKGROUND DETAIL
      ====================================================== */}

      <div className="pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-clay/[0.07] blur-3xl" />

      <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-gold/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-clay" />

              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-clay">
                Why Seven Bucks
              </span>
            </div>

            <h2 className="font-serif text-4xl leading-[1.02] tracking-[-0.035em] text-espresso sm:text-5xl lg:text-6xl">
              Nutrition shopping,
              <br />
              <span className="italic text-clay">
                without the confusion.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-espresso/55 sm:text-[15px]">
              Whether you&apos;re looking for whey protein, creatine,
              pre-workout or everyday wellness essentials, we keep the
              important details clear — so choosing your nutrition feels
              simple.
            </p>
          </div>

          {/* Small visual marker */}
          <div className="hidden shrink-0 items-center gap-4 lg:flex">
            <div className="h-px w-14 bg-border" />

            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-espresso/35">
              Our standards
            </span>
          </div>
        </div>

        {/* =================================================
            STANDARD CARDS
        ================================================= */}

        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-16">
          {STANDARDS.map((standard) => (
            <article
              key={standard.number}
              className="group relative overflow-hidden rounded-[28px] border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-8"
            >
              {/* Card glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-clay/[0.07] blur-3xl transition duration-500 group-hover:bg-clay/[0.12]" />

              {/* Number */}
              <div className="relative flex items-start justify-between">
                <span className="font-serif text-5xl leading-none tracking-[-0.05em] text-espresso/[0.08]">
                  {standard.number}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-clay/15 bg-clay/[0.06] text-clay transition duration-300 group-hover:scale-105 group-hover:bg-clay/[0.10]">
                  {standard.icon}
                </div>
              </div>

              {/* Content */}
              <div className="relative mt-12">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-clay">
                  {standard.eyebrow}
                </p>

                <h3 className="mt-3 text-xl font-semibold leading-[1.15] tracking-[-0.025em] text-espresso sm:text-[22px]">
                  {standard.title}
                  <br />
                  <span className="font-serif italic font-normal text-clay">
                    {standard.highlight}
                  </span>
                </h3>

                <p className="mt-4 text-sm leading-6 text-espresso/55">
                  {standard.copy}
                </p>
              </div>

              {/* Bottom line */}
              <div className="relative mt-8 h-px w-full overflow-hidden bg-border">
                <div className="h-full w-0 bg-clay transition-all duration-500 group-hover:w-full" />
              </div>
            </article>
          ))}
        </div>

        {/* =================================================
            PRODUCT-FOCUSED DARK BAND
        ================================================= */}

        <div className="relative mt-5 overflow-hidden rounded-[28px] bg-espresso">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full border border-ivory/[0.06]" />

          <div className="pointer-events-none absolute -right-4 -top-16 h-48 w-48 rounded-full border border-ivory/[0.05]" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-clay/[0.08] blur-3xl" />

          <div className="relative flex flex-col gap-8 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:p-10">
            {/* Left */}
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />

                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-gold">
                  Your nutrition, your choice
                </span>
              </div>

              <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.025em] text-ivory sm:text-3xl">
                From your first scoop
                <br className="hidden sm:block" />
                <span className="font-serif italic font-normal text-gold">
                  to your next goal.
                </span>
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-ivory/55">
                Explore our range of protein powders, creatine, pre-workouts,
                vitamins, omega-3 and fitness essentials — all in one place.
              </p>
            </div>

            {/* Right */}
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-espresso transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory"
              >
                Explore Nutrition
                <span className="ml-3 text-sm">→</span>
              </Link>

              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-full border border-ivory/15 px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-ivory/80 transition-all duration-300 hover:border-ivory/30 hover:bg-ivory/[0.06] hover:text-ivory"
              >
                Shop Protein
              </Link>
            </div>
          </div>
        </div>

        {/* =================================================
            MINI TRUST ROW
        ================================================= */}

        <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-[24px] border border-border bg-card sm:grid-cols-4">
          {[
            {
              value: "PROTEIN",
              label: "Whey · Isolate · Plant",
            },
            {
              value: "PERFORMANCE",
              label: "Creatine · Pre-workout",
            },
            {
              value: "WELLNESS",
              label: "Vitamins · Omega 3",
            },
            {
              value: "EVERYDAY",
              label: "Nutrition · Fit Foods",
            },
          ].map((item, index) => (
            <div
              key={item.value}
              className={`px-4 py-5 text-center sm:px-5 sm:py-6 ${
                index !== 0 ? "border-l border-border" : ""
              } ${
                index === 2
                  ? "border-t border-border sm:border-t-0"
                  : ""
              } ${
                index === 3
                  ? "border-t border-border sm:border-t-0"
                  : ""
              }`}
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-espresso">
                {item.value}
              </p>

              <p className="mt-1.5 text-[10px] leading-4 text-espresso/40">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Standards;