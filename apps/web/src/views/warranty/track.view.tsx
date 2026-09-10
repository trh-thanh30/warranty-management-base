"use client";

import { WarrantyProcessSteps } from "@/src/components/common/warranty-process-steps";
import { useWarrantyTracking } from "@/src/hooks/use-warranty-tracking";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, FileText, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { WarrantyActivationRequestProgress } from "./components/warranty-activation-request-progress";
import { WarrantyClaimProgress } from "./components/warranty-claim-progress";
import { WarrantyFormCard } from "./components/warranty-form-card";
import { WarrantyOtherActions } from "./components/warranty-other-actions";
import { WarrantyPageHeading } from "./components/warranty-page-heading";
import { WarrantyServicePageShell } from "./components/warranty-service-page-shell";
import { WarrantyTrackForm } from "./components/warranty-track-form";

const guideSteps = [
  { id: "one", number: "01", Icon: FileText },
  { id: "two", number: "02", Icon: Clock3 },
  { id: "three", number: "03", Icon: ShieldCheck },
] as const;

export function WarrantyTrackView() {
  const t = useTranslations("Warranty.track");
  const searchParams = useSearchParams();
  const { data, isPending, reset, track } = useWarrantyTracking();
  const initialTrackingCode =
    searchParams.get("requestCode") ?? searchParams.get("claimCode") ?? "";

  return (
    <WarrantyServicePageShell
      contentClassName="relative z-30 flex flex-col"
      hero={{
        alt: t("title"),
        compact: true,
        description: t("description"),
        eyebrow: t("eyebrow"),
        title: t("title"),
      }}
    >
      <WarrantyPageHeading
        description={t("form.description")}
        title={t("form.title")}
      />

      <WarrantyProcessSteps
        steps={guideSteps.map(({ id, number, Icon }) => ({
          number,
          Icon,
          badge: t(`guide.steps.${id}.badge`),
          title: t(`guide.steps.${id}.title`),
          description: t(`guide.steps.${id}.description`),
        }))}
      />

      {!data ? (
        <WarrantyPageHeading
          description={t("form.sectionDescription")}
          level={3}
          title={t("form.sectionTitle")}
        />
      ) : null}

      <motion.div className="mx-auto w-full max-w-5xl" layout>
        <WarrantyFormCard className="max-w-none">
          <WarrantyTrackForm
            initialValue={initialTrackingCode}
            isPending={isPending}
            onSubmit={track}
            onValueChange={reset}
          />

          <AnimatePresence mode="wait">
            {data ? (
              <motion.div
                animate={{ opacity: 1, height: "auto" }}
                className="mt-8 overflow-hidden border-t border-border-gray pt-8"
                exit={{ opacity: 0, height: 0 }}
                initial={{ opacity: 0, height: 0 }}
                key={
                  data.kind === "activationRequest"
                    ? data.request.requestCode
                    : data.claim.claimCode
                }
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                {data.kind === "activationRequest" ? (
                  <WarrantyActivationRequestProgress
                    embedded
                    request={data.request}
                  />
                ) : (
                  <WarrantyClaimProgress claim={data.claim} embedded />
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </WarrantyFormCard>
      </motion.div>

      <WarrantyOtherActions
        items={[
          { id: "activate", label: t("otherActions.activate") },
          { id: "request", label: t("otherActions.request") },
          { id: "dealers", label: t("otherActions.dealers") },
        ]}
        title={t("otherActions.title")}
      />
    </WarrantyServicePageShell>
  );
}
