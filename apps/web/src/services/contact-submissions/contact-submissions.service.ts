import { publicHttpClient } from "../../lib/public-http-client";
import type {
  ApiResponse,
  ContactSubmissionResponse,
  CreateContactSubmissionBody,
  HttpClient,
} from "@repo/shared";

export class ContactSubmissionsService {
  constructor(private readonly http: Pick<HttpClient, "post">) {}

  async createContactSubmission(
    body: CreateContactSubmissionBody,
  ): Promise<ContactSubmissionResponse> {
    const response = await this.http.post<
      ApiResponse<ContactSubmissionResponse>
    >("/public/contact-submissions", body);
    return response.data;
  }
}

export const contactSubmissionsService = new ContactSubmissionsService(
  publicHttpClient,
);
