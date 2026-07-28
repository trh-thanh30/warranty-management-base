import { ContactView } from "@/src/views/contact/contact.view";
import { getPublicSiteSettings } from "@/src/services/site-settings.service";
import type { AppLocale } from "@/src/i18n/routing";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const siteSettings = await getPublicSiteSettings(locale);

  return <ContactView siteSettings={siteSettings} />;
}
