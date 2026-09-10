import type { HomepageRendererProps } from "./homepage.types";
import { HeroSection } from "./components/hero-section";
import { BrandHeritageSection } from "./components/brand-heritage-section";
import { HeadingSection } from "./components/heading-section";
import { NetworkSection } from "./components/network-section";
import { B2bSection } from "./components/b2b-section";

export function HomepageRenderer({
  copy,
  heroImageUrl,
  networkContent,
}: HomepageRendererProps) {
  return (
    <main className="w-full overflow-x-clip bg-white text-deep-black">
      <HeroSection copy={copy.hero} imageUrl={heroImageUrl} />
      <BrandHeritageSection copy={copy.brandHeritage} />
      <HeadingSection {...copy.coreTech} id="core-tech" />
      <HeadingSection {...copy.milestones} id="milestones" muted />
      <HeadingSection {...copy.pillars} id="pillars" />
      <NetworkSection copy={copy.network} networkContent={networkContent} />
      <HeadingSection {...copy.testimonials} id="testimonials" />
      <B2bSection copy={copy.b2b} />
    </main>
  );
}
