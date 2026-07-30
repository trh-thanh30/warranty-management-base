"use client";

import { Container } from "@/src/components/common/container";
import { useWarrantyClaimTracking } from "@/src/hooks/use-warranty-claim-tracking";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { WarrantyBackLink } from "./components/warranty-back-link";
import { WarrantyClaimProgress } from "./components/warranty-claim-progress";
import { WarrantyTrackForm } from "./components/warranty-track-form";

export function WarrantyTrackView() {
  const t = useTranslations("Warranty.track");
  const searchParams = useSearchParams();
  const { data, isPending, reset, track } = useWarrantyClaimTracking();
  const initialClaimCode = searchParams.get("claimCode") ?? "";

  return (
    <main className="min-h-screen bg-surface-muted py-12 text-deep-black sm:py-20">
      <Container className="max-w-250 space-y-10">
        <div className="space-y-8">
          <WarrantyBackLink />

          <header className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="text-sm font-semibold uppercase text-premium-red">
              {t("eyebrow")}
            </p>
            <h1 className="font-condensed text-3xl font-semibold uppercase sm:text-5xl">
              {t("title")}
            </h1>
            <p className="text-base text-stone-gray sm:text-lg">
              {t("description")}
            </p>
          </header>
        </div>

        <motion.section
          className="mx-auto max-w-5xl overflow-hidden rounded-md border border-border-gray bg-white shadow-sm"
          layout
        >
          <div className="p-5 sm:p-8">
            <WarrantyTrackForm
              initialValue={initialClaimCode}
              isPending={isPending}
              onSubmit={track}
              onValueChange={reset}
            />
          </div>

          <AnimatePresence mode="wait">
            {data ? (
              <motion.div
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden border-t border-border-gray"
                exit={{ opacity: 0, height: 0 }}
                initial={{ opacity: 0, height: 0 }}
                key={data.claimCode}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <WarrantyClaimProgress claim={data} embedded />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.section>
      </Container>
    </main>
  );
}
