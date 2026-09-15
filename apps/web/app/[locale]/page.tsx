import { APP_ROUTES } from "@/src/constants/routes.constants";
import { redirect } from "@/src/i18n/navigation";
import type { AppLocale } from "@/src/i18n/routing";

type RootPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export default async function Page({ params }: RootPageProps) {
  const { locale } = await params;

  redirect({ href: APP_ROUTES.warranty, locale });
}
