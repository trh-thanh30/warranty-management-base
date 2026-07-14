import type {
  ServiceCenterSummary,
  WarrantyClaimPriority,
  WarrantyClaimStatus,
  WarrantyClaimSummary,
} from "@repo/shared";
import { WARRANTY_CLAIM_TERMINAL_STATUSES } from "./warranty-claims.constants";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatClaimDate(value: string | null | undefined) {
  if (!value) return "-";

  return dateFormatter.format(new Date(value));
}

export function formatClaimDateTime(value: string | null | undefined) {
  if (!value) return "-";

  return dateTimeFormatter.format(new Date(value));
}

export function formatResolutionHours(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return `${Math.round(value * 10) / 10}h`;
}

export function formatClaimCustomer(claim: WarrantyClaimSummary) {
  return (
    claim.customer?.fullName ??
    claim.requesterName ??
    claim.customer?.customerCode ??
    "-"
  );
}

export function formatClaimProduct(claim: WarrantyClaimSummary) {
  if (!claim.product) return "-";

  return [claim.product.name, claim.product.brand, claim.product.model]
    .filter(Boolean)
    .join(" · ");
}

export function formatClaimServiceCenter(claim: WarrantyClaimSummary) {
  return claim.serviceCenter?.name ?? "-";
}

export function formatServiceCenterOption(serviceCenter: ServiceCenterSummary) {
  return [serviceCenter.name, serviceCenter.province]
    .filter(Boolean)
    .join(" · ");
}

export function isClaimOverdue(claim: WarrantyClaimSummary) {
  if (!claim.dueAt) return false;
  if (WARRANTY_CLAIM_TERMINAL_STATUSES.includes(claim.status)) return false;

  return new Date(claim.dueAt).getTime() < Date.now();
}

export function getClaimSlaLabel(claim: WarrantyClaimSummary) {
  if (claim.slaBreachedAt) return "breached";
  if (isClaimOverdue(claim)) return "overdue";
  if (!claim.dueAt) return "notSet";

  return "onTrack";
}

export function getPriorityBadgeVariant(priority: WarrantyClaimPriority) {
  if (priority === "URGENT") return "destructive";
  if (priority === "HIGH") return "warning";
  if (priority === "NORMAL") return "secondary";

  return "default";
}

export function getStatusBadgeVariant(status: WarrantyClaimStatus) {
  if (status === "COMPLETED") return "success";
  if (status === "REJECTED" || status === "CANCELLED") return "destructive";
  if (status === "APPROVED" || status === "IN_REPAIR") return "warning";

  return "secondary";
}
