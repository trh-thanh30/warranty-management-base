import { AboutRedirectView } from "@/src/views/about/about-redirect.view";

export default function AboutPage(
  props: Parameters<typeof AboutRedirectView>[0],
) {
  return <AboutRedirectView {...props} />;
}
