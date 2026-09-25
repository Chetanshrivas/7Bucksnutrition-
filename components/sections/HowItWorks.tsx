const STEPS = [
  {
    number: "01",
    eyebrow: "DISCOVER",
    title: "Pick your protocol",
    copy: "Shop by goal, category or product. Every product page shows the details you need before you choose.",
  },
  {
    number: "02",
    eyebrow: "VERIFY",
    title: "Seal gets checked",
    copy: "Our counter team checks the hologram and importer sticker before your order is packed.",
  },
  {
    number: "03",
    eyebrow: "PACK",
    title: "Packed & billed",
    copy: "Your order is bubble-wrapped, tamper-taped and shipped with a GST invoice in your name.",
  },
  {
    number: "04",
    eyebrow: "DELIVER",
    title: "Track to your door",
    copy: "Follow your order status online as it makes its way to you, with delivery across India.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#f5f2eb]">
      {/* Subtle background details */}
      <div className="pointer-events-none absolute -right-40 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#a27d37]/[0.07] blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-7 bg-[#a27d37]" />

              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#a27d37]">
                From counter to kitchen
              </p>
            </div>

            <h2 className="font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-[#171512] sm:text-5xl md:text-[54px]">
              Simple from
              <br />
              <span className="italic text-[#a27d37]">
                start to finish.
              </span>
            </h2>
          </div>

          <p className="max-w-sm text-[12px] leading-5 text-[#171512]/45 sm:pb-1 sm:text-[13px] sm:leading-6">
            From choosing your product to tracking the
            delivery, we keep the buying experience clear
            and straightforward.
          </p>
        </div>

        {/* =====================================================
            STEPS
        ====================================================== */}

        <div className="mt-9 grid gap-3 sm:mt-11 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {STEPS.map((step, index) => (
            <article
              key={step.number}
              className={[
                "group relative overflow-hidden rounded-[24px] border border-black/[0.07] bg-white px-5 py-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,21,18,0.08)] sm:px-6 sm:py-7 lg:rounded-none lg:border-r-0 lg:first:rounded-l-[24px] lg:last:rounded-r-[24px] lg:last:border-r lg:even:border-t-0",
                index === 0 ? "lg:border-l" : "",
                index >= 2 ? "sm:border-t-0" : "",
              ].join(" ")}
            >
              {/* Top accent */}
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-[#a27d37]/50 via-[#a27d37]/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Number + arrow */}
              <div className="flex items-center justify-between">
                <span className="font-serif text-[34px] italic leading-none tracking-[-0.04em] text-[#a27d37]/80">
                  {step.number}
                </span>

                {index < STEPS.length - 1 && (
                  <span className="hidden text-sm text-[#171512]/15 lg:block">
                    →
                  </span>
                )}
              </div>

              {/* Eyebrow */}
              <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.22em] text-[#a27d37]">
                {step.eyebrow}
              </p>

              {/* Title */}
              <h3 className="mt-2 font-serif text-[22px] leading-tight tracking-[-0.025em] text-[#171512]">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-2.5 text-[11px] leading-5 text-[#171512]/45 sm:text-xs">
                {step.copy}
              </p>

              {/* Bottom indicator */}
              <div className="mt-6 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#a27d37]" />

                <span className="h-px w-8 bg-[#171512]/10 transition-all duration-300 group-hover:w-12 group-hover:bg-[#a27d37]/40" />
              </div>
            </article>
          ))}
        </div>

        {/* =====================================================
            BOTTOM TRUST STRIP
        ====================================================== */}

        {/* <div className="mt-3 flex flex-col gap-4 rounded-[22px] border border-black/[0.07] bg-[#171512] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#d4b56a]"
                aria-hidden="true"
              >
                <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/75">
                Built around trust
              </p>

              <p className="mt-1 text-[10px] leading-4 text-white/35">
                Clear products. Checked stock. Secure delivery.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/30">
              Authentic products
            </span>

            <span className="hidden h-3 w-px bg-white/10 sm:block" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/30">
              GST invoice
            </span>

            <span className="hidden h-3 w-px bg-white/10 sm:block" />

            <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/30">
              Tracked delivery
            </span>
          </div>
        </div> */}
      </div>
    </section>
  );
}

export default HowItWorks;