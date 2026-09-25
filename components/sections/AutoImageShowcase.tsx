"use client";

import { useEffect, useRef, useState } from "react";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1800&q=85",
    alt: "Gym training",
    label: "Flavored Protein",
  },
  {
    src: "/hero/hero-runner.jpg",
    alt: "Gym workout",
    label: "Pre-Workout",
  },
  {
    src: "/hero/PP.webp",
    alt: "Protein and fitness",
    label: "Clear Protein",
  },
  {
    src: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?auto=format&fit=crop&w=1800&q=85",
    alt: "Strength training",
    label: "Mass Gainer",
  },
  {
    src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=85",
    alt: "Performance fuel",
    label: "Plant Based",
  },
];

const CYCLE_MS = 3000;

export default function AutoImageShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const nextProgress = Math.min((elapsed / CYCLE_MS) * 100, 100);
      setProgress(nextProgress);

      if (elapsed >= CYCLE_MS) {
        setActiveIndex((current) => (current + 1) % IMAGES.length);
        startRef.current = timestamp;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    if (!isPaused) {
      startRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [activeIndex, isPaused]);

  const handleSelect = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
  };

  return (
    <section
      className="relative overflow-hidden bg-[#f5f0e7]"
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:gap-4">
          {/* Main hero card */}
          <div
            className="group relative min-h-[420px] overflow-hidden rounded-[24px] sm:min-h-[520px] md:min-h-full"
            onMouseEnter={() => setIsPaused(true)}
          >
            {IMAGES.map((image, index) => (
              <div
                key={image.src}
                className={`absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  index === activeIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover transition-transform duration-[8000ms] ease-linear group-hover:scale-105"
                  draggable={false}
                />
              </div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b]/80 via-[#1a120b]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a120b]/50 to-transparent" />

            <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-end p-6 sm:p-8 md:min-h-full lg:p-10">
              <div className="mb-4 inline-flex w-max items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/95 backdrop-blur-md sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d8b978]" />
                Seven Bucks Nutrition
              </div>

              <h2 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Built for
                <br />
                <span className="text-[#d8b978]">your grind.</span>
              </h2>

              <p className="mt-4 max-w-[460px] text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                Premium nutrition designed to support your training, recovery
                and everyday performance.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button className="h-11 rounded-full bg-[#d8b978] px-6 text-xs font-bold uppercase tracking-[0.12em] text-[#1a120b] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  Shop now
                </button>
                <button className="h-11 rounded-full border border-white/30 bg-white/10 px-6 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                  View all
                </button>
              </div>

              {/* Progress bar */}
              <div className="mt-6 h-0.5 w-full max-w-[180px] rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#d8b978] transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="pointer-events-none absolute right-5 top-5 z-20 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-md">
              {String(activeIndex + 1).padStart(2, "0")} / {String(IMAGES.length).padStart(2, "0")}
            </div>
          </div>

          {/* Right grid — 4 non-active images in 2×2 */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {IMAGES.filter((_, index) => index !== activeIndex).map((image) => (
              <button
                key={image.src}
                onClick={() => handleSelect(IMAGES.indexOf(image))}
                onMouseEnter={() => setIsPaused(true)}
                className="group relative aspect-[4/5] w-full overflow-hidden rounded-[20px] text-left outline-none transition-all duration-300 hover:ring-2 hover:ring-white/40 focus-visible:ring-2 focus-visible:ring-[#d8b978] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f0e7] sm:aspect-square lg:aspect-[4/3]"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-110"
                  draggable={false}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b]/80 via-[#1a120b]/10 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-sm font-bold text-white drop-shadow-md sm:text-base lg:text-lg">
                      {image.label}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors group-hover:border-[#d8b978] group-hover:text-[#d8b978]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
