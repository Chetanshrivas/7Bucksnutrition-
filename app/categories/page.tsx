import CategoriesPage from "../../components/category/CategoriesPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories | Your Brand",
  description:
    "Explore all product categories and find the right products for your needs.",
};

export default function CategoryPage() {
  return <CategoriesPage />;
}