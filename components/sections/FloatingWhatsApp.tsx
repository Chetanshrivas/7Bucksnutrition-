"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const WHATSAPP_NUMBER = "919990797774";

const WHATSAPP_MESSAGE =
  "Hi, I need help with Seven Bucks Nutrition.";

const ALLOWED_PATHS = [
  "/",
  "/shop",
  "/brands",
  "/our-story",
  "/store",
  "/cart",
];

export default function FloatingWhatsApp() {
  const pathname = usePathname();

  const [isVisible, setIsVisible] =
    useState(false);

  const isAllowedPage =
    ALLOWED_PATHS.includes(pathname);

  useEffect(() => {
    if (!isAllowedPage) {
      setIsVisible(false);
      return;
    }

    const handleScroll = () => {
      const heroThreshold =
        window.innerHeight * 0.75;

      setIsVisible(
        window.scrollY > heroThreshold
      );
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [isAllowedPage]);

  if (!isAllowedPage) {
    return null;
  }

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}` +
    `?text=${encodeURIComponent(
      WHATSAPP_MESSAGE
    )}`;

  return (
    <>
      <style>{`
        @keyframes waPulseRing {
          0% { transform: scale(1); opacity: 0.55; }
          80% { transform: scale(1.55); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        .wa-pulse-ring {
          animation: waPulseRing 2.6s cubic-bezier(0.4, 0, 0.3, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .wa-pulse-ring { animation: none; }
        }
      `}</style>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Seven Bucks Nutrition on WhatsApp"
        className={`group fixed bottom-5 right-5 z-[100] flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500 ease-out hover:-translate-y-0.5 hover:scale-105 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-5 scale-75 opacity-0"
        }`}
      >
        {/* animated outer pulse */}
        <span className="wa-pulse-ring pointer-events-none absolute inset-0 rounded-full bg-[#25D366]" />

        {/* soft ambient glow */}
        <span className="pointer-events-none absolute -inset-2 rounded-full bg-[#25D366]/25 blur-xl transition-opacity duration-500 group-hover:opacity-80" />

        {/* main button body */}
        <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[linear-gradient(155deg,#34e278_0%,#20c25a_45%,#0f9e48_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-3px_6px_rgba(0,0,0,0.18),0_14px_32px_-10px_rgba(15,158,72,0.65)] ring-1 ring-white/25 transition-all duration-500 group-hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),inset_0_-3px_6px_rgba(0,0,0,0.2),0_18px_40px_-10px_rgba(15,158,72,0.8)]">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-7 w-7 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-110"
          >
            <path d="M20.52 3.48A11.85 11.85 0 0 0 12.08 0C5.55 0 .23 5.32.23 11.85c0 2.09.55 4.13 1.59 5.93L.13 24l6.37-1.67a11.82 11.82 0 0 0 5.58 1.42h.01c6.53 0 11.85-5.32 11.85-11.85 0-3.17-1.23-6.15-3.42-8.42ZM12.09 21.74h-.01a9.85 9.85 0 0 1-5.02-1.38l-.36-.21-3.78.99 1.01-3.68-.23-.38a9.86 9.86 0 0 1-1.51-5.23C2.19 6.42 6.62 1.99 12.09 1.99c2.65 0 5.14 1.03 7.01 2.9a9.86 9.86 0 0 1 2.9 7.02c0 5.46-4.44 9.83-9.91 9.83Zm5.4-7.37c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
          </svg>
        </span>
      </a>
    </>
  );
}