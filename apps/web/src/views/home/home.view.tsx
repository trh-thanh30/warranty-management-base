import { HeroSection } from "./components/hero-section";
import { FaqSection } from "./components/faq-section";
import { AboutSection } from "./components/about-section";
import { ProductsSection } from "./components/products-section";
import { SputterSection } from "./components/sputter-section";
import { ComparisonSection } from "./components/comparison-section";
import { getPublishedContentPage } from "@/src/services/content-pages.service";
import { FAQ_CONTENT_PAGE_SLUG } from "./home.constants";

export async function HomeView() {
  const faqPage = await getPublishedContentPage(FAQ_CONTENT_PAGE_SLUG);

  return (
    <main className="overflow-x-hidden bg-gray-50 text-charcoal">
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <SputterSection />
      <ComparisonSection />

      <div className="flex min-h-screen flex-col justify-center bg-white">
        <FaqSection page={faqPage} />
      </div>
    </main>
  );
}
