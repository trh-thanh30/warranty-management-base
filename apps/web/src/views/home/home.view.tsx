import { HeroSection } from "./components/hero-section";
import { FaqSection } from "./components/faq-section";
import { AboutSection } from "./components/about-section";
import { ProductsSection } from "./components/products-section";
import { SputterSection } from "./components/sputter-section";
import { ComparisonSection } from "./components/comparison-section";
import { getPublicWebsiteSiteSetting } from "@/src/services/website-config.service";
import type { WebsiteLocale } from "@repo/shared";
import { resolveWebsiteHeroSlides } from "@repo/shared/utils";

export async function HomeView({
  params,
}: {
  params: Promise<{ locale: WebsiteLocale }>;
}) {
  const { locale } = await params;
  const site = await getPublicWebsiteSiteSetting(locale);
  const heroSlides = resolveWebsiteHeroSlides(site?.heroSlides);
  const desktopHeroImages = heroSlides.desktop.map((slide) => ({
    id: slide.key,
    src: slide.url,
  }));
  const mobileHeroImages = heroSlides.mobile.map((slide) => ({
    id: slide.key,
    src: slide.url,
  }));

  return (
    <main className="overflow-x-hidden bg-gray-50 text-charcoal">
      <HeroSection
        desktopImages={desktopHeroImages}
        mobileImages={mobileHeroImages}
      />
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
