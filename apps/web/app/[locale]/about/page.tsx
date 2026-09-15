import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { AboutRedirectView } from "@/src/views/about/about-redirect.view";
import { notFound } from "next/navigation";

export default function AboutPage(
  props: Parameters<typeof AboutRedirectView>[0],
) {
  if (!PUBLIC_FEATURES.pages.about) {
    notFound();
  }

  return <AboutRedirectView {...props} />;
}
