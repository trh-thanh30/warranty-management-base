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
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="min-w-0 p-4 sm:p-5">
        <h2 className="sr-only">{t("statusProgress.title")}</h2>

        {/* Desktop View (lg+): Horizontal Stepper with connecting lines (StepperSeparator) stretching 100% width */}
        <div className="hidden min-w-0 w-full lg:block">
          <Stepper
            aria-label={t("statusProgress.ariaLabel")}
            className="min-w-0 w-full"
            indicators={{
              active: <CircleDot aria-hidden="true" className="size-4" />,
              completed: <Check aria-hidden="true" className="size-4" />,
            }}
            orientation="horizontal"
            role="list"
            value={activeStep}
          >
            <StepperNav className="min-w-0 w-full items-start justify-between">
              {WARRANTY_CLAIM_PROGRESS_STATUSES.map((status, index) => {
                const state = getClaimProgressStepState({
                  currentStatus: claim.status,
                  history: claim.statusHistory,
                  stepStatus: status,
                });

                return (
                  <StepperItem
                    aria-current={state === "active" ? "step" : undefined}
                    className="min-w-0 flex-1 items-start"
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

        {/* Mobile / Tablet View (< lg): Responsive Grid layout fitting 100% screen width without scroll or text overlap */}
        <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:hidden">
          {WARRANTY_CLAIM_PROGRESS_STATUSES.map((status, index) => {
            const state = getClaimProgressStepState({
              currentStatus: claim.status,
              history: claim.statusHistory,
              stepStatus: status,
            });

            return (
              <div
                className={cn(
                  "relative flex min-w-0 items-center gap-3 rounded-lg border p-3 transition-colors",
                  state === "completed" &&
                    "border-emerald-200 bg-emerald-50/50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300",
                  state === "active" &&
                    "border-blue-300 bg-blue-50/80 ring-2 ring-blue-500/20 dark:border-blue-800 dark:bg-blue-950/40 dark:ring-blue-400/20",
                  state === "upcoming" &&
                    "border-slate-200 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
                )}
                key={status}
              >
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    state === "completed" &&
                      "bg-emerald-600 text-white dark:bg-emerald-500",
                    state === "active" &&
                      "bg-blue-600 text-white dark:bg-blue-500",
                    state === "upcoming" &&
                      "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                  )}
                >
                  {state === "completed" ? (
                    <Check className="size-4" />
                  ) : state === "active" ? (
                    <CircleDot className="size-4 animate-pulse" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {index + 1}. {t(`statusProgress.states.${state}`)}
                  </p>
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      state === "completed" &&
                        "text-emerald-950 dark:text-emerald-200",
                      state === "active" &&
                        "font-semibold text-blue-950 dark:text-blue-100",
                      state === "upcoming" &&
                        "text-slate-600 dark:text-slate-400",
                    )}
                  >
                    {t(`statuses.${status}`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
