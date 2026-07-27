import Image from "next/image";
import { ChevronRight, PhoneCall, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { APP_ROUTES } from "@/src/constants/routes.constants";
import { Link } from "@/src/i18n/navigation";
import type { PolicyDocument, PolicyKey } from "./policy.types";

interface PolicyDetailViewProps {
  policyKey?: PolicyKey;
}

export function PolicyDetailView({
  policyKey = "general",
}: PolicyDetailViewProps) {
  const t = useTranslations("PolicyDetailPage");
  const content = t.raw(`documents.${policyKey}`) as PolicyDocument;

  return (
    <main className="min-h-screen bg-white text-deep-black">
      <section className="relative flex h-[220px] w-full items-center justify-center overflow-hidden bg-deep-black sm:h-[300px]">
        <Image
          src="/bg_1.jpg"
          alt={content.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-black/60 to-transparent" />
        <div className="relative z-10 w-full max-w-[1200px] space-y-3 px-6 text-center">
          <span className="text-xs font-medium uppercase tracking-wider text-accent-gold">
            {t("eyebrow")}
          </span>
          <h1 className="font-condensed text-3xl font-semibold uppercase tracking-wider text-white sm:text-4xl lg:text-5xl">
            {content.title}
          </h1>
        </div>
      </section>

      <div className="border-b border-border-gray bg-surface-muted py-3.5">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-6 text-xs font-medium text-stone-gray">
          <Link href={APP_ROUTES.home} className="hover:text-premium-red">
            {t("home")}
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span className="font-semibold text-deep-black">{content.title}</span>
        </div>
      </div>

      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-[1000px] space-y-8 px-6 text-deep-black">
          <p className="border-l-4 border-premium-red py-1 pl-5 text-base italic leading-relaxed text-stone-gray sm:text-lg">
            {content.lead}
          </p>

          <div className="space-y-8 pt-4">
            {content.sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="font-condensed text-xl font-semibold uppercase tracking-wide text-deep-black sm:text-2xl">
                  {section.heading}
                </h2>
                {section.paragraph ? (
                  <p className="text-sm leading-relaxed text-stone-gray sm:text-base">
                    {section.paragraph}
                  </p>
                ) : null}
                {section.bullets?.length ? (
                  <ul className="space-y-2.5 pl-2 text-sm text-dark-charcoal sm:text-base">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2.5 leading-relaxed"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-premium-red"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <div className="mt-12 space-y-4 rounded-[24px] border border-border-gray bg-surface-muted p-8 shadow-md">
            <div className="flex items-center gap-3">
              <ShieldCheck
                className="size-8 shrink-0 text-premium-red"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-condensed text-xl font-semibold uppercase text-deep-black">
                  {t("companyName")}
                </h3>
                <p className="text-xs text-stone-gray">
                  {t("companyDescription")}
                </p>
              </div>
            </div>

            <div className="grid gap-5 border-t border-border-gray pt-4 text-xs text-deep-black sm:grid-cols-2 sm:gap-8">
              {(["hcm", "hanoi"] as const).map((office) => (
                <div
                  key={office}
                  className="flex h-full flex-col items-start gap-4"
                >
                  <div className="space-y-0.5">
                    <strong className="block text-xs font-semibold uppercase text-stone-gray">
                      {t(`offices.${office}.label`)}
                    </strong>
                    <span>{t(`offices.${office}.address`)}</span>
                  </div>
                  <a
                    href={
                      office === "hcm" ? "tel:0886337733" : "tel:0989017999"
                    }
                    className="mt-auto inline-flex min-h-11 items-center gap-2 rounded-xl bg-premium-red px-6 py-3.5 text-xs font-semibold uppercase text-white shadow-sm transition-colors hover:bg-warm-red"
                  >
                    <PhoneCall className="size-4" aria-hidden="true" />
                    <span>{t(`offices.${office}.hotline`)}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
