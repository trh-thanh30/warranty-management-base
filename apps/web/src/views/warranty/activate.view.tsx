"use client";

import { WarrantyProcessSteps } from "@/src/components/common/warranty-process-steps";
import { useWarrantyActivationRequest } from "@/src/hooks/use-warranty-activation-request";
import { FileText, Send, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { WarrantyActivationRequestForm } from "./components/warranty-activation-request-form";
import { WarrantyActivationSuccess } from "./components/warranty-activation-success";
import { WarrantyFormCard } from "./components/warranty-form-card";
import { WarrantyOtherActions } from "./components/warranty-other-actions";
import { WarrantyPageHeading } from "./components/warranty-page-heading";
import { WarrantyServicePageShell } from "./components/warranty-service-page-shell";

const activationGuideSteps = [
  { id: "one", number: "01", Icon: FileText },
  { id: "two", number: "02", Icon: Send },
  { id: "three", number: "03", Icon: ShieldCheck },
] as const;

export function WarrantyActivateView() {
  const t = useTranslations("Warranty.activate");
  const {
    data: request,
    errorKind,
    isPending,
    reset,
    submit,
  } = useWarrantyActivationRequest();

  return (
    <WarrantyServicePageShell
      hero={{
        alt: t("title"),
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
        steps={activationGuideSteps.map(({ id, number, Icon }) => ({
          number,
          Icon,
          badge: t(`guide.steps.${id}.badge`),
          title: t(`guide.steps.${id}.title`),
          description: t(`guide.steps.${id}.description`),
        }))}
      />

      {!request ? (
        <WarrantyPageHeading
          description={t("form.sectionDescription")}
          level={3}
          title={t("form.sectionTitle")}
        />
      ) : null}

      <WarrantyFormCard>
        {request ? (
          <WarrantyActivationSuccess onReset={reset} request={request} />
        ) : (
          <WarrantyActivationRequestForm
            errorKind={errorKind}
            isPending={isPending}
            onResetError={reset}
            onSubmit={submit}
          />
        )}
      </WarrantyFormCard>

      <WarrantyOtherActions
        items={[
          { id: "request", label: t("otherActions.request") },
          { id: "track", label: t("otherActions.track") },
          { id: "dealers", label: t("otherActions.dealers") },
        ]}
        title={t("otherActions.title")}
      />
    </WarrantyServicePageShell>
  );
}
