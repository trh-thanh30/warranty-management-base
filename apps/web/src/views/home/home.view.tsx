import { HeroSection } from "./components/hero-section";
import { FaqSection } from "./components/faq-section";
import { AboutSection } from "./components/about-section";
import { ProductsSection } from "./components/products-section";
import { SputterSection } from "./components/sputter-section";
import { ComparisonSection } from "./components/comparison-section";
import { getCachedSiteSetting } from "@/src/services/website-config/website-config.service";
import { productCategoriesService } from "@/src/services/product-categories/product-categories.service";
import { contentPagesService } from "@/src/services/content-pages/content-pages.service";
import type { WebsiteLocale } from "@repo/shared";
import { resolveWebsiteHeroSlides } from "@repo/shared/utils";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import {
  FAQ_CONTENT_PAGE_SLUG,
  HOME_PRODUCT_CATEGORY_BATCH_SIZE,
} from "./home.constants";
import {
  HomeFaqSkeleton,
  HomeHeroSkeleton,
  HomeProductsSkeleton,
} from "./components/home-loading-sections";

const getCachedHomeProductCategories = unstable_cache(
  () =>
    productCategoriesService.listProductCategories({
      page: 1,
      limit: HOME_PRODUCT_CATEGORY_BATCH_SIZE,
      hasImage: true,
    }),
  ["home-product-categories"],
  { revalidate: 60 },
);

const getCachedHomeFaqPage = unstable_cache(
  () => contentPagesService.getPublishedContentPage(FAQ_CONTENT_PAGE_SLUG),
  ["home-faq-page"],
  { revalidate: 60 },
);

export async function HomeView({
  params,
}: {
  params: Promise<{ locale: WebsiteLocale }>;
}) {
  const { locale } = await params;

  return (
    <main className="overflow-x-hidden bg-surface-muted text-charcoal">
      <Suspense fallback={<HomeHeroSkeleton />}>
        <HomeHero locale={locale} />
      </Suspense>
      <AboutSection />
      <Suspense fallback={<HomeProductsSkeleton />}>
        <HomeProducts />
      </Suspense>
      <SputterSection />
      <ComparisonSection />

      <div className="flex min-h-screen flex-col justify-center bg-white">
        <Suspense fallback={<HomeFaqSkeleton />}>
          <HomeFaq />
        </Suspense>
      </div>
    </main>
  );
}

async function HomeHero({ locale }: { locale: WebsiteLocale }) {
  const site = await getCachedSiteSetting(locale).catch(() => null);
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
    <HeroSection
      desktopImages={desktopHeroImages}
      mobileImages={mobileHeroImages}
    />
  );
}

async function HomeProducts() {
  const productCategories = await getCachedHomeProductCategories().catch(
    () => null,
  );

  return <ProductsSection initialPage={productCategories} />;
}

async function HomeFaq() {
  const faqPage = await getCachedHomeFaqPage().catch(() => null);

  return <FaqSection page={faqPage} />;
}
