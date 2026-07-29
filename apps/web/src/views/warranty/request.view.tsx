"use client";

import { Container } from "@/src/components/common/container";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";
import { Input } from "@repo/ui/input";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { warrantyIssueOptions } from "./warranty.constants";

export function WarrantyClaimRequestView() {
  const t = useTranslations("Warranty.request");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketId(`REQ-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-surface-muted py-12 sm:py-20 text-deep-black">
      <Container className="max-w-250 space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-block rounded-md border border-premium-red/30 bg-premium-red/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-premium-red">
            {t("eyebrow")}
          </span>
          <h1 className="text-3xl sm:text-5xl font-condensed font-semibold uppercase tracking-wider">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-stone-gray font-normal max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {isSubmitted ? (
          <div className="animate-in space-y-6 rounded-md border-2 border-premium-red bg-white p-8 text-center shadow-2xl duration-300 zoom-in-95 sm:p-12">
            <div className="mx-auto flex size-20 items-center justify-center rounded-md bg-premium-red/10 text-premium-red">
              <CheckCircle2 className="size-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold uppercase text-deep-black">
              {t("success.title")}
            </h2>
            <p className="text-base text-stone-gray font-normal max-w-lg mx-auto">
              {t.rich("success.description", {
                ticket: () => (
                  <strong className="text-premium-red font-mono text-xl">
                    {ticketId}
                  </strong>
                ),
              })}
            </p>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="cursor-pointer rounded-md bg-deep-black px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-premium-red"
            >
              {t("success.reset")}
            </button>
          </div>
        ) : (
          <div className="rounded-md border border-border-gray bg-white p-6 shadow-xl sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-deep-black">
                    {t("fields.customerName.label")}
                  </label>
                  <Input
                    required
                    placeholder={t("fields.customerName.placeholder")}
                    className={`h-12 rounded-md border-border-gray ${formControlFocusClassName}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-deep-black">
                    {t("fields.phone.label")}
                  </label>
                  <Input
                    required
                    placeholder={t("fields.phone.placeholder")}
                    className={`h-12 rounded-md border-border-gray ${formControlFocusClassName}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-deep-black">
                    {t("fields.reference.label")}
                  </label>
                  <Input
                    required
                    placeholder={t("fields.reference.placeholder")}
                    className={`h-12 rounded-md border-border-gray ${formControlFocusClassName}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-deep-black">
                    {t("fields.issue.label")}
                  </label>
                  <select
                    required
                    className={`h-12 w-full rounded-md border border-border-gray px-3 text-sm font-medium outline-none ${formControlFocusClassName}`}
                  >
                    <option value="">{t("fields.issue.placeholder")}</option>
                    {warrantyIssueOptions.map((issue) => (
                      <option key={issue} value={issue}>
                        {t(`fields.issue.options.${issue}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-deep-black">
                  {t("fields.details.label")}
                </label>
                <textarea
                  rows={4}
                  placeholder={t("fields.details.placeholder")}
                  className={`w-full rounded-md border border-border-gray p-4 text-sm outline-none ${formControlFocusClassName}`}
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-md bg-premium-red py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-colors hover:bg-warm-red"
              >
                {t("submit")}
              </button>
            </form>
          </div>
        )}
      </Container>
    </main>
  );
}
