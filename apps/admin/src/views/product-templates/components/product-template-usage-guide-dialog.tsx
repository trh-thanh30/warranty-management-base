"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Layers3,
  Lightbulb,
  PackagePlus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Separator,
} from "@repo/ui";

const templateFields = [
  "name",
  "category",
  "identity",
  "media",
  "warranty",
] as const;

const productFields = ["template", "identity", "owner", "warranty"] as const;

const importantNotes = ["shared", "unique", "updates"] as const;

export function ProductTemplateUsageGuideDialog() {
  const t = useTranslations("ProductTemplates.usageGuide");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" type="button" variant="secondary">
          <BookOpen aria-hidden="true" className="size-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[min(calc(100vw-2rem),64rem)] max-w-none overflow-y-auto p-0">
        <header className="border-b border-slate-200 bg-slate-50 px-5 py-5 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-slate-50 dark:text-slate-950">
              <BookOpen aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold text-slate-950 dark:text-slate-50 sm:text-xl">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {t("description")}
              </DialogDescription>
            </div>
          </div>
        </header>

        <div className="space-y-6 px-5 py-5 sm:px-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
            <GuideStep
              badge={t("templateStep.badge")}
              description={t("templateStep.description")}
              icon={Layers3}
              title={t("templateStep.title")}
            >
              {templateFields.map((field) => (
                <GuideItem key={field}>
                  {t(`templateStep.fields.${field}`)}
                </GuideItem>
              ))}
            </GuideStep>

            <div className="flex items-center justify-center text-slate-400">
              <ArrowRight
                aria-hidden="true"
                className="size-5 rotate-90 md:rotate-0"
              />
            </div>

            <GuideStep
              badge={t("productStep.badge")}
              description={t("productStep.description")}
              icon={PackagePlus}
              title={t("productStep.title")}
            >
              {productFields.map((field) => (
                <GuideItem key={field}>
                  {t(`productStep.fields.${field}`)}
                </GuideItem>
              ))}
            </GuideStep>
          </div>

          <section
            aria-labelledby="product-template-guide-example"
            className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/30 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <Lightbulb
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
              />
              <div className="min-w-0 flex-1">
                <h3
                  className="font-semibold text-slate-950 dark:text-slate-50"
                  id="product-template-guide-example"
                >
                  {t("example.title")}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {t("example.description")}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ExampleCard
                badge={t("example.template.badge")}
                rows={[
                  [t("example.labels.name"), t("example.template.name")],
                  [t("example.labels.sku"), t("example.template.sku")],
                  [
                    t("example.labels.brandModel"),
                    t("example.template.brandModel"),
                  ],
                  [
                    t("example.labels.warranty"),
                    t("example.template.warranty"),
                  ],
                ]}
              />
              <ExampleCard
                badge={t("example.products.badge")}
                rows={[
                  [t("example.labels.productOne"), t("example.products.first")],
                  [
                    t("example.labels.productTwo"),
                    t("example.products.second"),
                  ],
                  [t("example.labels.result"), t("example.products.result")],
                ]}
              />
            </div>
          </section>

          <Separator />

          <section aria-labelledby="product-template-guide-notes">
            <h3
              className="font-semibold text-slate-950 dark:text-slate-50"
              id="product-template-guide-notes"
            >
              {t("notes.title")}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {importantNotes.map((note) => (
                <div
                  className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                  key={note}
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  />
                  <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
                    {t(`notes.items.${note}`)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="flex justify-end border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <DialogClose asChild>
            <Button type="button">{t("close")}</Button>
          </DialogClose>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function GuideStep({
  badge,
  children,
  description,
  icon: Icon,
  title,
}: {
  badge: string;
  children: React.ReactNode;
  description: string;
  icon: typeof Layers3;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon aria-hidden="true" className="size-4" />
        </div>
        <div>
          <Badge variant="secondary">{badge}</Badge>
          <h3 className="mt-2 font-semibold text-slate-950 dark:text-slate-50">
            {title}
          </h3>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
      <ul className="mt-3 space-y-2">{children}</ul>
    </section>
  );
}

function GuideItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span
        aria-hidden="true"
        className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400"
      />
      <span>{children}</span>
    </li>
  );
}

function ExampleCard({
  badge,
  rows,
}: {
  badge: string;
  rows: readonly (readonly [string, string])[];
}) {
  return (
    <div className="rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-900 dark:bg-slate-950">
      <Badge variant="info">{badge}</Badge>
      <dl className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div className="grid gap-0.5 text-sm" key={label}>
            <dt className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
              {label}
            </dt>
            <dd className="font-medium text-slate-950 dark:text-slate-50">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
