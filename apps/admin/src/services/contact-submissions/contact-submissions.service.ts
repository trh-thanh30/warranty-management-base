import { adminHttpClient } from "@/src/lib/admin-http-client";
import { createContactSubmissionsService } from "./create-contact-submissions.service";
import type { ContactSubmissionsHttpClient } from "./contact-submissions.types";

export const contactSubmissionsService = createContactSubmissionsService(
  adminHttpClient as unknown as ContactSubmissionsHttpClient,
);
