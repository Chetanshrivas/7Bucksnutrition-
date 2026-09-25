import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://7bucksnutrition.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/account",
          "/admin",
          "/api/",
          "/order-success",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}