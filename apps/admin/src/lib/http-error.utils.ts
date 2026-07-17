import { HttpClientError } from "@repo/shared";

export function isForbiddenError(error: unknown) {
  if (error instanceof HttpClientError) return error.status === 403;

  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 403
  );
}
