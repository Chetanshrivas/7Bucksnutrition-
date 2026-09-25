import Image from "next/image";
import Link from "next/link";

const STORY_STATS: [string, string][] = [
  ["10k+", "Athletes served"],
  ["100%", "Batches lab tested"],
  ["4.7", "Average rating"],
];

export function SplitStory() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-secondary">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="grid items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* =====================================================
              IMAGE / BRAND STORY VISUAL
          ====================================================== */}
          <div className="group relative min-h-[360px] overflow-hidden rounded-[28px] bg-espresso sm:min-h-[430px] lg:min-h-[560px]">
            {/* Replace this background with your actual store image later.
                Recommended:
                /images/about/store-story.webp
            */}

            <div className="absolute inset-0 bg-gradient-to-br from-espresso via-espresso to-clay/40" />

            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-clay/20 blur-3xl" />

            {/* Subtle grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            {/* Center visual */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] sm:h-60 sm:w-60">
                <div className="absolute h-32 w-32 rounded-full bg-gold/[0.08] blur-2xl sm:h-40 sm:w-40" />

                <div className="relative text-center">
                  <span className="block font-serif text-5xl italic text-gold sm:text-6xl">
                    07
                  </span>

                  <span className="mt-2 block text-[8px] font-bold uppercase tracking-[0.28em] text-white/45">
                    Seven Bucks
                  </span>

                  <span className="mt-1 block text-[7px] uppercase tracking-[0.18em] text-white/30">
                    Nutrition
                  </span>
                </div>
              </div>
            </div>

            {/* Top label */}
            <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/55">
                  Our Story
                </span>
              </div>
            </div>

            {/* Bottom caption */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-gold">
                  Faridabad · India
                </p>
                <p className="mt-1 text-xs text-white/45">
                  Built around better nutrition.
                </p>
              </div>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm text-white/60">
                ↗
              </span>
            </div>
          </div>

          {/* =====================================================
              STORY CONTENT
          ====================================================== */}
          <div className="flex flex-col justify-center py-2 lg:py-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-clay" />

              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-clay">
                Since 2019
              </p>
            </div>

            <h2 className="mt-5 max-w-xl font-serif text-3xl leading-[1.02] tracking-[-0.04em] text-espresso sm:text-4xl md:text-5xl">
              Built for people who
              <br className="hidden sm:block" />{" "}
              <span className="italic text-clay">
                take their training seriously.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-[13px] leading-6 text-espresso/55 sm:text-sm">
              Started in a Faridabad gym because every tub on the shelf lied
              about something. We began by sending competitor tubs to a lab.
              Half missed their protein claim.
            </p>

            <p className="mt-3 max-w-xl text-[13px] leading-6 text-espresso/55 sm:text-sm">
              So we built the range we wanted to buy — fewer SKUs, bigger
              doses, and a certificate of analysis printed with every batch
              code.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 border-y border-border py-6">
              {STORY_STATS.map(([big, small], index) => (
                <div
                  key={small}
                  className={`px-3 first:pl-0 ${
                    index !== 0 ? "border-l border-border" : ""
                  }`}
                >
                  <p className="font-serif text-2xl italic tracking-tight text-espresso sm:text-3xl">
                    {big}
                  </p>

                  <p className="mt-1 max-w-[110px] text-[7px] font-semibold uppercase leading-4 tracking-[0.12em] text-espresso/40 sm:text-[8px]">
                    {small}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/about"
                className="group inline-flex h-11 items-center justify-center gap-3 rounded-full bg-espresso px-6 text-[9px] font-bold uppercase tracking-[0.18em] text-ivory transition-all duration-300 hover:bg-clay"
              >
                Our standard
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center rounded-full border border-espresso/15 px-6 text-[9px] font-bold uppercase tracking-[0.18em] text-espresso/70 transition-all duration-300 hover:border-espresso hover:text-espresso"
              >
                Shop the range
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SplitStory;