import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#211710] text-white"
    >
      {/* Hero Image */}
      <div className="absolute inset-0 -z-30">
        <Image
          src="/hero/hero1.jpg"
          alt="Seven Bucks Nutrition"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Cinematic color treatment */}
      <div className="absolute inset-0 -z-20 bg-[#8f624d]/20 mix-blend-color" />

      {/* Overall contrast */}
      <div className="absolute inset-0 -z-20 bg-black/10" />

      {/* Text readability */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(24,14,10,0.76) 0%, rgba(31,18,13,0.58) 24%, rgba(48,28,20,0.20) 58%, rgba(48,28,20,0.02) 100%)",
        }}
      />

      {/* Bottom cinematic fade */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-72"
        style={{
          background:
            "linear-gradient(to top, rgba(18,11,8,0.72) 0%, rgba(18,11,8,0.38) 32%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1600px] items-end px-6 pb-28 pt-32 sm:px-10 sm:pb-32 lg:px-20 lg:pb-28">
        <div className="max-w-[850px]">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-gold sm:w-10" />

            <p className="text-[8px] font-semibold uppercase tracking-[0.3em] text-white/75 sm:text-[9px] md:text-[10px]">
              Seven Bucks Nutrition · Est. 2019
            </p>
          </div>

          <h1
            className="
              max-w-[850px]
              text-[2.8rem]
              font-black
              uppercase
              leading-[0.88]
              tracking-[-0.055em]
              text-white
              sm:text-[3.8rem]
              md:text-[4.9rem]
              lg:text-[6.6rem]
            "
          >
            Built on{" "}
            <span className="font-serif font-normal italic normal-case tracking-[-0.025em] text-gold">
              honest
            </span>
            <br />
            Grams.
          </h1>

          <p className="mt-7 max-w-[520px] text-[12px] leading-[1.7] text-white/75 sm:mt-8 sm:text-[13px] md:text-[14px]">
            Every scoop is tested, every gram is disclosed, and every dose has
            a purpose. No hidden blends. No inflated promises.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row">
            <Link
              href="/shop"
              className="group inline-flex h-12 items-center justify-center rounded-full bg-[#f5f1e8] px-7 text-[9px] font-bold uppercase tracking-[0.17em] text-[#211710] shadow-[0_10px_35px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_45px_rgba(0,0,0,0.28)]"
            >
              <span>Shop the Range</span>

              <span className="ml-3 text-sm transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="#standard"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 bg-white/[0.06] px-7 text-[9px] font-bold uppercase tracking-[0.17em] text-white backdrop-blur-[4px] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/[0.12]"
            >
              Our Standard
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop side detail */}
      <div className="absolute bottom-28 right-8 hidden items-center gap-3 lg:flex">
        <span className="text-[8px] font-semibold uppercase tracking-[0.32em] text-white/55 [writing-mode:vertical-rl]">
          Train · Recover · Repeat
        </span>

        <span className="h-16 w-px bg-white/25" />
      </div>

      {/* Bottom status */}
      <div className="absolute bottom-20 left-5 hidden items-center gap-3 sm:left-8 sm:flex lg:left-14">
        <span className="h-1.5 w-1.5 rounded-full bg-[#d5b66f] shadow-[0_0_12px_rgba(213,182,111,0.85)]" />

        <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-white/50">
          Genuine supplements · No compromises
        </span>
      </div>

      {/* Mobile status */}
      <div className="absolute bottom-16 left-5 right-5 flex items-center gap-3 sm:hidden">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d5b66f] shadow-[0_0_12px_rgba(213,182,111,0.85)]" />

        <span className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Genuine supplements · No compromises
        </span>
      </div>

      {/* Premium organic hero-to-section transition */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px z-30 h-[82px] sm:h-[92px] lg:h-[102px]">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="block h-[calc(100%+2px)] w-full"
          aria-hidden="true"
        >
          <path
            d="
              M0 76
              C105 61 188 96 302 81
              C412 66 498 30 614 46
              C728 62 791 96 907 79
              C1027 62 1110 34 1222 49
              C1320 62 1378 76 1440 59
              L1440 122
              L0 122
              Z
            "
            fill="#f5f1e8"
          />
        </svg>
      </div>
    </section>
  );
}