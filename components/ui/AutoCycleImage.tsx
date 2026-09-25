"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

interface AutoCycleImageProps {
  images: string[];
  alt: string;
  intervalMs?: number;
}

export function AutoCycleImage({
  images,
  alt,
  intervalMs = 900,
}: AutoCycleImageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

  const start = () => {
    if (images.length <= 1) return;
    setIsActive(true);
  };

  const stop = () => {
    setIsActive(false);
    setActiveIndex(0);
  };

  useEffect(() => {
    const imageElement = cardRef.current;

    if (!imageElement) return;

    const card = imageElement.closest("article");

    if (!card) return;

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      const target = event.target as Node | null;
      const related = event.relatedTarget as Node | null;

      if (related && target && target.contains(related)) return;

      start();
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      const related = event.relatedTarget as Node | null;

      if (related && card.contains(related)) return;

      stop();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        start();
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        stop();
      }
    };

    card.addEventListener("pointerover", handlePointerOver);
    card.addEventListener("pointerout", handlePointerOut);
    card.addEventListener("pointerdown", handlePointerDown);
    card.addEventListener("pointerup", handlePointerUp);
    card.addEventListener("pointercancel", handlePointerUp);

    return () => {
      card.removeEventListener("pointerover", handlePointerOver);
      card.removeEventListener("pointerout", handlePointerOut);
      card.removeEventListener("pointerdown", handlePointerDown);
      card.removeEventListener("pointerup", handlePointerUp);
      card.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [images.length]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      return;
    }

    intervalRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, images.length, intervalMs]);

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      start();
    }
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      stop();
    }
  };

  if (images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand/70 to-sand/30">
        <span className="font-serif text-2xl italic text-espresso/30">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className="relative h-full w-full touch-manipulation"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={alt}
          draggable={false}
          className={`absolute inset-0 h-full w-full scale-105 object-cover transition-opacity duration-500 ease-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {images.length > 1 && (
        <div
          className={`pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 transition-opacity duration-300 ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        >
          {images.map((_, index) => (
            <span
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-4 bg-white" : "w-1 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {images.length > 1 && !isActive && (
        <span className="pointer-events-none absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-espresso/40 text-ivory backdrop-blur-sm">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </span>
      )}
    </div>
  );
}