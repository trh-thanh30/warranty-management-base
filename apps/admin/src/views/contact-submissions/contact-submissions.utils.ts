import type { ContactSubmissionStatus } from "@repo/shared";

import type { ContactSubmissionStatusFilter } from "./contact-submissions.constants";

export function toContactSubmissionStatusQuery(
  status: ContactSubmissionStatusFilter,
): ContactSubmissionStatus | undefined {
  return status === "ALL" ? undefined : status;
}

export function formatContactSubmissionCreatedAt(
  createdAt: string,
  locale: string,
) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(createdAt));
}
