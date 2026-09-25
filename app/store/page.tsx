import type { Metadata } from "next";
import StorePage from "../../components/store/StorePage";

export const metadata: Metadata = {
  title: "Our Store | Seven Bucks Nutrition",
  description:
    "Visit Seven Bucks Nutrition and discover our genuine sports nutrition supplements, store location, certifications, customer support, and more.",
};

export default function Page() {
  return <StorePage />;
}