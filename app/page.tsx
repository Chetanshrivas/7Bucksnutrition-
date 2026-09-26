import { Hero } from "../components/sections/Hero";
import { TrustMarquee } from "../components/sections/TrustMarquee";
import { Standards } from "../components/sections/Standards";
import { StatsBand } from "../components/sections/StatsBand";
import { Categories } from "../components/sections/Categories";
import { FeaturedProducts } from "../components/sections/FeaturedProducts";
import { BrandsOrbit } from "../components/sections/BrandsOrbit";
import { MoreOfWhatMatters } from "../components/sections/MoreOfWhatMatters";
import { FindYourProtein } from "../components/sections/FindYourProtein";
import { ProductBanner } from "../components/sections/ProductBanner";
import { HowItWorks } from "../components/sections/HowItWorks";
import { SplitStory } from "../components/sections/SplitStory";
import { Reviews } from "../components/sections/Reviews";
import { FAQ } from "../components/sections/FAQ";
import { FinalCTA } from "../components/sections/FinalCTA";
import AutoImageShowcase from "../components/sections/AutoImageShowcase";

import {
  getFeaturedProducts,
  getBrands,
} from "../lib/products";

export const revalidate = 120;

export default async function Home() {
  const products = await getFeaturedProducts(8);
  const brands = await getBrands();

  return (
    <main>
      <Hero />

      <TrustMarquee />

      <Categories />

      <FeaturedProducts products={products} />

      <BrandsOrbit brands={brands} />
      

      <FindYourProtein />

      <MoreOfWhatMatters />

     

      {/* <ProductBanner /> */}

      {/* <ShopByGoal /> */}

      {/* <Standards /> */}

      <StatsBand />

      <AutoImageShowcase />

      {/* <HowItWorks /> */}

      {/* <SplitStory /> */}

      <Reviews />

      <FAQ />

      {/* <FinalCTA /> */}
    </main>
  );
}