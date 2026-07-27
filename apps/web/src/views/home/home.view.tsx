import { HeroSection } from "./components/hero-section";
import { FaqSection } from "./components/faq-section";
import { AboutSection } from "./components/about-section";
import { ProductsSection } from "./components/products-section";
import { SputterSection } from "./components/sputter-section";
import { ComparisonSection } from "./components/comparison-section";

export function HomeView() {
  return (
    <main className="overflow-x-hidden bg-gray-50 text-charcoal">
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <SputterSection />
      <ComparisonSection />

      <div className="flex min-h-screen flex-col justify-center bg-white">
        <FaqSection />
      </div>
    </main>
  );
}
