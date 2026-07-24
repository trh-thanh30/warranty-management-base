import { HeroSection } from "./components/hero-section";
import { FaqSection } from "./components/faq-section";
import { AboutSection } from "./components/about-section";
import { ProductsSection } from "./components/products-section";
import { AdditionalProductsSection } from "./components/additional-products-section";
import { SputterSection } from "./components/sputter-section";
import { ComparisonSection } from "./components/comparison-section";
import { GallerySection } from "./components/gallery-section";

export function HomeView() {
  return (
    <main className="overflow-x-hidden bg-white text-charcoal">
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <AdditionalProductsSection />
      <SputterSection />
      <ComparisonSection />
      <GallerySection />

      <div className="flex min-h-screen flex-col justify-center bg-ash">
        <FaqSection />
      </div>
    </main>
  );
}
