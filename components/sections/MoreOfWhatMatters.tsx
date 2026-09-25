"use client";

import { useEffect, useRef } from "react";

const phrases = [
  { text: "MORE OF WHAT MATTERS.", image: "/hero/hero-runner.jpg" },
  { text: "PURE PERFORMANCE.",     image: "/hero/hero-leaf.jpg" },
  { text: "EVERYDAY FUEL.",        image: "/hero/hero-mountain.jpg" },
  { text: "REAL INGREDIENTS.",     image: "/hero/hero-protein.jpg" },
];


export function MoreOfWhatMatters() {
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPositionRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const speed = 2.9;

    const getSetWidth = () => track.scrollWidth / 3;

    const setWidth = getSetWidth();

    if (setWidth > 0) {
      positionRef.current = -setWidth;
      track.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
    }

    const animate = () => {
      if (!draggingRef.current) {
        const currentSetWidth = getSetWidth();

        positionRef.current += speed;

        if (
          currentSetWidth > 0 &&
          positionRef.current >= 0
        ) {
          positionRef.current -= currentSetWidth;
        }

        track.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;

    draggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartPositionRef.current = positionRef.current;

    track.setPointerCapture(e.pointerId);
    track.style.cursor = "grabbing";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    const track = trackRef.current;
    if (!track) return;

    const setWidth = track.scrollWidth / 3;
    const delta = e.clientX - dragStartXRef.current;

    positionRef.current = dragStartPositionRef.current + delta;

    if (setWidth > 0) {
      while (positionRef.current >= 0) {
        positionRef.current -= setWidth;
        dragStartPositionRef.current -= setWidth;
      }

      while (positionRef.current < -setWidth) {
        positionRef.current += setWidth;
        dragStartPositionRef.current += setWidth;
      }
    }

    track.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;

    draggingRef.current = false;
    track.style.cursor = "grab";

    try {
      if (track.hasPointerCapture(e.pointerId)) {
        track.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  const repeatedPhrases = [
    ...phrases,
    ...phrases,
    ...phrases,
  ];

  return (
    <section className="relative overflow-hidden bg-[#f5f1e8] py-14 sm:py-15 sm:mb-4 lg:py-12 lg:mb-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      <div className="mx-auto mb-10 max-w-[1440px] px-5 text-center sm:mb-14 sm:px-8 lg:mb-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-4 py-2 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#9a7b3f]" />

          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#211710]/60 sm:text-[9px]">
            Our Philosophy
          </span>
        </div>

        <h2 className="font-serif text-[2.4rem] leading-none tracking-[-0.045em] text-[#211710] sm:text-5xl lg:text-6xl">
          More of what{" "}
          <span className="italic text-[#9a7b3f]">
            matters.
          </span>
        </h2>

        <p className="mx-auto mt-2 max-w-[620px] text-[11px] leading-7 text-[#211710]/50 sm:text-xs">
          Better choices. Better nutrition. A stronger everyday you.
        </p>
      </div>

      <div className="relative overflow-hidden py-7 sm:py-10 lg:py-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f5f1e8] to-transparent sm:w-28 lg:w-48" />

        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f5f1e8] to-transparent sm:w-28 lg:w-48" />

        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex w-max cursor-grab select-none items-center whitespace-nowrap"
          style={{
            touchAction: "pan-y",
            willChange: "transform",
          }}
        >
          {repeatedPhrases.map((phrase, index) => (
            <div
              key={`${phrase.text}-${index}`}
              className="flex shrink-0 items-center"
              aria-hidden={index >= phrases.length}
            >
              <span
                className="bg-cover bg-center bg-clip-text bg-no-repeat px-5 font-sans text-[clamp(5rem,14vw,14rem)] font-black uppercase leading-[0.72] tracking-[-0.085em] text-transparent sm:px-9 lg:px-14"
                style={{
                  backgroundImage: `url("${phrase.image}")`,
                }}
              >
                {phrase.text}
              </span>

              <span className="mr-5 h-3 w-3 shrink-0 rounded-full bg-[#9a7b3f] sm:mr-9 sm:h-4 sm:w-4 lg:mr-14 lg:h-5 lg:w-5" />
            </div>
          ))}
        </div>
      </div>

      {/* <div className="mx-auto mt-5 flex max-w-[1440px] items-center justify-center gap-5 px-5 sm:mt-7">
        <span className="h-px w-12 bg-[#9a7b3f]/40 sm:w-24" />

        <span className="text-[8px] font-bold uppercase tracking-[0.32em] text-[#211710]/35 sm:text-[9px]">
          Scroll a better tomorrow
        </span>

        <span className="h-px w-12 bg-[#9a7b3f]/40 sm:w-24" />
      </div> */}
    </section>
  );
}

export default MoreOfWhatMatters;
