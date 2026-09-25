// =========================================================
// FILE: components/store/StorePage.tsx
//
// Copy this entire file and paste it into:
// components/store/StorePage.tsx
//
// (Replace the existing file completely)
// =========================================================

"use client";

import { useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type GalleryImage = {
  id: number;
  src: string;
  alt: string;
};

type Certificate = {
  id: number;
  title: string;
  subtitle: string;
  src: string;
};

/* =========================================================
   ICONS
========================================================= */

function ArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function BarcodeIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 5v14" />
      <path d="M7 5v14" />
      <path d="M10 5v14" />
      <path d="M14 5v14" />
      <path d="M17 5v14" />
      <path d="M20 5v14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 8.7 3.9a8.38 8.38 0 0 1 3.8-.9h.5A8.48 8.48 0 0 1 21 11Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/* =========================================================
   STORE GALLERY

   Images inside: public/store/
   Example: public/store/store-1.jpg
========================================================= */

const storeGallery: GalleryImage[] = [
  {
    id: 1,
    src: "/store/store-1.jpg",
    alt: "Seven Bucks Nutrition store exterior",
  },
  {
    id: 2,
    src: "/store/store-2.jpg",
    alt: "Seven Bucks Nutrition store interior",
  },
  {
    id: 3,
    src: "/store/store-3.jpg",
    alt: "Nutrition products display",
  },
  {
    id: 4,
    src: "/store/store-4.jpg",
    alt: "Sports nutrition products",
  },
  {
    id: 5,
    src: "/store/store-5.jpg",
    alt: "Seven Bucks Nutrition store",
  },
];

/* =========================================================
   CERTIFICATES

   Images inside: public/store/certificates/
   Example: public/store/certificates/certificate-1.jpg
========================================================= */

const certificates: Certificate[] = [
  {
    id: 1,
    title: "Certificate of Authenticity",
    subtitle: "Product & sourcing standards",
    src: "/store/certificate-1.jpg",
  },
  {
    id: 2,
    title: "Quality Certification",
    subtitle: "Quality & compliance",
    src: "/store/certificate-2.jpg",
  },
  {
    id: 3,
    title: "Business Credentials",
    subtitle: "Verified business documentation",
    src: "/store/certificate-3.jpg",
  },
  {
    id: 4,
    title: "Store Credentials",
    subtitle: "Our business standards",
    src: "/store/certificate-4.jpg",
  },
];

/* =========================================================
   PRODUCT CATEGORIES
========================================================= */

const productCategories = [
  "Whey Protein",
  "Mass Gainers",
  "Creatine",
  "Plant Protein",
  "Pre-Workout",
  "Vitamins & Wellness",
  "Weight Management",
  "Recovery & Performance",
];

/* =========================================================
   TRUST POINTS
========================================================= */

const trustPoints = [
  {
    icon: <ShieldIcon />,
    title: "Genuine Products",
    description:
      "We deal in authentic nutrition products and do not compromise on product quality.",
  },
  {
    icon: <BarcodeIcon />,
    title: "Barcode Verification",
    description:
      "Original product packaging and barcode details help you verify what you purchase.",
  },
  {
    icon: <CheckIcon />,
    title: "Replacement Support",
    description:
      "If a product does not meet our authenticity standards, contact us for replacement support.",
  },
  {
    icon: <SparkIcon />,
    title: "Expert Assistance",
    description:
      "Need help choosing? Our team can help you explore products according to your goals.",
  },
];

/* =========================================================
   STORE DETAILS
========================================================= */

const STORE_PHONE = "+919990797774";
const STORE_PHONE_DISPLAY = "+91 99907 97774";
const STORE_WHATSAPP = "919990797774";
const STORE_EMAIL = "sevenbucksnutrition@gmail.com";

const STORE_ADDRESS_LINE_1 = "SCF No. 48 & 50, Shop No. 6";
const STORE_ADDRESS_LINE_2 = "Baldev Plaza, Sector 15";
const STORE_ADDRESS_LINE_3 = "Faridabad — 121007, Haryana";

const GOOGLE_MAPS_EMBED_URL =
  "https://maps.google.com/maps?q=28.395118,77.323254&hl=en&z=17&output=embed";

const GOOGLE_MAPS_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=28.395118,77.323254&destination_place_id=Seven+Bucks+Nutrition";

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StorePage() {
  const [activeImage, setActiveImage] = useState<number>(0);

  const [lightboxImage, setLightboxImage] =
    useState<GalleryImage | null>(null);

  const [certificateImage, setCertificateImage] =
    useState<Certificate | null>(null);

  const currentStoreImage = storeGallery[activeImage]!;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f2eb] text-[#171512]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="border-b border-black/[0.08] px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-36 lg:px-12 lg:pb-28 lg:pt-40">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-black/35 sm:mb-14">
            <a
              href="/"
              className="transition-colors hover:text-black"
            >
              Home
            </a>

            <span>/</span>

            <span className="text-black/70">Our Store</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-20">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#a27d37]/20 bg-[#a27d37]/[0.06] px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a27d37]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#a27d37]">
                  Seven Bucks Nutrition
                </p>
              </div>

              <h1 className="max-w-[1000px] text-[clamp(44px,7.5vw,108px)] font-semibold leading-[0.88] tracking-[-0.065em]">
                Visit our
                <br />
                <span className="font-serif italic text-[#a27d37]">
                  store.
                </span>
              </h1>
            </div>

            <div className="max-w-[460px] lg:ml-auto">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-[#a27d37]/25 bg-[#a27d37]/10 text-[#a27d37]">
                <MapPinIcon />
              </div>

              <p className="text-[14px] leading-[1.8] text-black/60 sm:text-base">
                Your destination for genuine sports nutrition,
                supplements, performance products, wellness essentials,
                and expert assistance — all under one roof.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#store-location"
                  className="inline-flex items-center gap-3 rounded-full bg-[#171512] px-6 py-3.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Find Our Store
                  <ArrowRight />
                </a>

                <a
                  href={`https://wa.me/${STORE_WHATSAPP}?text=Hi%2C%20I%20want%20to%20know%20more%20about%20your%20products.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-6 py-3.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#128C7E] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#25D366]/20"
                >
                  <WhatsAppIcon />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-4 sm:mt-20 lg:mt-24">
            <span className="h-px flex-1 bg-black/10" />

            <span className="font-serif text-xs italic text-black/25">
              Genuine nutrition. Real support.
            </span>

            <span className="h-px w-16 bg-black/10 sm:w-28" />
          </div>
        </div>
      </section>

      {/* =====================================================
          STORE GALLERY
      ===================================================== */}

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#a27d37]">
                Step inside
              </p>

              <h2 className="mt-3 text-[clamp(34px,5vw,62px)] font-semibold leading-none tracking-[-0.055em]">
                Our
                <span className="font-serif italic text-[#a27d37]">
                  {" "}store.
                </span>
              </h2>
            </div>

            <p className="max-w-[390px] text-[11px] leading-[1.7] text-black/40">
              Take a look around our store and explore the environment
              where we help customers find the right nutrition for their
              goals.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_190px]">
            {/* Main store image */}
            <button
              type="button"
              onClick={() => setLightboxImage(currentStoreImage)}
              className="group relative aspect-[16/10] overflow-hidden rounded-[24px] bg-black text-left sm:aspect-[16/9]"
              aria-label="Open store image"
            >
              <img
                src={currentStoreImage.src}
                alt={currentStoreImage.alt}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white sm:bottom-7 sm:left-7 sm:right-7">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/55">
                    Store Gallery
                  </p>

                  <p className="mt-1.5 text-sm font-medium">
                    {currentStoreImage.alt}
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/20 backdrop-blur-md transition-transform group-hover:scale-110">
                  <ArrowUpRight />
                </span>
              </div>
            </button>

            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2 lg:grid-cols-1 lg:grid-rows-5">
              {storeGallery.map((image, index) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() => setActiveImage(index)}
                  className={`group relative overflow-hidden rounded-xl bg-black transition-all duration-300 ${
                    activeImage === index
                      ? "ring-2 ring-[#a27d37] ring-offset-2 ring-offset-[#f5f2eb]"
                      : "hover:ring-1 hover:ring-black/20"
                  }`}
                  aria-label={`View store image ${index + 1}`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full min-h-[70px] w-full object-cover transition duration-500 group-hover:scale-105 lg:min-h-0"
                  />

                  <span
                    className={`absolute inset-0 transition duration-300 ${
                      activeImage === index
                        ? "bg-black/5"
                        : "bg-black/30 group-hover:bg-black/10"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT STORE
      ===================================================== */}

      <section className="border-y border-black/[0.08] bg-[#eeebe3] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#a27d37]">
                More than a supplement store
              </p>

              <div className="mt-5 h-px w-16 bg-[#a27d37]/50" />
            </div>

            <div>
              <h2 className="max-w-[950px] text-[clamp(32px,5vw,66px)] font-semibold leading-[0.96] tracking-[-0.055em]">
                Everything you need for
                <span className="font-serif italic text-[#a27d37]">
                  {" "}better nutrition.
                </span>
              </h2>

              <div className="mt-8 grid gap-6 text-[13px] leading-[1.85] text-black/50 sm:grid-cols-2 sm:gap-10 lg:mt-10">
                <p>
                  Seven Bucks Nutrition brings together a wide range of
                  sports nutrition and wellness products for people who
                  train, perform, recover, and simply want to take better
                  care of their everyday nutrition.
                </p>

                <p>
                  From protein and creatine to mass gainers, vitamins,
                  recovery products, weight-management supplements, and
                  more, our goal is to make finding the right product
                  simpler.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:mt-12 lg:grid-cols-4">
                {productCategories.map((category, index) => (
                  <div
                    key={category}
                    className="rounded-xl border border-black/[0.08] bg-white/45 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#a27d37]/30 hover:bg-white hover:shadow-sm"
                  >
                    <span className="font-serif text-[11px] italic text-[#a27d37]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="mt-3 text-[11px] font-semibold leading-4">
                      {category}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          AUTHENTICITY / TRUST
      ===================================================== */}

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="relative overflow-hidden rounded-[28px] bg-[#171512] px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            {/* Decorative rings */}
            <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/[0.06]" />
            <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full border border-[#a27d37]/20" />

            <div className="relative">
              <div className="max-w-[800px]">
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#b89552]">
                  Our promise
                </p>

                <h2 className="mt-5 text-[clamp(34px,5vw,70px)] font-semibold leading-[0.93] tracking-[-0.06em]">
                  Authenticity is
                  <br />
                  <span className="font-serif italic text-[#b89552]">
                    non-negotiable.
                  </span>
                </h2>

                <p className="mt-7 max-w-[700px] text-[13px] leading-[1.85] text-white/50">
                  We believe you should know exactly what you are buying.
                  Seven Bucks Nutrition is committed to offering genuine
                  products and giving customers the confidence to verify
                  their products through original packaging and barcode
                  information.
                </p>
              </div>

              <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
                {trustPoints.map((point) => (
                  <div
                    key={point.title}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b89552]/30 hover:bg-white/[0.055]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b89552]/10 text-[#b89552]">
                      {point.icon}
                    </div>

                    <h3 className="mt-6 text-[13px] font-semibold">
                      {point.title}
                    </h3>

                    <p className="mt-2.5 text-[10px] leading-[1.7] text-white/35">
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-[#b89552]/20 bg-[#b89552]/[0.06] p-5 sm:p-6">
                <div className="flex gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b89552] text-[#171512]">
                    <CheckIcon />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#b89552]">
                      Product confidence
                    </p>

                    <p className="mt-2.5 max-w-[850px] text-[11px] leading-[1.8] text-white/50">
                      If you ever believe a product you received does not
                      meet our authenticity standards, contact our team
                      with the relevant product and purchase details. We
                      will review the concern and assist according to our
                      applicable replacement policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STORE LOCATION — REAL GOOGLE MAPS EMBED
      ===================================================== */}

      <section
        id="store-location"
        className="scroll-mt-24 border-y border-black/[0.08] bg-[#eeebe3] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#a27d37]">
                Come visit us
              </p>

              <h2 className="mt-4 text-[clamp(34px,4vw,58px)] font-semibold leading-[0.95] tracking-[-0.055em]">
                Find us
                <span className="font-serif italic text-[#a27d37]">
                  {" "}here.
                </span>
              </h2>

              <p className="mt-6 max-w-[420px] text-[12px] leading-[1.8] text-black/40">
                Visit our store, explore our range, and speak with our
                team if you need help finding the right nutrition products.
              </p>

              <div className="mt-10 space-y-6">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37]">
                    <MapPinIcon />
                  </div>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/30">
                      Store Address
                    </p>

                    <p className="mt-1.5 max-w-[300px] text-[12px] font-semibold leading-[1.7]">
                      {STORE_ADDRESS_LINE_1}
                      <br />
                      {STORE_ADDRESS_LINE_2}
                      <br />
                      {STORE_ADDRESS_LINE_3}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37]">
                    <PhoneIcon />
                  </div>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/30">
                      Call Us
                    </p>

                    <a
                      href={`tel:${STORE_PHONE}`}
                      className="mt-1.5 block text-[12px] font-semibold transition-colors hover:text-[#a27d37]"
                    >
                      {STORE_PHONE_DISPLAY}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10 text-[#128C7E]">
                    <WhatsAppIcon />
                  </div>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/30">
                      WhatsApp
                    </p>

                    <a
                      href={`https://wa.me/${STORE_WHATSAPP}?text=Hi%2C%20I%20want%20to%20know%20more%20about%20your%20products.`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 block text-[12px] font-semibold transition-colors hover:text-[#128C7E]"
                    >
                      {STORE_PHONE_DISPLAY}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37]">
                    <ClockIcon />
                  </div>

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/30">
                      Store Hours
                    </p>

                    <p className="mt-1.5 text-[12px] font-semibold leading-[1.7]">
                      Monday – Sunday
                      <br />
                      10:00 AM – 9:00 PM
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={GOOGLE_MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#171512] px-6 py-3.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Get Directions
                <ArrowUpRight />
              </a>
            </div>

            {/* Google Maps — Real Embed */}
            <div className="relative min-h-[420px] overflow-hidden rounded-[26px] bg-[#d8d2c5] lg:min-h-[520px]">
              <iframe
                src={GOOGLE_MAPS_EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "420px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Seven Bucks Nutrition — Store Location"
                className="absolute inset-0 h-full w-full rounded-[26px]"
              />

              {/* Bottom overlay bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 p-4 backdrop-blur-xl sm:bottom-5 sm:left-5 sm:right-5">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/35">
                    Location
                  </p>

                  <p className="mt-1 text-[11px] font-semibold">
                    Seven Bucks Nutrition — Sector 15, Faridabad
                  </p>
                </div>

                <a
                  href={GOOGLE_MAPS_DIRECTIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#171512] text-white transition-transform hover:scale-105"
                  aria-label="Open Google Maps"
                >
                  <ArrowUpRight />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CERTIFICATES
      ===================================================== */}

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#a27d37]">
                Trust & credentials
              </p>

              <h2 className="mt-3 text-[clamp(34px,5vw,62px)] font-semibold leading-none tracking-[-0.055em]">
                Our
                <span className="font-serif italic text-[#a27d37]">
                  {" "}certificates.
                </span>
              </h2>
            </div>

            <p className="max-w-[390px] text-[11px] leading-[1.7] text-black/40">
              We believe trust should be supported by transparency. This
              section is dedicated to our certificates, credentials, and
              documentation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {certificates.map((certificate) => (
              <button
                type="button"
                key={certificate.id}
                onClick={() => setCertificateImage(certificate)}
                className="group overflow-hidden rounded-[18px] border border-black/[0.08] bg-white/50 text-left transition-all duration-300 hover:-translate-y-1 hover:border-black/15 hover:bg-white hover:shadow-md sm:rounded-[20px]"
              >
                <div className="aspect-[4/5] overflow-hidden bg-[#e6e1d7]">
                  <img
                    src={certificate.src}
                    alt={certificate.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="p-3.5 sm:p-5">
                  <p className="text-[11px] font-semibold sm:text-[12px]">
                    {certificate.title}
                  </p>

                  <div className="mt-2 flex items-center justify-between sm:mt-2.5">
                    <p className="text-[8px] uppercase tracking-[0.1em] text-black/35 sm:text-[9px] sm:tracking-[0.12em]">
                      {certificate.subtitle}
                    </p>

                    <span className="text-[#a27d37] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          HELP DESK
      ===================================================== */}

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-[28px] border border-black/[0.08] bg-[#e9e4d9] px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37]">
                  <MessageIcon />
                </div>

                <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.25em] text-[#a27d37]">
                  Help desk
                </p>

                <h2 className="mt-3 max-w-[700px] text-[clamp(30px,4vw,54px)] font-semibold leading-[0.95] tracking-[-0.055em]">
                  Not sure what
                  <span className="font-serif italic text-[#a27d37]">
                    {" "}fits you?
                  </span>
                </h2>

                <p className="mt-5 max-w-[600px] text-[12px] leading-[1.8] text-black/40">
                  Whether you are looking for your first protein, comparing
                  creatine products, building a recovery routine, or simply
                  have a question, our team is here to help.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href={`tel:${STORE_PHONE}`}
                  className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#171512] px-7 text-[9px] font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Call Our Team
                  <PhoneIcon />
                </a>

                <a
                  href={`https://wa.me/${STORE_WHATSAPP}?text=Hi%2C%20I%20need%20help%20choosing%20the%20right%20product.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-7 text-[9px] font-bold uppercase tracking-[0.16em] text-[#128C7E] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#25D366]/20"
                >
                  <WhatsAppIcon />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT — DETAILS ONLY
      ===================================================== */}

      <section
        id="contact"
        className="border-t border-black/[0.08] bg-[#171512] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12 lg:py-28"
      >
        <div className="mx-auto max-w-[1440px]">
          {/* Section heading */}
          <div className="mb-12 max-w-[700px] lg:mb-16">
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#b89552]">
              Get in touch
            </p>

            <h2 className="mt-4 text-[clamp(36px,5vw,66px)] font-semibold leading-[0.92] tracking-[-0.06em]">
              Let&apos;s talk
              <span className="font-serif italic text-[#b89552]">
                {" "}nutrition.
              </span>
            </h2>

            <p className="mt-6 max-w-[520px] text-[13px] leading-[1.85] text-white/40">
              Have a question about a product, your order, or our store?
              Reach out through any of the channels below — our team is
              always happy to help.
            </p>
          </div>

          {/* Contact cards grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Phone */}
            <a
              href={`tel:${STORE_PHONE}`}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#b89552]/30 hover:bg-white/[0.06]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b89552]/10 text-[#b89552] transition-transform duration-300 group-hover:scale-110">
                <PhoneIcon />
              </div>

              <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                Call Us
              </p>

              <p className="mt-2 text-[15px] font-semibold tracking-[-0.01em]">
                {STORE_PHONE_DISPLAY}
              </p>

              <p className="mt-2 text-[10px] leading-[1.6] text-white/30">
                Mon – Sun · 10 AM – 9 PM
              </p>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${STORE_WHATSAPP}?text=Hi%2C%20I%20want%20to%20know%20more%20about%20your%20products.`}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#25D366]/30 hover:bg-white/[0.06]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition-transform duration-300 group-hover:scale-110">
                <WhatsAppIcon />
              </div>

              <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                WhatsApp
              </p>

              <p className="mt-2 text-[15px] font-semibold tracking-[-0.01em]">
                {STORE_PHONE_DISPLAY}
              </p>

              <p className="mt-2 text-[10px] leading-[1.6] text-white/30">
                Tap to chat · Quick replies
              </p>
            </a>

            {/* Email */}
            <a
              href={`mailto:${STORE_EMAIL}`}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#b89552]/30 hover:bg-white/[0.06]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b89552]/10 text-[#b89552] transition-transform duration-300 group-hover:scale-110">
                <MailIcon />
              </div>

              <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                Email
              </p>

              <p className="mt-2 text-[14px] font-semibold tracking-[-0.01em] break-all">
                {STORE_EMAIL}
              </p>

              <p className="mt-2 text-[10px] leading-[1.6] text-white/30">
                We reply within 24 hours
              </p>
            </a>

            {/* Store visit */}
            <a
              href={GOOGLE_MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#b89552]/30 hover:bg-white/[0.06]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b89552]/10 text-[#b89552] transition-transform duration-300 group-hover:scale-110">
                <MapPinIcon />
              </div>

              <p className="mt-6 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                Visit Store
              </p>

              <p className="mt-2 text-[13px] font-semibold leading-[1.5]">
                {STORE_ADDRESS_LINE_1}
              </p>

              <p className="mt-1.5 text-[10px] leading-[1.6] text-white/30">
                {STORE_ADDRESS_LINE_2} · {STORE_ADDRESS_LINE_3}
              </p>
            </a>
          </div>

          {/* Bottom accent bar */}
          <div className="mt-12 flex flex-col items-center gap-5 rounded-2xl border border-[#b89552]/15 bg-[#b89552]/[0.05] px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left lg:mt-14 lg:px-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#b89552]">
                Need personalized help?
              </p>

              <p className="mt-2 max-w-[480px] text-[11px] leading-[1.7] text-white/40">
                Not sure which product is right for you? Chat with us on
                WhatsApp or call us — our team will guide you based on
                your fitness goals.
              </p>
            </div>

            <div className="flex shrink-0 gap-3">
              <a
                href={`https://wa.me/${STORE_WHATSAPP}?text=Hi%2C%20I%20need%20help%20choosing%20the%20right%20supplement.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2.5 rounded-full bg-[#25D366] px-6 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <WhatsAppIcon />
                Chat Now
              </a>

              <a
                href={`tel:${STORE_PHONE}`}
                className="inline-flex h-11 items-center gap-2.5 rounded-full border border-white/15 px-6 text-[9px] font-bold uppercase tracking-[0.14em] text-white/70 transition-all duration-300 hover:border-white/25 hover:text-white"
              >
                <PhoneIcon />
                Call
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="bg-[#171512] px-5 pb-10 text-white sm:px-8 sm:pb-12 lg:px-12 lg:pb-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#211f1b] px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#b89552]/10" />

            <div className="relative">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#b89552]">
                See you at the store
              </p>

              <h2 className="mt-5 max-w-[800px] text-[clamp(34px,6vw,76px)] font-semibold leading-[0.9] tracking-[-0.065em]">
                Your goals.
                <br />
                <span className="font-serif italic text-[#b89552]">
                  Your nutrition.
                </span>
              </h2>

              <p className="mt-6 max-w-[520px] text-[12px] leading-[1.8] text-white/35">
                Explore our collection online or visit us in store. We are
                here to make your nutrition journey simpler.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/shop"
                  className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-white px-7 text-[9px] font-bold uppercase tracking-[0.16em] text-[#171512] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f5f2eb] hover:shadow-lg"
                >
                  Shop Collection
                  <ArrowRight />
                </a>

                <a
                  href="#store-location"
                  className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-7 text-[9px] font-bold uppercase tracking-[0.16em] text-white/60 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  Get Directions
                  <ArrowUpRight />
                </a>

                <a
                  href={`https://wa.me/${STORE_WHATSAPP}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#25D366]/20 bg-[#25D366]/[0.06] px-7 text-[9px] font-bold uppercase tracking-[0.16em] text-[#25D366]/70 transition-all duration-300 hover:border-[#25D366]/30 hover:bg-[#25D366]/10 hover:text-[#25D366]"
                >
                  <WhatsAppIcon />
                  Chat Now
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-1 pt-7 text-[8px] font-bold uppercase tracking-[0.2em] text-white/20 sm:flex-row sm:items-center sm:justify-between">
            <span>Seven Bucks Nutrition</span>

            <span>Genuine nutrition. Real support.</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          STORE IMAGE LIGHTBOX
      ===================================================== */}

      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Store image preview"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            aria-label="Close image preview"
          >
            <CloseIcon />
          </button>

          <div
            className="relative max-h-[90vh] max-w-[1200px]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain"
            />

            <p className="mt-4 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-white/50">
              {lightboxImage.alt}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          CERTIFICATE LIGHTBOX
      ===================================================== */}

      {certificateImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Certificate preview"
          onClick={() => setCertificateImage(null)}
        >
          <button
            type="button"
            onClick={() => setCertificateImage(null)}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            aria-label="Close certificate preview"
          >
            <CloseIcon />
          </button>

          <div
            className="relative max-h-[90vh] max-w-[900px]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={certificateImage.src}
              alt={certificateImage.title}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain"
            />

            <div className="mt-4 text-center">
              <p className="text-[11px] font-semibold text-white">
                {certificateImage.title}
              </p>

              <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/40">
                {certificateImage.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}