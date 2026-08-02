import { ContactView } from "@/src/views/contact/contact.view";
import { createGeneratePageMetadata } from "@/src/config/seo.config";

export const generateMetadata = createGeneratePageMetadata("/contact");

export default function ContactPage() {
  return <ContactView />;
}
