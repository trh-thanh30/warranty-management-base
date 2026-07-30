import { APP_ROUTES } from "@/src/constants/routes.constants";
import { redirect } from "@/src/i18n/navigation";
import type { AppLocale } from "@/src/i18n/routing";

type AboutRedirectViewProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function AboutRedirectView({ params }: AboutRedirectViewProps) {
  const { locale } = await params;

  redirect({ href: APP_ROUTES.home, locale });
  return null;
}
