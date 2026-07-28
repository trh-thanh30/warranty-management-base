"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { PublicWebsiteSiteSetting } from "@repo/shared";
import {
  displayWebsite,
  normalizeExternalUrl,
  toTelephoneHref,
} from "@/src/utils/link.utils";
import { ContactMessageForm } from "./components/contact-message-form";
import {
  getPublishedContactOffices,
  stripTrailingColon,
  type ContactOfficeItem,
} from "./contact.utils";

const ContactMap = dynamic(() => import("./components/contact-map"), {
  ssr: false,
  loading: () => (
    <div className="size-full animate-pulse bg-surface-muted rounded-md" />
  ),
});

type ContactViewProps = {
  siteSettings?: PublicWebsiteSiteSetting | null;
};

export function ContactView({ siteSettings }: ContactViewProps) {
  const t = useTranslations("ContactPage");
  const publishedOffices = getPublishedContactOffices(siteSettings);
  const offices =
    publishedOffices.length > 0
      ? publishedOffices
      : getFallbackContactOffices(t);
  const contactEmail = siteSettings?.contactEmail.trim() || FALLBACK_EMAIL;
  const websiteHref =
    normalizeExternalUrl(siteSettings?.websiteUrl) ??
    normalizeExternalUrl(FALLBACK_WEBSITE_URL);
  const websiteLabel = displayWebsite(
    siteSettings?.websiteUrl || FALLBACK_WEBSITE_URL,
  );

  return (
    <main className="min-h-screen bg-white text-deep-black">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12 py-12 lg:py-20 space-y-16">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-block bg-accent-gold text-deep-black px-4 py-1.5 rounded-md text-sm font-medium uppercase tracking-wide">
              {t("eyebrow")}
            </span>

            <h1 className="text-3xl sm:text-5xl font-semibold uppercase tracking-wider text-deep-black">
              {t("title")}
            </h1>

            <p className="text-base sm:text-lg text-stone-gray font-normal">
              {t("description")}
            </p>

            <div className="grid gap-8 sm:grid-cols-2 pt-4 border-t border-border-gray">
              <div className="space-y-3">
                <h3 className="text-base font-semibold uppercase text-deep-black">
                  {t("offices.title")}
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-stone-gray font-medium leading-relaxed">
                  {offices.map((office) => (
                    <li key={office.id} className="flex items-start gap-2">
                      <span className="text-premium-red font-medium">
                        &bull;
                      </span>
                      <span>
                        <strong className="text-deep-black">
                          {office.label}
                        </strong>{" "}
                        {office.address}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold uppercase text-deep-black">
                  {t("contactDetailsTitle")}
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-stone-gray font-medium leading-relaxed">
                  {offices
                    .filter((office) => office.phone)
                    .map((office) => (
                      <li key={office.id} className="flex items-start gap-2">
                        <span className="text-premium-red font-medium">
                          &bull;
                        </span>
                        <span>
                          <strong className="text-deep-black">
                            Hotline {stripTrailingColon(office.label)}:
                          </strong>{" "}
                          <a
                            href={`tel:${toTelephoneHref(office.phone ?? "")}`}
                            className="text-premium-red font-semibold hover:underline"
                          >
                            {office.phone}
                          </a>
                        </span>
                      </li>
                    ))}

                  <li className="flex items-start gap-2">
                    <span className="text-premium-red font-medium">&bull;</span>
                    <span>
                      <strong className="text-deep-black">
                        {t("emailLabel")}
                      </strong>{" "}
                      <a
                        href={`mailto:${contactEmail}`}
                        className="hover:underline"
                      >
                        {contactEmail}
                      </a>
                    </span>
                  </li>

                  {websiteHref && (
                    <li className="flex items-start gap-2">
                      <span className="text-premium-red font-medium">
                        &bull;
                      </span>
                      <span>
                        <strong className="text-deep-black">
                          {t("websiteLabel")}
                        </strong>{" "}
                        <a
                          href={websiteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline font-medium text-deep-black"
                        >
                          {websiteLabel}
                        </a>
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-surface-muted rounded-md p-6 sm:p-10 border border-border-gray shadow-xl">
            <span className="inline-block bg-accent-gold text-deep-black px-4 py-1.5 rounded-md text-sm font-medium uppercase tracking-wide mb-8">
              {t("form.eyebrow")}
            </span>

            <ContactMessageForm />
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-border-gray">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold uppercase text-deep-black">
                {t("maps.hanoi.title")}
              </h3>
              <div className="w-full h-[350px] rounded-md overflow-hidden border border-border-gray shadow-md bg-surface-muted">
                <ContactMap
                  lat={21.035}
                  lng={105.75}
                  title={t("maps.hanoi.title")}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold uppercase text-deep-black">
                {t("maps.hcm.title")}
              </h3>
              <div className="w-full h-[350px] rounded-md overflow-hidden border border-border-gray shadow-md bg-surface-muted">
                <ContactMap
                  lat={10.965}
                  lng={106.665}
                  title={t("maps.hcm.title")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const FALLBACK_EMAIL = "fujitek.lexzenz.vn@gmail.com";
const FALLBACK_WEBSITE_URL = "https://fujitekvietnam.com";

type ContactTranslationKey =
  | "offices.hcm.address"
  | "offices.hcm.label"
  | "offices.hanoi.address"
  | "offices.hanoi.label";

function getFallbackContactOffices(
  t: (key: ContactTranslationKey) => string,
): ContactOfficeItem[] {
  return [
    {
      address: t("offices.hcm.address"),
      id: "fallback-hcm",
      label: t("offices.hcm.label"),
      phone: "0886 33 77 33",
      sortOrder: 0,
    },
    {
      address: t("offices.hanoi.address"),
      id: "fallback-hanoi",
      label: t("offices.hanoi.label"),
      phone: "0989 017 999",
      sortOrder: 1,
    },
  ];
}
