"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@repo/ui/input";
import { demoWarrantyCustomer } from "@/src/constants/warranty.constants";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";
import { demoWarrantyTicket } from "./warranty.constants";
import type { WarrantyTicketResult } from "./warranty.types";

export function WarrantyTrackView() {
  const t = useTranslations("Warranty.track");
  const [ticketQuery, setTicketQuery] = useState("");
  const [ticketData, setTicketData] = useState<WarrantyTicketResult | null>(
    null,
  );

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketQuery.trim().length > 0) {
      setTicketData({
        ticketId: ticketQuery,
        ...demoWarrantyTicket,
        customerName: demoWarrantyCustomer.name,
        issue: t("mock.issue"),
        status: t("mock.status"),
        assignedTechnician: t("mock.technician"),
      });
    }
  };

  return (
    <main className="min-h-screen bg-surface-muted py-12 sm:py-20 text-deep-black">
      <div className="mx-auto max-w-[1000px] px-6 space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-block bg-accent-gold/10 text-accent-gold border border-accent-gold/30 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.25em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-3xl sm:text-5xl font-condensed font-semibold uppercase tracking-wider">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-stone-gray font-medium max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="bg-white rounded-[28px] p-6 sm:p-10 border border-border-gray shadow-xl max-w-2xl mx-auto">
          <form onSubmit={handleTrack} className="flex gap-3">
            <Input
              placeholder={t("placeholder")}
              value={ticketQuery}
              onChange={(e) => setTicketQuery(e.target.value)}
              className={`h-12 rounded-[14px] text-base border-border-gray ${formControlFocusClassName}`}
            />
            <button
              type="submit"
              className="bg-deep-black hover:bg-premium-red text-white px-6 h-12 rounded-[14px] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
            >
              {t("search")}
            </button>
          </form>
        </div>

        {ticketData && (
          <div className="bg-white rounded-[28px] p-6 sm:p-10 border border-border-gray shadow-2xl space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-gray pb-4">
              <div>
                <span className="text-xs font-medium text-stone-gray uppercase">
                  {t("result.ticket")}
                </span>
                <h3 className="text-2xl font-semibold uppercase">
                  {ticketData.ticketId}
                </h3>
              </div>
              <span className="bg-accent-gold text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                {ticketData.status}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="p-4 rounded-xl bg-surface-muted">
                <span className="text-xs text-stone-gray block uppercase font-medium">
                  {t("result.customer")}
                </span>
                <span className="font-semibold">{ticketData.customerName}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-muted">
                <span className="text-xs text-stone-gray block uppercase font-medium">
                  {t("result.carPlate")}
                </span>
                <span className="font-semibold">{ticketData.carPlate}</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-muted">
                <span className="text-xs text-stone-gray block uppercase font-medium">
                  {t("result.technician")}
                </span>
                <span className="font-semibold">
                  {ticketData.assignedTechnician}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
