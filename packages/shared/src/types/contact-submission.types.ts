import type { PaginatedResponse, PaginationQuery } from "./pagination.types.ts";
import type { ContactSubmissionStatus } from "../constants/contact-submissions.ts";
import type { ContactConsultationTopic } from "../constants/contact-submissions.ts";

export type {
  ContactConsultationTopic,
  ContactSubmissionStatus,
} from "../constants/contact-submissions.ts";

export type ContactSubmissionResponse = {
  consultationTopic: ContactConsultationTopic | null;
  content: string;
  createdAt: string;
  fullName: string;
  id: string;
  phone: string;
  provinceCode: string | null;
  provinceName: string | null;
  sourcePath: string | null;
  status: ContactSubmissionStatus;
  updatedAt: string;
};

export type CreateContactSubmissionBody = {
  consultationTopic: ContactConsultationTopic;
  content: string;
  fullName: string;
  phone: string;
  provinceCode: string;
  sourcePath?: string | null;
};

export type ListContactSubmissionsQuery = PaginationQuery & {
  search?: string;
  status?: ContactSubmissionStatus;
};

export type ExportContactSubmissionsQuery = Pick<
  ListContactSubmissionsQuery,
  "search" | "status"
>;

export type ListContactSubmissionsResponse =
  PaginatedResponse<ContactSubmissionResponse>;

export type UpdateContactSubmissionStatusBody = {
  status: ContactSubmissionStatus;
};
