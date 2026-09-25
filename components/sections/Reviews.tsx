"use client";

import { motion } from "motion/react";

const REVIEWS = [
  {
    quote:
      "Third tub of the isolate. It actually mixes in water with a spoon and my digestion is fine even at 3 scoops a day.",
    name: "Rohit K.",
    tag: "Powerlifter, Faridabad",
    initials: "RK",
    product: "Isolate Whey",
  },
  {
    quote:
      "Ignition Pre is the first pre-workout that doesn't leave me wired at midnight. Pumps are silly good.",
    name: "Aditi S.",
    tag: "Physique athlete, Delhi",
    initials: "AS",
    product: "Ignition Pre",
  },
  {
    quote:
      "I asked for the lab report and they sent the actual PDF within an hour. That told me everything.",
    name: "Faizan M.",
    tag: "Coach, Gurugram",
    initials: "FM",
    product: "Verified Buyer",
  },
];

function Stars({ size = "text-[11px]" }: { size?: string }) {
  return (
    <div className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          className={`${size === "text-sm" ? "h-4 w-4" : "h-3 w-3"} fill-[#c9a24b] drop-shadow-[0_1px_2px_rgba(201,162,75,0.4)]`}
          aria-hidden="true"
        >
          <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.57l-5.9 3.1 1.13-6.58L2.45 9.44l6.6-.96L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

export function Reviews() {
  return (
    <section className="relative overflow-hidden bg-[#f4efe6]">
      {/* ambient warmth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 85% 10%, rgba(201,162,75,0.16) 0%, transparent 70%), radial-gradient(45% 40% at 5% 95%, rgba(143,96,75,0.10) 0%, transparent 70%)",
        }}
      />
      {/* giant watermark quote */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-6 select-none font-serif text-[16rem] italic leading-none text-[#9a7b3f]/[0.07] sm:text-[22rem]"
      >
        &ldquo;
      </span>
      {/* grain dots */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(rgba(23,18,15,0.06) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#17120f]/10 to-transparent" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#17120f]/[0.08] bg-white/70 px-4 py-2 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9a7b3f]" />
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#17120f]/60 sm:text-[9px]">
                Verified Reviews
              </span>
            </div>

            <h2 className="font-serif text-4xl leading-[1.02] tracking-[-0.04em] text-[#17120f] sm:text-5xl lg:text-6xl">
              Real words from
              <br />
              <span className="italic text-[#9a7b3f]">real lifters.</span>
            </h2>
          </div>

          <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
            <Stars size="text-sm" />
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#17120f]/40">
              4.6 average · 300+ verified orders
            </span>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-3">
          {REVIEWS.map((review, index) => (
            <motion.figure
              key={review.name}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              {/* halo glow */}
              <div
                aria-hidden="true"
                className="absolute -inset-1 rounded-[30px] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(140deg, rgba(201,162,75,0.28), rgba(143,96,75,0.18), transparent 70%)",
                }}
              />

              <div className="relative flex min-h-[300px] flex-col overflow-hidden rounded-[26px] border border-[#17120f]/[0.06] bg-gradient-to-b from-white to-[#fdfaf3] p-6 shadow-[0_14px_40px_-22px_rgba(23,18,15,0.25)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_60px_-25px_rgba(154,123,63,0.4)] sm:p-7">
                {/* top gold hairline */}
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a24b]/60 to-transparent" />

                {/* Number + stars */}
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm italic text-[#9a7b3f]">0{index + 1}</span>
                  <Stars />
                </div>

                {/* Quote */}
                <blockquote className="mt-7 flex-1">
                  <span className="block font-serif text-5xl leading-[0.4] text-[#9a7b3f]/25">
                    &ldquo;
                  </span>
                  <p className="mt-3 text-[15px] font-medium leading-7 tracking-[-0.01em] text-[#17120f]/80">
                    {review.quote}
                  </p>
                </blockquote>

                {/* Footer */}
                <figcaption className="mt-7 flex items-center gap-3 border-t border-[#17120f]/[0.07] pt-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2b2018] to-[#17120f] text-[10px] font-black tracking-[0.08em] text-[#e3c985] shadow-[0_6px_16px_-6px_rgba(23,18,15,0.5)]">
                    {review.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#17120f]">
                      {review.name}
                    </p>
                    <p className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#17120f]/35">
                      {review.tag}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#9a7b3f]/20 bg-[#9a7b3f]/[0.07] px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.14em] text-[#9a7b3f]">
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                    {review.product}
                  </span>
                </figcaption>

                {/* hover accent bar */}
                <div className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-[#9a7b3f] to-[#e3c985] transition-all duration-500 group-hover:w-full" />
              </div>
            </motion.figure>
          ))}
        </div>

        {/* Mobile rating */}
        <div className="mt-8 flex flex-col items-center gap-2 sm:hidden">
          <Stars size="text-sm" />
          <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#17120f]/40">
            4.6 average · 300+ verified orders
          </span>
        </div>
      </div>
    </section>
  );
}

export default Reviews;
