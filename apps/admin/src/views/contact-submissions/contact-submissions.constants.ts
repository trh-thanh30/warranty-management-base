export const CONTACT_SUBMISSIONS_PAGE_SIZE = 10;

export const CONTACT_SUBMISSION_STATUS_FILTERS = [
  "ALL",
  "NEW",
  "IN_PROGRESS",
  "RESOLVED",
  "ARCHIVED",
] as const;

export type ContactSubmissionStatusFilter =
  (typeof CONTACT_SUBMISSION_STATUS_FILTERS)[number];
