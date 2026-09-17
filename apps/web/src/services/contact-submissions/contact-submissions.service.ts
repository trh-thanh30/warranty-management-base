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
    turnstileToken?: string,
  ): Promise<ContactSubmissionResponse> {
    const response = await this.http.post<
      ApiResponse<ContactSubmissionResponse>
    >(
      "/public/contact-submissions",
      body,
      turnstileToken
        ? { headers: { "X-Turnstile-Token": turnstileToken } }
        : undefined,
    );
    return response.data;
  }
}

export const contactSubmissionsService = new ContactSubmissionsService(
  publicHttpClient,
);
