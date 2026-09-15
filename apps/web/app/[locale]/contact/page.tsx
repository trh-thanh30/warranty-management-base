import { PUBLIC_FEATURES } from "@/src/config/public-features.config";
import { ContactView } from "@/src/views/contact/contact.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";
import { notFound } from "next/navigation";

export const generateMetadata = createGeneratePageMetadata("/contact");

export default function ContactPage() {
  if (!PUBLIC_FEATURES.pages.contact) {
    notFound();
  }

  return <ContactView />;
}
