import type { Metadata } from "next";
import OurStoryPage from "../../components/our-story/OurStoryPage";

export const metadata: Metadata = {
  title: "Our Story | Seven Bucks Nutrition",
  description:
    "Discover the philosophy, standards, and purpose behind Seven Bucks Nutrition.",
};

export default function Page() {
  return <OurStoryPage />;
}