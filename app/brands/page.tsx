import type { Metadata } from "next";
import BrandsPage from "../../components/brands/BrandsPage";

export const metadata: Metadata = {
  title: "Brands | Seven Bucks Nutrition",
  description:
    "Explore trusted nutrition and supplement brands available at Seven Bucks Nutrition.",
};

export default function Brands() {
  return <BrandsPage />;
}