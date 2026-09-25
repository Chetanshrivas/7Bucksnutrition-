"use client";

import Link from "next/link";

const FAQS = [
  {
    q: "How do I know the tub is genuine?",
    a: "Every unit is sourced from the brand's Indian distributor. We check the hologram and importer sticker at the counter before packing, and you can scratch-verify it yourself on arrival.",
  },
  {
    q: "Do you ship across India?",
    a: "Yes — 2 to 5 working days nationwide with tracking. Free shipping over ₹2,500, flat ₹79 below that.",
  },
  {
    q: "Can I return an item?",
    a: "Unopened, seal-intact tubs can be returned within 30 days. Damaged-in-transit parcels are replaced free once you send us an unboxing photo.",
  },
  {
    q: "Which protein should a beginner start with?",
    a: "A quality whey concentrate blend at 1.6g protein per kg bodyweight covers most people. Move to isolate only if you are lactose-sensitive or cutting hard.",
  },
  {
    q: "Do you bill with GST?",
    a: "Always. A GST invoice in your name is emailed with every order and included in the box.",
  },
];

export function FAQ() {
  return (
    <section className="relative overflow-hidden border-y border-black/[0.06] bg-white">
      {/* Background details */}
      <div className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-[#a27d37]/[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          {/* =================================================
              LEFT — HEADER
          ================================================== */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-7 bg-[#a27d37]" />

              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#a27d37]">
                Before You Order
              </p>
            </div>

            <h2 className="font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-[#171512] sm:text-5xl lg:text-6xl">
              Questions?
              <br />
              <span className="italic text-[#a27d37]">
                Straight answers.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-[12px] leading-6 text-[#171512]/50 sm:text-[13px]">
              Everything you need to know before ordering
              your supplements. Still unsure? Talk to our
              team directly.
            </p>

            <Link
              href="/store"
              className="group mt-6 inline-flex h-11 items-center gap-3 rounded-full bg-[#171512] px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a27d37]"
            >
              Talk to us

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            {/* Small trust detail */}
            <div className="mt-7 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a27d37]" />

              <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#171512]/30">
                Real support · Store hours
              </span>
            </div>
          </div>

          {/* =================================================
              RIGHT — FAQ LIST
          ================================================== */}
          <div className="overflow-hidden rounded-[26px] border border-black/[0.07] bg-[#faf9f6]">
            {FAQS.map((faq, index) => (
              <details
                key={faq.q}
                className="group border-b border-black/[0.07] last:border-b-0"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 outline-none transition-colors duration-300 hover:bg-white sm:px-7 sm:py-6 [&::-webkit-details-marker]:hidden">
                  {/* Number */}
                  <span className="hidden shrink-0 font-serif text-sm italic text-[#a27d37]/70 sm:block">
                    0{index + 1}
                  </span>

                  {/* Question */}
                  <span className="min-w-0 flex-1 text-[13px] font-semibold leading-5 text-[#171512] sm:text-[14px]">
                    {faq.q}
                  </span>

                  {/* Plus */}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/[0.08] bg-white font-serif text-lg font-normal text-[#a27d37] transition-all duration-300 group-open:rotate-45 group-open:border-[#a27d37]/30 group-open:bg-[#a27d37]/[0.06]">
                    +
                  </span>
                </summary>

                <div className="px-5 pb-6 sm:pl-[68px] sm:pr-16">
                  <p className="max-w-2xl text-[11px] leading-5 text-[#171512]/50 sm:text-[12px] sm:leading-6">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQ;