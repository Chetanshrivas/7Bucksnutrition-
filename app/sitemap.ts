import type { MetadataRoute } from "next";

import { getCategories, getBrands } from "../lib/products";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://7bucksnutrition.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/shop`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/brands`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/our-story`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/store`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => category.is_active)
    .map((category) => ({
      url: `${SITE_URL}/shop?category=${encodeURIComponent(
        category.slug
      )}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const brandRoutes: MetadataRoute.Sitemap = brands.map(
    (brand) => ({
      url: `${SITE_URL}/shop?brand=${encodeURIComponent(
        brand.slug
      )}`,
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  return [...staticRoutes, ...categoryRoutes, ...brandRoutes];
}