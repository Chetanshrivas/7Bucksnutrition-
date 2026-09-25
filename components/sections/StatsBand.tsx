"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const STATS = [
  {
    number: "40+",
    label: "Authorised brands",
    detail: "Trusted names",
  },
  {
    number: "12k+",
    label: "Orders shipped",
    detail: "Customers served",
  },
  {
    number: "100%",
    label: "Hologram verified",
    detail: "Before dispatch",
  },
  {
    number: "4.8",
    label: "Average rating",
    detail: "Customer rated",
    suffix: "★",
  },
];

function useCountUp(target: string, active: boolean) {
  const [display, setDisplay] = useState(target);
  const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
  const prefix = target.match(/^[^0-9]*/)?.[0] ?? "";
  const suffix = target.match(/[^0-9.]*$/)?.[0] ?? "";

  useEffect(() => {
    if (!active || isNaN(numeric)) {
      setDisplay(target);
      return;
    }

    const duration = 1400;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = numeric * eased;
      const formatted = target.includes(".")
        ? current.toFixed(1)
        : Math.round(current).toLocaleString("en-IN");
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(target);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, numeric, prefix, suffix]);

  return display;
}

function StatCell({
  stat,
  index,
  active,
}: {
  stat: (typeof STATS)[number];
  index: number;
  active: boolean;
}) {
  const number = useCountUp(stat.number, active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "group relative flex min-h-[160px] flex-col items-center justify-center overflow-hidden px-4 py-8 text-center sm:min-h-[185px] sm:px-6 sm:py-10",
        index % 2 !== 0 ? "border-l border-white/[0.07]" : "",
        index >= 2 ? "border-t border-white/[0.07] lg:border-t-0" : "",
        index === 2 ? "border-white/[0.07] lg:border-l" : "",
      ].join(" ")}
    >
      {/* hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e3c985]/15 blur-2xl" />
      </div>

      {/* top accent line on hover */}
      <span className="absolute inset-x-8 top-0 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#e3c985]/70 to-transparent transition-transform duration-500 group-hover:scale-x-100" />

      {/* Indicator */}
      <span className="relative mb-4 flex h-5 w-5 items-center justify-center">
        <span className="absolute h-full w-full rounded-full border border-[#e3c985]/30 transition-transform duration-500 group-hover:scale-125" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#e3c985] transition-transform duration-300 group-hover:scale-150" />
      </span>

      {/* Number */}
      <div className="relative flex items-baseline justify-center gap-1">
        <span className="bg-gradient-to-b from-[#fbf7ec] via-[#f2e8cf] to-[#cbb27e] bg-clip-text font-serif text-[38px] leading-none tracking-[-0.045em] text-transparent sm:text-[48px]">
          {number}
        </span>
        {stat.suffix && (
          <span className="text-base text-[#e3c985] sm:text-lg">{stat.suffix}</span>
        )}
      </div>

      {/* Label */}
      <p className="relative mt-3 text-[8px] font-bold uppercase tracking-[0.18em] text-white/70 sm:text-[10px]">
        {stat.label}
      </p>

      {/* Detail */}
      <p className="relative mt-1 text-[7px] uppercase tracking-[0.14em] text-white/30 sm:text-[8px]">
        {stat.detail}
      </p>
    </motion.div>
  );
}

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 90% at 50% -10%, #2b2117 0%, #1a140e 42%, #0e0b07 100%)",
      }}
    >
      {/* =====================================================
          TOP WAVE
      ====================================================== */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-14 overflow-hidden sm:h-16">
        <svg
          className="absolute left-1/2 h-full w-[115%] min-w-[700px] -translate-x-1/2 sm:min-w-[900px]"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 0H1440V32C1210 76 1040 76 820 42C600 8 400 5 0 52V0Z"
            fill="#f5f1e8"
          />
        </svg>
      </div>

      {/* =====================================================
          BOTTOM WAVE
      ====================================================== */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-14 rotate-180 overflow-hidden sm:h-16">
        <svg
          className="absolute left-1/2 h-full w-[115%] min-w-[700px] -translate-x-1/2 sm:min-w-[900px]"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 0H1440V32C1210 76 1040 76 820 42C600 8 400 5 0 52V0Z"
            fill="#f5f1e8"
          />
        </svg>
      </div>

      {/* =====================================================
          BACKGROUND — warm aurora + gold glows + grain grid
      ====================================================== */}

      {/* central molten-gold aura */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 55% at 50% 55%, rgba(227,201,133,0.12) 0%, transparent 70%)",
        }}
      />

      {/* side glows */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[#a27d37]/[0.14] blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-[#8f604b]/[0.12] blur-3xl" />

      {/* drifting light beam */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[140%] w-[55%] -translate-x-1/2 rotate-[18deg] opacity-[0.06]"
        style={{
          background:
            "linear-gradient(180deg, transparent, #f2dfae 45%, #f2dfae 55%, transparent)",
          filter: "blur(30px)",
        }}
        animate={{ x: ["-30%", "30%"] }}
        transition={{ duration: 14, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />

      {/* fine grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 80% at 50% 50%, transparent 55%, rgba(8,6,3,0.55) 100%)",
        }}
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:px-12 lg:pb-24 lg:pt-32">
        {/* Section label */}
        <div className="mb-10 flex flex-col items-center gap-4 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e3c985]/20 bg-[#e3c985]/[0.06] px-4 py-2 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e3c985]" />
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#e3c985]/80 sm:text-[9px]">
              The Seven Bucks Standard
            </span>
          </div>

          <h2 className="text-center font-serif text-[1.9rem] leading-none tracking-[-0.04em] text-[#f7f2e6] sm:text-4xl lg:text-5xl">
            Numbers that <span className="italic text-[#e3c985]">prove it.</span>
          </h2>
        </div>

        {/* ===================================================
            STATS GRID — gradient border card
        ==================================================== */}
        <div className="relative mx-auto max-w-[1180px]">
          {/* animated gradient border */}
          <div
            className="absolute -inset-px rounded-[27px] opacity-70"
            style={{
              background:
                "linear-gradient(120deg, rgba(227,201,133,0.45), rgba(255,255,255,0.08) 30%, rgba(227,201,133,0.12) 55%, rgba(255,255,255,0.08) 75%, rgba(227,201,133,0.45))",
            }}
          />
          {/* halo behind card */}
          <div className="absolute -inset-6 rounded-[40px] bg-[#e3c985]/[0.05] blur-2xl" />

          <div className="relative overflow-hidden rounded-[26px] bg-[#171209]/[0.92] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-md">
            {/* top inner sheen */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            <div className="grid grid-cols-2 lg:grid-cols-4">
              {STATS.map((stat, index) => (
                <StatCell key={stat.label} stat={stat} index={index} active={inView} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#e3c985]/50 sm:w-14" />
          <span className="h-1 w-1 rotate-45 bg-[#e3c985]/70" />
          <p className="text-center text-[7px] font-medium uppercase tracking-[0.22em] text-white/30 sm:text-[8px]">
            Protein · Performance · Everyday Nutrition
          </p>
          <span className="h-1 w-1 rotate-45 bg-[#e3c985]/70" />
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#e3c985]/50 sm:w-14" />
        </div>
      </div>
    </section>
  );
}

export default StatsBand;
