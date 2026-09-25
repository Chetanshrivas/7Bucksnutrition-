import type { Metadata } from "next";
import ShopPage from "../../components/shop/ShopPage";

export const metadata: Metadata = {
  title: "Shop Supplements | Seven Bucks Nutrition",
  description:
    "Shop premium sports nutrition, protein, creatine, pre-workout, mass gainers and supplements from trusted brands at Seven Bucks Nutrition.",
};

export default function Page() {
  return <ShopPage />;
}