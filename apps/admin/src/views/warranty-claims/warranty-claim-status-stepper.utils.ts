import type {
  WarrantyClaimStatus,
  WarrantyClaimStatusHistorySummary,
} from "@repo/shared";

export const WARRANTY_CLAIM_PROGRESS_STATUSES = [
  "SUBMITTED",
  "REVIEWING",
  "APPROVED",
  "IN_REPAIR",
  "COMPLETED",
] as const satisfies readonly WarrantyClaimStatus[];

export type WarrantyClaimProgressStepState =
  | "active"
  | "completed"
  | "upcoming";

export function getClaimProgressActiveStep(status: WarrantyClaimStatus) {
  if (
    status === "COMPLETED" ||
    status === "CANCELLED" ||
    status === "REJECTED"
  ) {
    return 0;
  }

  return WARRANTY_CLAIM_PROGRESS_STATUSES.indexOf(status) + 1;
}

export function getClaimProgressStepState({
  currentStatus,
  history,
  stepStatus,
}: {
  currentStatus: WarrantyClaimStatus;
  history: WarrantyClaimStatusHistorySummary[];
  stepStatus: (typeof WARRANTY_CLAIM_PROGRESS_STATUSES)[number];
}): WarrantyClaimProgressStepState {
  const stepIndex = WARRANTY_CLAIM_PROGRESS_STATUSES.indexOf(stepStatus);

  if (currentStatus === "COMPLETED") return "completed";

  if (currentStatus === "CANCELLED" || currentStatus === "REJECTED") {
    const terminalTransition = findLatestStatusHistory(currentStatus, history);
    const lastProgressStatus = terminalTransition?.fromStatus ?? "SUBMITTED";
    const lastProgressIndex = WARRANTY_CLAIM_PROGRESS_STATUSES.indexOf(
      lastProgressStatus as (typeof WARRANTY_CLAIM_PROGRESS_STATUSES)[number],
    );

    return stepIndex <= Math.max(lastProgressIndex, 0)
      ? "completed"
      : "upcoming";
  }

  const currentIndex = WARRANTY_CLAIM_PROGRESS_STATUSES.indexOf(currentStatus);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "upcoming";
}

export function findLatestStatusHistory(
  status: WarrantyClaimStatus,
  history: WarrantyClaimStatusHistorySummary[],
) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    const event = history[index];
    if (event?.toStatus === status) return event;
  }

  return null;
}
