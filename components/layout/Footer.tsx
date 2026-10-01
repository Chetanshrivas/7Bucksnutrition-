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
  Mail,
  MessageCircle,
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
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Cancellation & Refund", href: "/cancellation-and-refund" },
  { label: "Shipping & Exchange", href: "/shipping-and-exchange" },
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
      className="group inline-flex w-fit items-center gap-1.5 text-[12px] text-white/50 transition-colors duration-200 hover:text-[#e8ce8f] sm:text-[13px]"
    >
      <span className="relative">
        {children}

        <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#e8ce8f] transition-all duration-300 group-hover:w-full" />
      </span>

      <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.24em] text-[#e8ce8f]/75">
      <span className="h-px w-4 bg-[#e8ce8f]/40" />
      {children}
    </p>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-16 overflow-visible text-white sm:mt-20 lg:mt-24">
      {/* Soft wave transition */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-[55px] z-20 h-[55px] overflow-hidden sm:-top-[65px] sm:h-[65px] lg:-top-[75px] lg:h-[75px]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="block h-full w-full"
        >
          <defs>
            <linearGradient
              id="footerWave"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
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
        {/* Ambient lighting */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(55% 40% at 50% 0%, rgba(205,180,123,0.09), transparent 70%), radial-gradient(35% 35% at 5% 90%, rgba(168,106,62,0.08), transparent 70%), radial-gradient(30% 30% at 95% 55%, rgba(205,180,123,0.05), transparent 70%)",
          }}
        />

        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,240,231,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,240,231,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage:
              "radial-gradient(70% 60% at 50% 30%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(70% 60% at 50% 30%, black, transparent)",
          }}
        />

        {/* Top gold line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(232,206,143,0.42), transparent)",
          }}
        />

        {/* Watermark */}
        <div
          className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-serif text-[15vw] font-bold leading-none tracking-[-0.06em] text-white/[0.018] sm:text-[13vw]"
          aria-hidden="true"
        >
          7BucksNutrition
        </div>

        <div className="relative mx-auto max-w-[1440px] px-5 pb-6 pt-10 sm:px-8 sm:pb-8 sm:pt-12 lg:px-12 lg:pb-9 lg:pt-14">
          {/* MAIN */}
          <div className="grid gap-10 border-b border-white/[0.08] pb-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:pb-10">
            {/* BRAND */}
            <div className="max-w-2xl">
              <Link
                href="/"
                className="inline-flex items-center"
                aria-label="7BucksNutrition home"
              >
                <Image
                  src="/logo/seven-bucks-logo.webp"
                  alt="7BucksNutrition"
                  width={220}
                  height={60}
                  className="h-9 w-auto object-contain sm:h-10"
                  sizes="220px"
                />
              </Link>

              <h2 className="mt-6 max-w-xl font-serif text-[38px] leading-[0.96] tracking-[-0.045em] text-white sm:text-5xl lg:mt-7 lg:text-[56px]">
                Train heavy.
                <br />
                <span className="bg-gradient-to-r from-[#f0dfa8] via-[#e8ce8f] to-[#b8934f] bg-clip-text italic text-transparent">
                  Buy genuine.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-[12px] leading-5 text-white/38 sm:text-[13px] sm:leading-6">
                Protein, creatine, pre-workout, vitamins and more from trusted
                sports-nutrition brands — all in one place.
              </p>

              <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-[#e8ce8f]/20 bg-[#e8ce8f]/[0.05] px-3.5 py-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#e8ce8f]" />

                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/55 sm:text-[9px]">
                  FSSAI Licensed · Brand Authorised Dealer
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[8px] font-semibold uppercase tracking-[0.17em] text-white/28 sm:text-[9px]">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#e8ce8f]/65" />
                  100% Authentic
                </span>

                <span className="h-3 w-px bg-white/10" />

                <span>Lab Reports On Demand</span>

                <span className="h-3 w-px bg-white/10" />

                <span>Pan-India Delivery</span>
              </div>
            </div>

            {/* NAVIGATION */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-9 sm:gap-x-14 lg:self-end">
              <div>
                <FooterHeading>Shop</FooterHeading>

                <div className="mt-4 flex flex-col gap-3">
                  {SHOP_LINKS.map((item) => (
                    <FooterLink key={item.href} href={item.href}>
                      {item.label}
                    </FooterLink>
                  ))}
                </div>
              </div>

              <div>
                <FooterHeading>7BucksNutrition</FooterHeading>

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

          {/* SUPPORT / STORE */}
          <div className="grid gap-3 border-b border-white/[0.08] py-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Store */}
            <Link
              href="/store#store-location"
              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5 transition-all duration-300 hover:border-[#e8ce8f]/25 hover:bg-[#e8ce8f]/[0.04]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8ce8f]/15 bg-[#e8ce8f]/[0.05]">
                <MapPin className="h-4 w-4 text-[#e8ce8f]" />
              </span>

              <span className="min-w-0">
                <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-white/28">
                  Visit us
                </span>

                <span className="mt-1 block truncate text-[12px] text-white/62 sm:text-[13px]">
                  Sector 15, Faridabad, Haryana
                </span>
              </span>

              <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/20 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#e8ce8f]" />
            </Link>

            {/* Email */}
            <a
              href="mailto:sevenbucksnutrition@gmail.com"
              className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5 transition-all duration-300 hover:border-[#e8ce8f]/25 hover:bg-[#e8ce8f]/[0.04]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8ce8f]/15 bg-[#e8ce8f]/[0.05]">
                <Mail className="h-4 w-4 text-[#e8ce8f]" />
              </span>

              <span className="min-w-0">
                <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-white/28">
                  Support
                </span>

                <span className="mt-1 block truncate text-[12px] text-white/62 sm:text-[13px]">
                  sevenbucksnutrition@gmail.com
                </span>
              </span>

              <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-white/20 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#e8ce8f]" />
            </a>

            {/* Hours */}
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8ce8f]/15 bg-[#e8ce8f]/[0.05]">
                <Clock3 className="h-4 w-4 text-[#e8ce8f]" />
              </span>

              <span className="min-w-0">
                <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-white/28">
                  Store hours
                </span>

                <span className="mt-1 block text-[12px] text-white/62 sm:text-[13px]">
                  Open daily · 10:00 AM – 8:30 PM
                </span>
              </span>

              <span className="ml-auto hidden shrink-0 items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/28 sm:flex">
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
              <p className="text-[10px] text-white/32 sm:text-[11px]">
                © {new Date().getFullYear()} 7BucksNutrition. All rights
                reserved.
              </p>

              <p className="text-[8px] uppercase tracking-[0.16em] text-white/18">
                Genuine nutrition · Made in India
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/7bucks.fbd?stkn=ZXAwbHpjeDlpN2w4"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="7BucksNutrition on Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] text-white/38 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e8ce8f]/40 hover:bg-[#e8ce8f]/[0.08] hover:text-[#e8ce8f]"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>

              <a
                href="#"
                aria-label="7BucksNutrition on YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] text-white/38 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#e8ce8f]/40 hover:bg-[#e8ce8f]/[0.08] hover:text-[#e8ce8f]"
              >
                <Youtube className="h-3.5 w-3.5" />
              </a>

              <span className="ml-1 hidden text-[8px] font-semibold uppercase tracking-[0.18em] text-white/18 sm:block">
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