import Link from "next/link";

const PROTEIN_TYPES = [
  {
    number: "01",
    eyebrow: "EVERYDAY PERFORMANCE",
    title: "Whey Protein",
    subtitle: "The everyday choice.",
    description:
      "A reliable protein source for daily muscle recovery, strength and training support.",
    href: "/shop?category=whey-protein",
    tag: "MOST POPULAR",
    stat: "24–25g",
    statLabel: "protein / serving*",
    image: "/hero/WP.jpg",
  },
  {
    number: "02",
    eyebrow: "LEAN & LIGHT",
    title: "Whey Isolate",
    subtitle: "More protein. Less extra.",
    description:
      "A cleaner, lighter whey option for those who want high protein with fewer extras.",
    href: "/shop?category=whey-isolate",
    tag: "LEAN CHOICE",
    stat: "25–27g",
    statLabel: "protein / serving*",
    image: "/hero/WIP.webp",
  },
  {
    number: "03",
    eyebrow: "PLANT POWERED",
    title: "Plant Protein",
    subtitle: "Protein, your way.",
    description:
      "Plant-based protein options designed for everyday nutrition and active lifestyles.",
    href: "/shop?category=plant-protein",
    tag: "PLANT BASED",
    stat: "20–25g",
    statLabel: "protein / serving*",
    image: "/hero/PP.webp",
    
  },
  {
    number: "04",
    eyebrow: "CALORIES + PROTEIN",
    title: "Mass Gainer",
    subtitle: "Build with more.",
    description:
      "Higher-calorie formulas made for people looking to increase daily calorie and protein intake.",
    href: "/shop?category=mass-gainer",
    tag: "HIGH CALORIE",
    stat: "HIGH",
    statLabel: "calorie support*",
    image: "/hero/SM (1).webp",
  },
];

export function FindYourProtein() {
  return (
    <section className="relative overflow-hidden bg-[#f5f2eb]">
      <div className="pointer-events-none absolute -right-40 top-10 h-72 w-72 rounded-full bg-[#a27d37]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-black/[0.035] blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-4 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-7 bg-[#a27d37]" />
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#a27d37]">
                Find Your Protein
              </p>
            </div>

            <h2 className="font-serif text-3xl leading-[1.05] tracking-[-0.03em] text-[#171512] sm:text-5xl md:text-[54px]">
              Not sure what to choose?
              <br />
              <span className="italic text-[#a27d37]">Start here.</span>
            </h2>

            <p className="mt-4 max-w-xl text-[13px] leading-6 text-[#171512]/55 sm:text-sm">
              From everyday whey to plant-based protein and mass gainers,
              find the formula that fits your training and your goals.
            </p>
          </div>

          <Link
            href="/shop?category=protein"
            className="group inline-flex w-fit shrink-0 items-center gap-3 rounded-full border border-[#171512]/15 bg-white px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#171512] transition-all duration-300 hover:border-[#a27d37]/40 hover:bg-[#171512] hover:text-white"
          >
            Explore all protein
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden] min-[480px]:grid min-[480px]:grid-cols-2 min-[480px]:overflow-visible min-[480px]:pb-0 sm:mt-11 lg:grid-cols-4">
          {PROTEIN_TYPES.map((protein) => (
            <Link
              key={protein.number}
              href={protein.href}
              className="group relative flex w-[calc(100vw-40px)] min-w-[calc(100vw-40px)] snap-start flex-col overflow-hidden rounded-[26px] border border-black/[0.07] bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(23,21,18,0.10)] min-[480px]:w-auto min-[480px]:min-w-0"
            >
              <div className="relative m-2 overflow-hidden rounded-[20px] bg-[#f5f2eb]">
                <img
                  src={protein.image}
                  alt={protein.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] min-[480px]:aspect-[5/4]"
                />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85 font-serif text-[11px] italic text-[#a27d37] shadow-sm backdrop-blur">
                    {protein.number}
                  </span>

                  <span className="rounded-full border border-[#a27d37]/20 bg-white/85 px-2.5 py-1.5 text-[5px] font-bold uppercase tracking-[0.15em] text-[#8d6c31] shadow-sm backdrop-blur">
                    {protein.tag}
                  </span>
                </div>
              </div>

              <div className="relative flex flex-1 flex-col px-5 pb-5 pt-1 min-[480px]:px-5 min-[480px]:pb-5 min-[480px]:pt-2 sm:px-6 sm:pb-6">
                <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-[#a27d37]">
                  {protein.eyebrow}
                </p>

                <h3 className="mt-1.5 font-serif text-[22px] leading-none tracking-[-0.025em] text-[#171512]">
                  {protein.title}
                </h3>

                <p className="mt-1.5 text-[11px] font-semibold text-[#171512]/65">
                  {protein.subtitle}
                </p>

                <p className="mt-2.5 max-w-[360px] text-[10px] leading-[1.55] text-[#171512]/45">
                  {protein.description}
                </p>

                <div className="mt-4 flex items-end justify-between border-t border-black/[0.07] pt-3.5 min-[480px]:mt-auto min-[480px]:pt-4">
                  <div className="pt-1">
                    <span className="block text-sm font-bold text-[#171512]">
                      {protein.stat}
                    </span>

                    <span className="mt-0.5 block text-[7px] font-semibold uppercase tracking-[0.12em] text-[#171512]/35">
                      {protein.statLabel}
                    </span>
                  </div>

                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171512] text-sm text-white transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#a27d37]">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-center gap-1.5 min-[480px]:hidden">
          {PROTEIN_TYPES.map((protein, index) => (
            <span
              key={protein.number}
              className={`h-1 rounded-full ${
                index === 0 ? "w-5 bg-[#a27d37]" : "w-1.5 bg-[#171512]/15"
              }`}
            />
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] bg-[#171512]">
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="text-[#d4b56a]"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 10v6" />
                  <path d="M12 7h.01" />
                </svg>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d4b56a]">
                  Still deciding?
                </p>

                <p className="mt-0.5 text-[11px] leading-5 text-white/50">
                  Compare our complete protein collection by brand, formula
                  and size.
                </p>
              </div>
            </div>

            <Link
              href="/shop?category=protein"
              className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-white px-5 py-2.5 text-[8px] font-bold uppercase tracking-[0.18em] text-[#171512] transition-all duration-300 hover:bg-[#d4b56a]"
            >
              Browse Protein
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>

        <p className="mt-3 text-[7px] leading-4 text-[#171512]/30">
          *Protein amounts vary by product and serving size. Always check the
          individual product label for exact nutritional information.
        </p>
      </div>
    </section>
  );
}

export default FindYourProtein;