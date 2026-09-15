import { APP_ROUTES } from "@/src/constants/routes.constants";
import { redirect } from "@/src/i18n/navigation";
import type { AppLocale } from "@/src/i18n/routing";

type WarrantyRootRedirectViewProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function WarrantyRootRedirectView({
  params,
}: WarrantyRootRedirectViewProps) {
  const { locale } = await params;

  redirect({ href: APP_ROUTES.warranty, locale });
  return null;
}
