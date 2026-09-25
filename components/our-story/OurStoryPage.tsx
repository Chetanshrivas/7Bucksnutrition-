"use client";

import Link from "next/link";

/* =========================================================
   ICONS
========================================================= */

function ArrowRight() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}

function BarcodeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 5v14" />
      <path d="M7 5v14" />
      <path d="M10 5v14" />
      <path d="M13 5v14" />
      <path d="M17 5v14" />
      <path d="M20 5v14" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 7 8-4 8 4" />
      <path d="m4 7 8 4 8-4" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

/* =========================================================
   DATA
========================================================= */

const standards = [
  {
    number: "01",
    title: "Original Products",
    description:
      "We focus on genuine products from trusted supplement brands. No questionable stock, no unnecessary uncertainty — just products you can purchase with confidence.",
  },
  {
    number: "02",
    title: "Verify Before You Trust",
    description:
      "Product authenticity matters. Use the barcode and available product information to verify your supplement and know exactly what you are buying.",
  },
  {
    number: "03",
    title: "Complete Supplement Range",
    description:
      "From protein and creatine to mass gainers, recovery, weight management, vitamins and more — we bring your everyday nutrition needs together in one place.",
  },
  {
    number: "04",
    title: "Customer-First Support",
    description:
      "If something isn't right with your purchase, bring the product back to our store. We'll review the issue and help you with a replacement.",
  },
];

const values = [
  "Genuine products from trusted brands",
  "Barcode-based product verification",
  "A complete range of sports nutrition",
  "Support that puts customers first",
];

