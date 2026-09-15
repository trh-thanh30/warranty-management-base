import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { createGeneratePageMetadata } from "@/src/config/seo.config";
import { AboutView } from "@/src/views/about/about.view";
import { generateAboutMetadata } from "@/src/views/about/about.metadata";
import { HomeView } from "@/src/views/home/home.view";

const generateHomeMetadata = createGeneratePageMetadata("/");

export async function generateMetadata(
  props: Parameters<typeof generateHomeMetadata>[0],
) {
  if (PUBLIC_FEATURES.pages.about) {
    return generateAboutMetadata(props);
  }

  return generateHomeMetadata(props);
}

export default function Page(props: Parameters<typeof HomeView>[0]) {
  if (!PUBLIC_FEATURES.pages.about) {
    return <HomeView {...props} />;
  }

  return <AboutView />;
}
