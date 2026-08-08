import type { ContactSubmissionStatus } from "@repo/shared";

import type { ContactSubmissionStatusFilter } from "./contact-submissions.constants";

export function toContactSubmissionStatusQuery(
  status: ContactSubmissionStatusFilter,
): ContactSubmissionStatus | undefined {
  return status === "ALL" ? undefined : status;
}
