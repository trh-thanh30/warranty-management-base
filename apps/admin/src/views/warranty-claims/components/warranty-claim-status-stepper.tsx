"use client";

import type { WarrantyClaimSummary } from "@repo/shared";
import {
  Card,
  CardContent,
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  cn,
} from "@repo/ui";
import { Check, CircleDot } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  WARRANTY_CLAIM_PROGRESS_STATUSES,
  getClaimProgressActiveStep,
  getClaimProgressStepState,
} from "../warranty-claim-status-stepper.utils";

type WarrantyClaimStatusStepperProps = {
  claim: WarrantyClaimSummary;
};

export function WarrantyClaimStatusStepper({
  claim,
}: WarrantyClaimStatusStepperProps) {
  const t = useTranslations("WarrantyClaims");
  const activeStep = getClaimProgressActiveStep(claim.status);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <h2 className="sr-only">{t("statusProgress.title")}</h2>
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <Stepper
            aria-label={t("statusProgress.ariaLabel")}
            className="min-w-2xl"
            indicators={{
              active: <CircleDot aria-hidden="true" className="size-4" />,
              completed: <Check aria-hidden="true" className="size-4" />,
            }}
            orientation="horizontal"
            role="list"
            value={activeStep}
          >
            <StepperNav className="items-start">
              {WARRANTY_CLAIM_PROGRESS_STATUSES.map((status, index) => {
                const state = getClaimProgressStepState({
                  currentStatus: claim.status,
                  history: claim.statusHistory,
                  stepStatus: status,
                });

                return (
                  <StepperItem
                    aria-current={state === "active" ? "step" : undefined}
                    className="min-w-0 items-start"
                    completed={state === "completed"}
                    key={status}
                    role="listitem"
                    step={index + 1}
                  >
                    <div className="flex w-28 shrink-0 flex-col items-center gap-2 text-center">
                      <StepperIndicator
                        className={cn(
                          "size-8 border-2 font-semibold",
                          state === "completed" &&
                            "border-emerald-600 bg-emerald-600 text-white data-[state=completed]:bg-emerald-600 data-[state=completed]:text-white dark:border-emerald-400 dark:bg-emerald-500 dark:data-[state=completed]:bg-emerald-500",
                          state === "active" &&
                            "border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100 dark:border-blue-400 dark:bg-blue-500 dark:ring-blue-950",
                          state === "upcoming" &&
                            "border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400",
                        )}
                      >
                        {index + 1}
                      </StepperIndicator>
                      <StepperTitle
                        className={cn(
                          "max-w-28 text-balance leading-5",
                          state === "completed" &&
                            "text-emerald-700 dark:text-emerald-300",
                          state === "active" &&
                            "font-semibold text-blue-700 dark:text-blue-300",
                          state === "upcoming" &&
                            "text-slate-500 dark:text-slate-400",
                        )}
                      >
                        {t(`statuses.${status}`)}
                      </StepperTitle>
                      <span className="sr-only">
                        {t(`statusProgress.states.${state}`)}
                      </span>
                    </div>

                    {index < WARRANTY_CLAIM_PROGRESS_STATUSES.length - 1 ? (
                      <StepperSeparator
                        className={cn(
                          "mt-[0.95rem]",
                          state === "completed" &&
                            "bg-emerald-500 dark:bg-emerald-500",
                        )}
                      />
                    ) : null}
                  </StepperItem>
                );
              })}
            </StepperNav>
          </Stepper>
        </div>
      </CardContent>
    </Card>
  );
}
