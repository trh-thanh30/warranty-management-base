import { AboutView } from "@/src/views/about/about.view";

export { generateAboutMetadata as generateMetadata } from "@/src/views/about/about.metadata";

export default function Page(props: Parameters<typeof AboutView>[0]) {
  return <AboutView {...props} />;
}