const offerings = [
  {
    number: "01",
    title: "Protein",
    description:
      "Whey, plant and other protein options to support your daily protein needs.",
  },
  {
    number: "02",
    title: "Mass Gainers",
    description:
      "Nutrition products designed for people focused on calorie intake and weight gain.",
  },
  {
    number: "03",
    title: "Creatine",
    description:
      "Popular performance-focused supplements for strength and training routines.",
  },
  {
    number: "04",
    title: "Recovery",
    description:
      "Products designed to complement your training and recovery routine.",
  },
  {
    number: "05",
    title: "Weight Management",
    description:
      "Supplement options for people working toward weight-focused nutrition goals.",
  },
  {
    number: "06",
    title: "Vitamins & Wellness",
    description:
      "Everyday nutritional support including vitamins and wellness-focused supplements.",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function OurStoryPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f2eb] text-[#171512]">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative border-b border-black/[0.08] px-5 pb-10 pt-24 sm:px-8 sm:pb-14 sm:pt-28 lg:px-12 lg:pb-16 lg:pt-32">
        <div className="mx-auto max-w-[1440px]">

          {/* Breadcrumb */}

          <div className="mb-7 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-black/35 sm:mb-9">
            <Link
              href="/"
              className="transition-colors hover:text-black"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-black/70">
              Our Story
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">

            {/* Left */}

            <div>
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a27d37]" />

                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a27d37]">
                  Seven Bucks Nutrition
                </p>
              </div>

              <h1 className="max-w-[1050px] text-[clamp(40px,8vw,118px)] font-semibold leading-[0.9] tracking-[-0.065em]">
                Nutrition
                <br />

                <span className="font-serif italic text-[#a27d37]">
                  you can trust.
                </span>
              </h1>
            </div>

            {/* Right */}

            <div className="max-w-[430px] lg:ml-auto lg:pb-2">

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#a27d37]/25 bg-[#a27d37]/10 text-[#a27d37]">
                <ShieldIcon />
              </div>

              <p className="text-[14px] leading-6 text-black/55 sm:text-[15px] sm:leading-7">
                From protein and creatine to mass gainers, recovery,
                weight management, vitamins and more — we bring together
                genuine supplements from trusted brands, so you can shop
                with confidence.
              </p>

              <Link
                href="/shop"
                className="mt-5 inline-flex items-center gap-3 rounded-full bg-[#171512] px-6 py-3.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black"
              >
                Explore Products
                <ArrowRight />
              </Link>
            </div>
          </div>

          {/* Decorative line */}

          <div className="mt-10 flex items-center gap-4 sm:mt-12 lg:mt-14">
            <span className="h-px flex-1 bg-black/10" />

            <span className="font-serif text-xs italic text-black/25">
              Real products. Real brands. Real confidence.
            </span>

            <span className="h-px w-16 bg-black/10 sm:w-28" />
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO / STORY
      ===================================================== */}

      <section className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-18">
        <div className="mx-auto max-w-[1440px]">

          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">

            {/* Label */}

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#a27d37]">
                Why Seven Bucks
              </p>

              <div className="mt-3.5 h-px w-16 bg-[#a27d37]/50" />

              <p className="mt-3.5 max-w-[270px] text-[11px] leading-5 text-black/35">
                Everything you need for your nutrition journey, from
                trusted brands and genuine products to confidence in every
                purchase.
              </p>
            </div>

            {/* Story */}

            <div>

              <h2 className="max-w-[900px] text-[clamp(28px,5vw,64px)] font-semibold leading-[1] tracking-[-0.05em]">
                Your health deserves
                <span className="font-serif italic text-[#a27d37]">
                  {" "}the real thing.
                </span>
              </h2>

              <div className="mt-6 grid gap-5 text-[13px] leading-6 text-black/50 sm:grid-cols-2 sm:gap-8 sm:leading-7">

                <p>
                  Supplements are something you put into your body.
                  That's why authenticity isn't just a promise for us —
                  it's a standard. Seven Bucks Nutrition is built around
                  genuine products, trusted brands and a straightforward
                  shopping experience.
                </p>

                <p>
                  Whether you're building muscle, gaining weight, improving
                  recovery, managing your weight or supporting your daily
                  nutrition, our goal is simple: make it easier to find
                  the products you need while giving you confidence in
                  what you're buying.
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST / AUTHENTICITY PANEL
      ===================================================== */}

      <section className="px-5 pb-10 sm:px-8 sm:pb-14 lg:px-12 lg:pb-18">
        <div className="mx-auto max-w-[1440px]">

          <div className="relative overflow-hidden rounded-[24px] bg-[#171512] px-5 py-10 text-white sm:rounded-[28px] sm:px-8 sm:py-12 lg:px-12 lg:py-14">

            {/* Decorative circles */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/[0.07]" />

            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-[#a27d37]/20" />

            <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full border border-white/[0.05]" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">

              <div>

                <div className="flex items-center gap-3">

                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b89552]/25 bg-[#b89552]/10 text-[#b89552]">
                    <BarcodeIcon />
                  </span>

                  <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#b89552]">
                    Authenticity matters
                  </p>

                </div>

                <h2 className="mt-4 max-w-[850px] text-[clamp(28px,5vw,68px)] font-semibold leading-[1] tracking-[-0.05em]">
                  Don't just trust us.
                  <br />

                  <span className="font-serif italic text-[#b89552]">
                    Verify it yourself.
                  </span>
                </h2>
              </div>

              <p className="max-w-[420px] text-[13px] leading-6 text-white/45 lg:ml-auto">
                We believe you should have confidence in every supplement
                you purchase. That's why product barcodes and authenticity
                information give you a way to check what you're buying.
                Scan it. Check it. Know what you're getting.
              </p>

            </div>

            {/* Trust cards */}

            <div className="relative mt-8 grid gap-3 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 sm:p-5">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#b89552]/10 text-[#b89552]">
                  <ShieldIcon />
                </div>

                <h3 className="text-[14px] font-semibold">
                  Genuine Products
                </h3>

                <p className="mt-2 text-[11px] leading-5 text-white/35">
                  Original products from trusted supplement brands.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 sm:p-5">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#b89552]/10 text-[#b89552]">
                  <BarcodeIcon />
                </div>

                <h3 className="text-[14px] font-semibold">
                  Barcode Verification
                </h3>

                <p className="mt-2 text-[11px] leading-5 text-white/35">
                  Check the barcode and product information for added
                  confidence.
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 sm:p-5">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#b89552]/10 text-[#b89552]">
                  <CheckIcon />
                </div>

                <h3 className="text-[14px] font-semibold">
                  Confidence in Every Purchase
                </h3>

                <p className="mt-2 text-[11px] leading-5 text-white/35">
                  Because your nutrition deserves products you can feel
                  confident about.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          REPLACEMENT PROMISE
      ===================================================== */}

      <section className="px-5 pb-10 sm:px-8 sm:pb-14 lg:px-12 lg:pb-18">
        <div className="mx-auto max-w-[1440px]">

          <div className="grid overflow-hidden rounded-[24px] border border-black/[0.08] bg-[#e9e4d9] sm:rounded-[28px] lg:grid-cols-[0.8fr_1.2fr]">

            {/* Left */}

            <div className="relative min-h-[220px] overflow-hidden bg-[#171512] p-6 text-white sm:p-8 lg:p-11">

              <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full border border-[#a27d37]/20" />

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b89552]/25 bg-[#b89552]/10 text-[#b89552]">
                  <BoxIcon />
                </div>

                <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.25em] text-[#b89552]">
                  Our commitment
                </p>

                <h3 className="mt-3 max-w-[430px] text-[clamp(26px,4vw,50px)] font-semibold leading-[1] tracking-[-0.045em]">
                  Your trust
                  <br />
                  comes first.
                </h3>

              </div>
            </div>

            {/* Right */}

            <div className="p-6 sm:p-8 lg:p-11">

              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#a27d37]">
                If something isn't right
              </p>

              <h2 className="mt-3 max-w-[650px] text-[clamp(26px,4vw,50px)] font-semibold leading-[1] tracking-[-0.045em]">
                We don't want a sale.
                <br />

                <span className="font-serif italic text-[#a27d37]">
                  We want your confidence.
                </span>
              </h2>

              <p className="mt-5 max-w-[620px] text-[13px] leading-6 text-black/50">
                If you ever receive a product that is incorrect or doesn't
                meet the expected authenticity standards, simply bring it
                back to our store. We'll review the issue and help you with
                a replacement.
              </p>

              <div className="mt-6 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.18em] text-black/50">

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37]">
                  <CheckIcon />
                </span>

                Customer-first support

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          WHAT WE OFFER
      ===================================================== */}

      <section className="border-y border-black/[0.08] bg-[#eeebe3] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-18">
        <div className="mx-auto max-w-[1440px]">

          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#a27d37]">
                What we offer
              </p>

              <h2 className="mt-3 max-w-[430px] text-[clamp(28px,4vw,56px)] font-semibold leading-[1] tracking-[-0.05em]">
                Everything your
                <span className="font-serif italic text-[#a27d37]">
                  {" "}routine needs.
                </span>
              </h2>

              <p className="mt-4 max-w-[360px] text-[12px] leading-6 text-black/40">
                From training performance to recovery and everyday wellness,
                explore a complete range of sports nutrition and supplements
                in one place.
              </p>

            </div>

            <div className="divide-y divide-black/10 border-t border-black/10">

              {offerings.map((item) => (
                <div
                  key={item.number}
                  className="grid gap-3 py-5 sm:grid-cols-[70px_0.8fr_1fr] sm:items-start sm:py-6"
                >

                  <span className="font-serif text-sm italic text-[#a27d37]">
                    {item.number}
                  </span>

                  <h3 className="text-[16px] font-semibold tracking-[-0.03em]">
                    {item.title}
                  </h3>

                  <p className="max-w-[400px] text-[12px] leading-6 text-black/40">
                    {item.description}
                  </p>

                </div>
              ))}

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STANDARDS
      ===================================================== */}

      <section className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-18">
        <div className="mx-auto max-w-[1440px]">

          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#a27d37]">
                The Seven Bucks standard
              </p>

              <h2 className="mt-3 max-w-[430px] text-[clamp(28px,4vw,56px)] font-semibold leading-[1] tracking-[-0.05em]">
                What we
                <span className="font-serif italic text-[#a27d37]">
                  {" "}stand for.
                </span>
              </h2>

              <p className="mt-4 max-w-[360px] text-[12px] leading-6 text-black/40">
                Trust isn't built with one statement. It's built through
                the standards we follow every day.
              </p>

            </div>

            <div className="divide-y divide-black/10 border-t border-black/10">

              {standards.map((item) => (
                <div
                  key={item.number}
                  className="grid gap-3 py-5 sm:grid-cols-[70px_0.8fr_1fr] sm:items-start sm:py-7"
                >

                  <span className="font-serif text-sm italic text-[#a27d37]">
                    {item.number}
                  </span>

                  <h3 className="text-[16px] font-semibold tracking-[-0.03em]">
                    {item.title}
                  </h3>

                  <p className="max-w-[400px] text-[12px] leading-6 text-black/40">
                    {item.description}
                  </p>

                </div>
              ))}

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUES
      ===================================================== */}

      <section className="px-5 pb-10 sm:px-8 sm:pb-14 lg:px-12 lg:pb-18">
        <div className="mx-auto max-w-[1440px]">

          <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#a27d37]">
                The essentials
              </p>

              <h2 className="mt-2.5 text-[clamp(24px,4vw,52px)] font-semibold leading-[1] tracking-[-0.045em]">
                Shop with
                <span className="font-serif italic text-[#a27d37]">
                  {" "}confidence.
                </span>
              </h2>

            </div>

            <p className="max-w-[390px] text-[11px] leading-5 text-black/35">
              Genuine products, trusted brands, verification and support —
              because your supplement deserves more than just a price tag.
            </p>

          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {values.map((value, index) => (
              <div
                key={value}
                className="group rounded-2xl border border-black/[0.08] bg-white/45 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-black/15 hover:bg-white sm:p-5"
              >

                <div className="flex items-center justify-between">

                  <span className="font-serif text-sm italic text-[#a27d37]">
                    0{index + 1}
                  </span>

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37] transition group-hover:bg-[#a27d37] group-hover:text-white">
                    <CheckIcon />
                  </span>

                </div>

                <p className="mt-6 text-[13px] font-semibold leading-5 tracking-[-0.015em] sm:mt-8">
                  {value}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          BIG TRUST STATEMENT
      ===================================================== */}

      <section className="px-5 pb-10 sm:px-8 sm:pb-14 lg:px-12 lg:pb-16">
        <div className="mx-auto max-w-[1440px]">

          <div className="relative overflow-hidden rounded-[24px] bg-[#171512] px-5 py-11 text-white sm:rounded-[28px] sm:px-8 sm:py-14 lg:px-12 lg:py-16">

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />

            <div className="relative mx-auto max-w-[1000px] text-center">

              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#b89552]">
                Our promise
              </p>

              <h2 className="mt-4 text-[clamp(30px,6vw,76px)] font-semibold leading-[0.98] tracking-[-0.055em]">
                Real products.
                <br />

                <span className="font-serif italic text-[#b89552]">
                  Real confidence.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-[650px] text-[13px] leading-6 text-white/40">
                We don't want you to buy a supplement simply because we
                sell it. We want you to know what you're buying, feel
                confident in its authenticity, and know that we're here
                if you ever need us.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="px-5 pb-8 sm:px-8 sm:pb-10 lg:px-12 lg:pb-14">
        <div className="mx-auto max-w-[1440px]">

          <div className="relative overflow-hidden rounded-[24px] border border-black/[0.08] bg-[#e9e4d9] px-5 py-10 sm:rounded-[28px] sm:px-8 sm:py-12 lg:px-12 lg:py-14">

            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-[#a27d37]/15" />

            <div className="pointer-events-none absolute -right-5 -top-5 h-34 w-34 rounded-full border border-[#a27d37]/10" />

            <div className="relative max-w-[900px]">

              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#a27d37]">
                Your nutrition starts here
              </p>

              <h2 className="mt-3.5 text-[clamp(30px,6vw,76px)] font-semibold leading-[0.95] tracking-[-0.06em]">
                Find what fits
                <br />

                <span className="font-serif italic text-[#a27d37]">
                  your goals.
                </span>
              </h2>

              <p className="mt-4 max-w-[560px] text-[12px] leading-6 text-black/40">
                Explore genuine supplements from trusted brands and find
                what fits your training, recovery, performance, weight
                management and everyday nutrition goals.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">

                <Link
                  href="/shop"
                  className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#171512] px-7 text-[9px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-black"
                >
                  Shop Collection
                  <ArrowRight />
                </Link>

                <Link
                  href="/brands"
                  className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-black/10 bg-white/50 px-7 text-[9px] font-bold uppercase tracking-[0.16em] text-black/60 transition-all duration-300 hover:border-black/20 hover:bg-white hover:text-black"
                >
                  Explore Brands
                  <ArrowRight />
                </Link>

              </div>

            </div>
          </div>

          {/* Footer line */}

          <div className="flex flex-col gap-2.5 px-1 pt-5 text-[8px] font-bold uppercase tracking-[0.2em] text-black/25 sm:flex-row sm:items-center sm:justify-between">

            <span>
              Seven Bucks Nutrition
            </span>

            <span>
              Genuine products · Trusted brands · Customer confidence
            </span>

          </div>

        </div>
      </section>

    </main>
  );
}