import type {
  ContactSubmissionResponse,
  ListContactSubmissionsQuery,
  ListContactSubmissionsResponse,
  UpdateContactSubmissionStatusBody,
} from "@repo/shared";
import { unwrap } from "../service.utils";
import type { ContactSubmissionsHttpClient } from "./contact-submissions.types";

export function createContactSubmissionsService(
  http: ContactSubmissionsHttpClient,
) {
  return {
    async listContactSubmissions(
      query: ListContactSubmissionsQuery,
    ): Promise<ListContactSubmissionsResponse> {
      return unwrap(
        await http.get<ListContactSubmissionsResponse>("/contact-submissions", {
          params: query,
        }),
      );
    },

    async getContactSubmission(id: string): Promise<ContactSubmissionResponse> {
      return unwrap(
        await http.get<ContactSubmissionResponse>(`/contact-submissions/${id}`),
      );
    },

    async updateContactSubmissionStatus(
      id: string,
      body: UpdateContactSubmissionStatusBody,
    ): Promise<ContactSubmissionResponse> {
      return unwrap(
        await http.patch<ContactSubmissionResponse>(
          `/contact-submissions/${id}/status`,
          body,
        ),
      );
    },
  };
}
