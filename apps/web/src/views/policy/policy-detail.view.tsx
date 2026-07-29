import { getLocale, getTranslations } from "next-intl/server";
import { PolicyDocument } from "@repo/ui";
import { contentPagesService } from "@/src/services/content-pages/content-pages.service";
import { getPolicyConfig, toPolicyLocale } from "./policy.constants";
import type { PolicyKey } from "./policy.types";

interface PolicyDetailViewProps {
  policyKey?: PolicyKey;
}

export async function PolicyDetailView({
  policyKey = "general",
}: PolicyDetailViewProps) {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("PolicyDetailPage"),
  ]);
  const policyLocale = toPolicyLocale(locale);
  const config = getPolicyConfig(policyKey);
  const page = await contentPagesService
    .getPublishedContentPage(config.slugs[policyLocale])
    .catch(() => null);
  const title = page?.title ?? t(`titles.${policyKey}`);

  return (
    <main className="min-h-screen bg-white text-deep-black">
      <PolicyDocument
        content={page?.content}
        emptyDescription={t("emptyDescription")}
        emptyTitle={t("emptyTitle")}
        eyebrow={t("eyebrow")}
        summary={page?.summary}
        title={title}
        updatedText={
          page
            ? t("lastUpdated", {
                date: new Intl.DateTimeFormat(locale, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }).format(new Date(page.updatedAt)),
              })
            : null
        }
      />
    </main>
  );
}
