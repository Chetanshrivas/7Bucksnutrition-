import type { Metadata } from "next";
import {
  Instrument_Serif,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { Toaster } from "sonner";

import { StorefrontShell } from "../components/layout/StorefrontShell";
import { AuthProvider } from "../components/auth/AuthProvider";

import  FloatingWhatsApp  from "../components/sections/FloatingWhatsApp";

import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://7bucksnutrition.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      "Seven Bucks Nutrition — Lab-Tested Supplements for Serious Lifters",
    template: "%s | Seven Bucks Nutrition",
  },

  description:
    "Authorised stockists of MuscleTech, MuscleBlaze, Labrada, Kevin Levrone and 40+ brands. Every tub hologram-verified before it ships. Store in Sector 15, Faridabad.",

  keywords: [
    "sports nutrition Faridabad",
    "whey protein India",
    "genuine supplements",
    "creatine",
    "pre-workout",
    "Seven Bucks Nutrition",
  ],

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Seven Bucks Nutrition",
    title:
      "Seven Bucks Nutrition — Lab-Tested Supplements for Serious Lifters",
    description:
      "Authorised stockists of trusted sports-nutrition brands. Every tub hologram-verified before it ships.",
    url: SITE_URL,
  },

  twitter: {
    card: "summary_large_image",
    title: "Seven Bucks Nutrition",
    description:
      "Lab-tested, hologram-verified sports nutrition. Faridabad, India.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${instrumentSerif.variable} ${plusJakarta.variable}`}
    >
      <body className="bg-background font-sans text-foreground antialiased">
        <AuthProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </AuthProvider>

        <Toaster position="top-right" />

         <FloatingWhatsApp />
      </body>
    </html>
  );
}