import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetail from "../../../components/product/ProductDetail";
import { getProductBySlug } from "../../../lib/products";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title:
        "Product Not Found | Seven Bucks Nutrition",
    };
  }

  return {
    title: `${product.name} | Seven Bucks Nutrition`,

    description:
      product.shortDescription ||
      product.subtitle ||
      `${product.name} by ${product.brand}. Shop trusted sports nutrition at Seven Bucks Nutrition.`,
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const product =
    await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetail product={product} />
  );
}