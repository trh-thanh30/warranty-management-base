export const CONTACT_SUBMISSION_LIMITS = {
  content: { min: 10, max: 2000 },
  fullName: { min: 2, max: 120 },
  phone: { min: 8, max: 32 },
  provinceCode: { min: 1, max: 12 },
  provinceName: { min: 1, max: 120 },
  sourcePath: { min: 1, max: 300 },
} as const;

export const CONTACT_SUBMISSION_STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "RESOLVED",
  "ARCHIVED",
] as const;

export const CONTACT_CONSULTATION_TOPICS = [
  "PRODUCT_CONSULTATION",
  "FIND_DEALER",
  "WARRANTY",
  "DEALER_REGISTRATION",
  "OTHER",
] as const;

export type ContactConsultationTopic =
  (typeof CONTACT_CONSULTATION_TOPICS)[number];

export function isContactConsultationTopic(
  value: unknown,
): value is ContactConsultationTopic {
  return (
    typeof value === "string" &&
    (CONTACT_CONSULTATION_TOPICS as readonly string[]).includes(value)
  );
}

export type ContactSubmissionStatus =
  (typeof CONTACT_SUBMISSION_STATUSES)[number];

export const CONTACT_SUBMISSION_STATUS_TRANSITIONS = {
  ARCHIVED: [],
  IN_PROGRESS: ["RESOLVED", "ARCHIVED"],
  NEW: ["IN_PROGRESS", "ARCHIVED"],
  RESOLVED: ["ARCHIVED"],
} as const satisfies Record<
  ContactSubmissionStatus,
  readonly ContactSubmissionStatus[]
>;

export function getAllowedContactSubmissionTransitions(
  status: ContactSubmissionStatus,
): readonly ContactSubmissionStatus[] {
  return CONTACT_SUBMISSION_STATUS_TRANSITIONS[status];
}
