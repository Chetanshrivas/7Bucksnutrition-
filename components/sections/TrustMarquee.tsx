"use client";

import { motion } from "motion/react";

type BrandMarkProps = {
  type: "on" | "mb" | "mp" | "gnc" | "mt" | "dy";
};

function BrandMark({ type }: BrandMarkProps) {
  if (type === "on") {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <text x="24" y="29" textAnchor="middle" className="fill-current font-sans text-[13px] font-black">
          ON
        </text>
      </svg>
    );
  }

  if (type === "mb") {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" aria-hidden="true">
        <rect x="5" y="5" width="38" height="38" rx="11" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <text x="24" y="29" textAnchor="middle" className="fill-current font-sans text-[12px] font-black">
          MB
        </text>
      </svg>
    );
  }

  if (type === "mp") {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" aria-hidden="true">
        <path d="M8 35V13h7l9 12 9-12h7v22h-7V23l-9 12-9-12v12H8Z" fill="currentColor" />
      </svg>
    );
  }

  if (type === "gnc") {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" aria-hidden="true">
        <rect x="4" y="10" width="40" height="28" rx="6" fill="currentColor" />
        <text x="24" y="29" textAnchor="middle" className="fill-[#211710] font-sans text-[12px] font-black">
          GNC
        </text>
      </svg>
    );
  }

  if (type === "mt") {
    return (
      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" aria-hidden="true">
        <path d="M6 36 15 12h8l4 11 5-11h10l-9 24h-9l-4-11-5 11H6Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M13 31 19 17l5 9 5-9 6 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BRAND_ROWS = [
  {
    rotate: "-2deg",
    speed: 34,
    direction: -1,
    background: "#211710",
    foreground: "#f5f0e7",
    accent: "#cdb47b",
    items: [
      { name: "Optimum Nutrition", mark: "on" as const },
      { name: "MuscleBlaze", mark: "mb" as const },
      { name: "MyProtein", mark: "mp" as const },
      { name: "GNC", mark: "gnc" as const },
    ],
  },
  {
    rotate: "1.7deg",
    speed: 40,
    direction: 1,
    background: "#cdb47b",
    foreground: "#211710",
    accent: "#211710",
    items: [
      { name: "MuscleTech", mark: "mt" as const },
      { name: "Dymatize", mark: "dy" as const },
      { name: "MuscleBlaze", mark: "mb" as const },
      { name: "Optimum Nutrition", mark: "on" as const },
    ],
  },
  {
    rotate: "-1.4deg",
    speed: 37,
    direction: -1,
    background: "#8f604b",
    foreground: "#f5f0e7",
    accent: "#e3c985",
    items: [
      { name: "GNC", mark: "gnc" as const },
      { name: "MyProtein", mark: "mp" as const },
      { name: "Dymatize", mark: "dy" as const },
      { name: "MuscleTech", mark: "mt" as const },
    ],
  },
  {
    rotate: "2deg",
    speed: 43,
    direction: 1,
    background: "#17120f",
    foreground: "#f5f0e7",
    accent: "#cdb47b",
    items: [
      { name: "Lab Tested", mark: "on" as const },
      { name: "100% Genuine", mark: "mb" as const },
      { name: "Authorised Stockist", mark: "mp" as const },
      { name: "Fully Disclosed", mark: "dy" as const },
    ],
  },
];

function BrandRibbon({ row, index }: { row: (typeof BRAND_ROWS)[number]; index: number }) {
  const items = [...row.items, ...row.items, ...row.items];

  return (
    <div
      className="relative left-1/2 w-[135%] -translate-x-1/2 sm:w-[118%]"
      style={{ transform: `translateX(-50%) rotate(${row.rotate})` }}
    >
      <div
        className="relative overflow-hidden border-y py-2 sm:py-2.5"
        style={{
          backgroundColor: row.background,
          color: row.foreground,
          borderColor: `${row.foreground}18`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ backgroundColor: `${row.foreground}18` }}
        />

        <motion.div
          className="flex w-max items-center"
          animate={{
            x: row.direction === 1 ? ["0%", "-33.333%"] : ["-33.333%", "0%"],
          }}
          transition={{ duration: row.speed, repeat: Infinity, ease: "linear" }}
        >
          {items.map((item, itemIndex) => (
            <div key={`${index}-${item.name}-${itemIndex}`} className="flex items-center">
              <div className="mx-3 flex items-center gap-2.5 sm:mx-6 sm:gap-3.5" style={{ color: row.accent }}>
                <BrandMark type={item.mark} />
                <span
                  className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.19em] sm:text-[11px] sm:tracking-[0.22em]"
                  style={{ color: row.foreground }}
                >
                  {item.name}
                </span>
              </div>

              <span className="h-1 w-1 shrink-0 rotate-45" style={{ backgroundColor: row.accent }} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function TrustMarquee() {
  return (
    <section
      aria-label="Trusted supplement brands and standards"
      className="relative overflow-hidden bg-[#f5f0e7] py-10 sm:py-14"
    >
      <div className="mx-auto mb-6 max-w-3xl px-6 text-center sm:mb-8">
        <div className="mb-3 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[#cdb47b]" />
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#8f604b] sm:text-[9px]">
            The brands we trust
          </span>
          <span className="h-px w-8 bg-[#cdb47b]" />
        </div>

        <h2 className="font-serif text-2xl italic tracking-[-0.025em] text-[#211710] sm:text-4xl md:text-5xl">
          Trusted by the best.
        </h2>

        <p className="mx-auto mt-2.5 max-w-md text-[11px] leading-6 text-[#211710]/50 sm:text-xs">
          Authentic products from leading nutrition brands, backed by verification, transparency
          and genuine sourcing.
        </p>
      </div>

      <div className="relative flex flex-col gap-2 py-1 sm:gap-2.5">
        {BRAND_ROWS.map((row, index) => (
          <BrandRibbon key={index} row={row} index={index} />
        ))}
      </div>

      <div className="mx-auto mt-7 flex max-w-4xl flex-wrap items-center justify-center gap-x-5 gap-y-2.5 px-6 sm:mt-9 sm:gap-x-10">
        {["Authorised Stockist", "Hologram Verified", "GST Billed", "No Fake Products"].map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.18em] text-[#211710]/55 sm:text-[9px]"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#cdb47b] text-[#8f604b]">
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}