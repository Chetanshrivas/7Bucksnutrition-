"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { Brand } from "../../lib/products";

type BrandsOrbitProps = {
  brands: Brand[];
};

const SECTION_BG =
  "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%), radial-gradient(45% 40% at 0% 100%, rgba(214,178,132,0.35) 0%, rgba(214,178,132,0) 70%), linear-gradient(135deg, #fbf8f2 0%, #f5efe6 58%, #ecdcc9 100%)";

export function BrandsOrbit({
  brands,
}: BrandsOrbitProps) {
  const trackRef =
    useRef<HTMLDivElement>(null);

  const rafRef =
    useRef<number | null>(null);

  const isDragging =
    useRef(false);

  const hasMoved =
    useRef(false);

  const dragStartX =
    useRef(0);

  const dragStartScroll =
    useRef(0);

  const resumeTimeout =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const isPausedRef =
    useRef(false);

  // Momentum/inertia state: since the track now handles touch drag
  // entirely itself (touch-action: none), the browser's native
  // "flick and glide to a stop" no longer happens automatically —
  // these refs let us recreate that same smooth deceleration by hand.
  const velocityRef =
    useRef(0);

  const lastPointerXRef =
    useRef(0);

  const lastPointerTimeRef =
    useRef(0);

  const momentumVelocityRef =
    useRef(0);

  const hasBrands = brands.length > 0;

  const loopBrands = hasBrands
    ? [...brands, ...brands, ...brands]
    : [];

  const normalizeScroll = useCallback(
    (track: HTMLDivElement) => {
      const singleSetWidth =
        track.scrollWidth / 3;

      if (!singleSetWidth) return;

      if (
        track.scrollLeft >=
        singleSetWidth * 2
      ) {
        track.scrollLeft -=
          singleSetWidth;

        // FIX: if a wrap happens *while the user is actively
        // dragging*, the drag's "start scroll" reference also
        // needs to shift by the same amount — otherwise the very
        // next onPointerMove computes scrollLeft from a now-stale
        // reference and the carousel visibly jumps. This only
        // triggers when a drag happens to cross the loop boundary,
        // which is why the glitch felt random ("kabhi hota hai
        // kabhi nahi").
        if (isDragging.current) {
          dragStartScroll.current -=
            singleSetWidth;
        }
      }

      if (
        track.scrollLeft <= 0
      ) {
        track.scrollLeft +=
          singleSetWidth;

        if (isDragging.current) {
          dragStartScroll.current +=
            singleSetWidth;
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!hasBrands) return;

    const track = trackRef.current;

    if (!track) return;

    const speed = 2.0;

    const singleSetWidth =
      track.scrollWidth / 3;

    if (
      singleSetWidth > 0 &&
      track.scrollLeft === 0
    ) {
      track.scrollLeft =
        singleSetWidth;
    }

    const animate = () => {
      if (isDragging.current) {
        // Finger is actively down — onPointerMove is driving
        // scrollLeft directly, this loop should not touch it.
      } else if (
        Math.abs(
          momentumVelocityRef.current
        ) > 0.02
      ) {
        // Gliding to a stop after a flick, like native momentum
        // scrolling would.
        track.scrollLeft +=
          momentumVelocityRef.current *
          16;

        momentumVelocityRef.current *=
          0.94;

        normalizeScroll(track);
      } else {
        if (
          momentumVelocityRef.current !==
          0
        ) {
          // Momentum just settled to a stop — hand back to the
          // regular marquee after the usual short pause.
          momentumVelocityRef.current = 0;

          pauseThenResume();
        }

        if (!isPausedRef.current) {
          track.scrollLeft += speed;

          normalizeScroll(track);
        }
      }

      rafRef.current =
        requestAnimationFrame(
          animate
        );
    };

    rafRef.current =
      requestAnimationFrame(
        animate
      );

    return () => {
      if (
        rafRef.current !== null
      ) {
        cancelAnimationFrame(
          rafRef.current
        );

        rafRef.current = null;
      }
    };
  }, [
    hasBrands,
    normalizeScroll,
  ]);

  useEffect(() => {
    return () => {
      if (resumeTimeout.current) {
        clearTimeout(
          resumeTimeout.current
        );
      }
    };
  }, []);

  const pauseThenResume =
    useCallback(() => {
      isPausedRef.current = true;

      if (resumeTimeout.current) {
        clearTimeout(
          resumeTimeout.current
        );
      }

      resumeTimeout.current =
        setTimeout(() => {
          isPausedRef.current = false;
        }, 1200);
    }, []);

  const onPointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const track =
      trackRef.current;

    if (!track) return;

    // NOTE: we deliberately do NOT exclude drags that start on
    // top of a brand link/image here. A tap that never moves still
    // navigates normally (hasMoved stays false), while a real drag
    // — even one that starts right on an image — gets caught by
    // handleBrandClick below and has its click suppressed. Bailing
    // out early for links here was the reason scroll only worked
    // from the empty gaps between logos and not from the logos
    // themselves.

    isDragging.current = true;
    hasMoved.current = false;

    dragStartX.current =
      e.clientX;

    dragStartScroll.current =
      track.scrollLeft;

    // Cancel any momentum that was still gliding, and start
    // tracking velocity fresh for this new drag.
    momentumVelocityRef.current = 0;
    velocityRef.current = 0;
    lastPointerXRef.current =
      e.clientX;
    lastPointerTimeRef.current =
      performance.now();

    isPausedRef.current = true;

    track.setPointerCapture(
      e.pointerId
    );

    track.style.cursor =
      "grabbing";
  };

  const onPointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isDragging.current) {
      return;
    }

    const track =
      trackRef.current;

    if (!track) return;

    const distance =
      e.clientX -
      dragStartX.current;

    if (Math.abs(distance) > 8) {
      hasMoved.current = true;
    }

    track.scrollLeft =
      dragStartScroll.current -
      distance;

    normalizeScroll(track);

    // Sample instantaneous velocity (px scrolled per ms) and
    // low-pass filter it against the running value, so a single
    // jittery frame right before release doesn't cause a weird
    // flick. Sign is flipped because moving the finger right
    // (positive dx) decreases scrollLeft.
    const now = performance.now();
    const dt =
      now - lastPointerTimeRef.current ||
      16;
    const dx =
      e.clientX -
      lastPointerXRef.current;
    const instantVelocity =
      -dx / dt;

    velocityRef.current =
      velocityRef.current * 0.7 +
      instantVelocity * 0.3;

    lastPointerXRef.current =
      e.clientX;
    lastPointerTimeRef.current = now;
  };

  const onPointerUp = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const track =
      trackRef.current;

    if (!track) return;

    if (!isDragging.current) {
      return;
    }

    isDragging.current = false;

    track.style.cursor = "grab";

    try {
      if (
        track.hasPointerCapture(
          e.pointerId
        )
      ) {
        track.releasePointerCapture(
          e.pointerId
        );
      }
    } catch {}

    // Fast flick → glide to a stop under momentum (the RAF loop
    // in the effect above takes it from here and calls
    // pauseThenResume itself once it settles). Slow/no flick →
    // just pause-then-resume like before, no glide needed.
    if (
      Math.abs(velocityRef.current) >
      0.03
    ) {
      momentumVelocityRef.current =
        velocityRef.current;
    } else {
      pauseThenResume();
    }

    setTimeout(() => {
      hasMoved.current = false;
    }, 0);
  };

  const onPointerCancel = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const track =
      trackRef.current;

    if (!track) return;

    isDragging.current = false;

    track.style.cursor = "grab";

    try {
      if (
        track.hasPointerCapture(
          e.pointerId
        )
      ) {
        track.releasePointerCapture(
          e.pointerId
        );
      }
    } catch {}

    velocityRef.current = 0;
    momentumVelocityRef.current = 0;

    pauseThenResume();

    hasMoved.current = false;
  };

  const handleBrandClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();

      hasMoved.current = false;
    }
  };

  if (!hasBrands) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
      style={{
        background: SECTION_BG,
      }}
    >
      <div className="pointer-events-none absolute left-0 bottom-0 z-0 h-full w-full">
        <div
          className="absolute bottom-0 left-0 h-[45%] w-[45%]"
          style={{
            background:
              "radial-gradient(45% 70% at 0% 100%, rgba(214,178,132,0.32) 0%, rgba(214,178,132,0) 72%)",
          }}
        />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-black/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1440px]">
        <div className="mb-10 flex items-end justify-between gap-6 sm:mb-14 lg:mb-16">
          <div className="flex items-start gap-4 sm:gap-5">
            <span className="mt-2 hidden h-16 w-px shrink-0 bg-gradient-to-b from-[#9a7b3f] via-[#9a7b3f]/50 to-transparent sm:block" />

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/60 px-3.5 py-1.5 shadow-[0_4px_18px_rgba(36,26,20,0.04)] backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9a7b3f] shadow-[0_0_8px_rgba(154,123,63,0.35)]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#9a7b3f]">
                  Our Partners
                </span>
              </div>

              <h2 className="max-w-[700px] font-serif text-[2.25rem] leading-[0.98] tracking-[-0.04em] text-[#211710] sm:text-5xl lg:text-[4.1rem]">
                Explore{" "}
                <span className="italic text-[#9a7b3f]">
                  our brands.
                </span>
              </h2>

              <p className="mt-4 max-w-[520px] text-[11px] leading-[1.7] text-[#211710]/45 sm:text-xs">
                Discover the brands behind the products you trust.
              </p>
            </div>
          </div>

          <Link
            href="/brands"
            className="group hidden shrink-0 items-center gap-2 border-b border-[#211710]/20 pb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#211710] transition-all duration-300 hover:border-[#9a7b3f] hover:text-[#9a7b3f] sm:inline-flex"
          >
            View All Brands

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>

      <div className="relative z-10">
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onWheel={pauseThenResume}
          className="flex cursor-grab select-none gap-6 overflow-x-scroll px-5 pb-2 sm:gap-9 sm:px-8 lg:gap-11 lg:px-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            WebkitOverflowScrolling:
              "touch",
            // FIX: "pan-y" told mobile browsers to keep handling
            // horizontal gestures themselves, which made them treat a
            // sideways thumb-drag as ambiguous and cancel it before our
            // onPointerMove could take over — so drag worked with a
            // mouse (desktop) but not with a thumb (mobile). "none"
            // hands full control of the gesture to our pointer-event
            // handlers above, on both mouse and touch, so thumb-drag
            // now behaves exactly like the mouse-drag already did.
            touchAction: "none",
          }}
        >
          {loopBrands.map(
            (brand, index) => (
              <Link
                key={`${brand.id}-${index}`}
                href={`/shop?brand=${encodeURIComponent(
                  brand.slug
                )}`}
                onClick={
                  handleBrandClick
                }
                draggable={false}
                className="group flex shrink-0 flex-col items-center gap-3"
              >
                <div className="h-[110px] w-[110px] overflow-hidden rounded-full border border-black/[0.08] bg-white shadow-[0_10px_35px_rgba(36,26,20,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#9a7b3f]/30 group-hover:shadow-[0_18px_45px_rgba(154,123,63,0.16)] sm:h-[130px] sm:w-[130px] lg:h-[150px] lg:w-[150px]">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      draggable={false}
                      loading="lazy"
                      className="pointer-events-none h-full w-full object-cover"
                    />
                  ) : (
                    <span className="pointer-events-none flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#211710]/50 sm:text-xs">
                      {brand.name}
                    </span>
                  )}
                </div>

                <span className="max-w-[120px] truncate text-center text-[13px] font-extrabold tracking-[-0.01em] text-[#211710]/85 transition-all duration-300 group-hover:text-[#9a7b3f] sm:max-w-[140px] sm:text-[14px] lg:max-w-[155px] lg:text-[15px]">
                  {brand.name}
                </span>
              </Link>
            )
          )}
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-10 max-w-[1440px] sm:hidden">
        <Link
          href="/brands"
          className="group flex h-12 items-center justify-center gap-2 rounded-full border border-black/[0.09] bg-white text-[9px] font-bold uppercase tracking-[0.18em] text-[#211710]/70 shadow-[0_5px_18px_rgba(36,26,20,0.04)] transition-all duration-300 hover:border-[#9a7b3f]/40 hover:text-[#9a7b3f]"
        >
          View All Brands

          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}

export default BrandsOrbit;