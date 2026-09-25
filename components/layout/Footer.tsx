import Image from "next/image";
import Link from "next/link";
import {
  Instagram,
  Youtube,
  MapPin,
  ShieldCheck,
  ArrowUpRight,
  Clock3,
  Sparkles,
} from "lucide-react";

const SHOP_LINKS = [
  { label: "All Supplements", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Protein", href: "/shop?category=protein" },
  { label: "Creatine", href: "/shop?category=creatine" },
  { label: "Pre-Workout", href: "/shop?category=pre-workout" },
  { label: "Shop by Brand", href: "/brands" },
];

const BRAND_LINKS = [
  { label: "Our Story", href: "/our-story" },
  { label: "Find Our Store", href: "/store" },
  { label: "Contact Us", href: "/store#store-location" },
  // { label: "Track Order", href: "/orders" },
];

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex w-fit items-center gap-1.5 text-[12px] text-white/55 transition-colors duration-200 hover:text-[#e8ce8f] sm:text-[13px]"
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-[#e8ce8f] to-transparent transition-all duration-300 group-hover:w-full" />
      </span>

      <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-14 overflow-visible text-white sm:mt-18 lg:mt-20">
      {/* Footer top transition */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-[72px] z-30 h-[72px] overflow-hidden sm:-top-[82px] sm:h-[82px] lg:-top-[92px] lg:h-[92px]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="block h-full w-full"
        >
          <defs>
            <linearGradient id="footerWave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0c0806" />
              <stop offset="0.5" stopColor="#120b07" />
              <stop offset="1" stopColor="#0c0806" />
            </linearGradient>
          </defs>
          <path
            d="
              M0 64
              C150 58 210 72 330 65
              C470 57 520 38 650 50
              C790 63 840 76 970 63
              C1110 49 1170 38 1290 51
              C1350 57 1395 64 1440 56
              L1440 100
              L0 100
              Z
            "
            fill="url(#footerWave)"
          />
        </svg>
      </div>

      <div className="relative overflow-hidden bg-[#0c0806]">
        {/* Premium ambient background */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(60% 40% at 50% 0%, rgba(205,180,123,0.10), transparent 70%), radial-gradient(40% 35% at 8% 90%, rgba(168,106,62,0.10), transparent 70%), radial-gradient(35% 30% at 95% 60%, rgba(205,180,123,0.06), transparent 70%)",
          }}
        />

        {/* Gold hairline at the very top */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(232,206,143,0.5), transparent)",
          }}
        />

        {/* Fine grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,240,231,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,231,0.5) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(70% 60% at 50% 30%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(70% 60% at 50% 30%, black, transparent)",
          }}
        />

        {/* Giant watermark */}
        <div
          className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-serif text-[18vw] font-bold leading-none tracking-[-0.05em] text-white/[0.022]"
          aria-hidden="true"
        >
          SEVEN BUCKS
        </div>

        <div className="relative mx-auto max-w-[1440px] px-5 pb-7 pt-12 sm:px-8 sm:pb-9 sm:pt-14 lg:px-12 lg:pb-10 lg:pt-16">
          {/* TOP */}
          <div className="grid gap-10 border-b border-white/[0.09] pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:pb-12">
            {/* BRAND */}
            <div className="max-w-2xl">
              <Link
                href="/"
                className="inline-flex items-center"
                aria-label="Seven Bucks Nutrition home"
              >
                <Image
                  src="/logo/seven-bucks-logo.webp"
                  alt="Seven Bucks Nutrition"
                  width={220}
                  height={60}
                  className="h-9 w-auto object-contain sm:h-10"
                  sizes="220px"
                />
              </Link>

              <h2 className="mt-6 max-w-xl font-serif text-[40px] leading-[0.95] tracking-[-0.045em] text-white sm:text-5xl lg:mt-7 lg:text-[58px]">
                Train heavy.
                <br />
                <span className="bg-gradient-to-r from-[#f0dfa8] via-[#e8ce8f] to-[#b8934f] bg-clip-text italic text-transparent">
                  Buy genuine.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-[12px] leading-5 text-white/40 sm:text-[13px] sm:leading-6">
                Protein, creatine, pre-workout, vitamins and more from trusted
                sports-nutrition brands — all in one place.
              </p>

              <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-[#e8ce8f]/20 bg-[#e8ce8f]/[0.05] px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#e8ce8f]" />

                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/60 sm:text-[9px]">
                  FSSAI Licensed · Brand Authorised Dealer
                </span>
              </div>

              {/* Mini trust row */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#e8ce8f]/70" />
                  100% Authentic
                </span>
                <span className="h-3 w-px bg-white/10" />
                <span>Lab Reports On Demand</span>
                <span className="h-3 w-px bg-white/10" />
                <span>Pan-India Delivery</span>
              </div>
            </div>

            {/* NAVIGATION */}
            <div className="grid grid-cols-2 gap-8 sm:gap-14 lg:self-end">
              <div>
                <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#e8ce8f]/80">
                  <span className="h-px w-4 bg-[#e8ce8f]/40" />
                  Shop
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  {SHOP_LINKS.map((item) => (
                    <FooterLink key={item.href} href={item.href}>
                      {item.label}
                    </FooterLink>
                  ))}
                </div>
              </div>

              <div>
                <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#e8ce8f]/80">
                  <span className="h-px w-4 bg-[#e8ce8f]/40" />
                  Seven Bucks
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  {BRAND_LINKS.map((item) => (
                    <FooterLink key={item.href} href={item.href}>
                      {item.label}
                    </FooterLink>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STORE */}
          <div className="grid gap-3 border-b border-white/[0.09] py-6 sm:grid-cols-2">
            <Link
              href="/store#store-location"
              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.025] px-4 py-3.5 transition-all duration-300 hover:border-[#e8ce8f]/25 hover:bg-[#e8ce8f]/[0.045] hover:shadow-[0_16px_40px_-20px_rgba(232,206,143,0.35)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8ce8f]/15 bg-[#e8ce8f]/[0.06]">
                <MapPin className="h-4 w-4 text-[#e8ce8f]" />
              </span>

              <span className="min-w-0">
                <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                  Visit us
                </span>

                <span className="mt-1 block truncate text-[12px] text-white/65 sm:text-[13px]">
                  Sector 15, Faridabad, Haryana
                </span>
              </span>

              <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/20 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#e8ce8f]" />
            </Link>

            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.025] px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8ce8f]/15 bg-[#e8ce8f]/[0.06]">
                <Clock3 className="h-4 w-4 text-[#e8ce8f]" />
              </span>

              <span className="min-w-0">
                <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                  Store hours
                </span>

                <span className="mt-1 block text-[12px] text-white/65 sm:text-[13px]">
                  Open daily · 10:00 AM – 9:30 PM
                </span>
              </span>

              <span className="ml-auto hidden shrink-0 items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/30 sm:flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9edb8f] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#9edb8f]" />
                </span>
                Open now
              </span>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="flex flex-col gap-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-white/35 sm:text-[11px]">
                © {new Date().getFullYear()} Seven Bucks Nutrition. All rights
                reserved.
              </p>

              <p className="text-[8px] uppercase tracking-[0.16em] text-white/20">
                Genuine nutrition · Made in India
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/7bucks.fbd?stkn=ZXAwbHpjeDlpN2w4"
                aria-label="Seven Bucks Nutrition on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] text-white/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e8ce8f]/40 hover:bg-[#e8ce8f]/[0.08] hover:text-[#e8ce8f] hover:shadow-[0_10px_24px_-10px_rgba(232,206,143,0.5)]"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>

              <a
                href="#"
                aria-label="Seven Bucks Nutrition on YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] text-white/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e8ce8f]/40 hover:bg-[#e8ce8f]/[0.08] hover:text-[#e8ce8f] hover:shadow-[0_10px_24px_-10px_rgba(232,206,143,0.5)]"
              >
                <Youtube className="h-3.5 w-3.5" />
              </a>

              <span className="ml-1 hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-white/20 sm:block">
                India
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
