import type { HttpClientError } from "@repo/shared";

export function getContactRateLimitSeconds(
  error: HttpClientError,
): number | undefined {
  const details = error.details;
  const detailSeconds =
    details && typeof details === "object" && "retryAfterSeconds" in details
      ? details.retryAfterSeconds
      : undefined;
  const seconds = Number(error.retryAfterSeconds ?? detailSeconds);

  return Number.isFinite(seconds) && seconds > 0
    ? Math.ceil(seconds)
    : undefined;
}

export function getRemainingRateLimitSeconds(
  deadlineMs: number,
  nowMs: number,
): number {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}
