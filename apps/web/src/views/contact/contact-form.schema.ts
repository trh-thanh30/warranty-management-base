import { z } from "zod";

const PHONE_PATTERN = /^[0-9+\s().-]{8,20}$/;

export type ContactFormValidationMessages = {
  contentMin: string;
  fullNameMin: string;
  phoneInvalid: string;
};

export type ContactMessageFormValues = {
  content: string;
  fullName: string;
  phone: string;
};

export function createContactMessageSchema(
  messages: ContactFormValidationMessages,
) {
  return z.object({
    fullName: z.string().trim().min(2, messages.fullNameMin),
    phone: z.string().trim().regex(PHONE_PATTERN, messages.phoneInvalid),
    content: z.string().trim().min(10, messages.contentMin),
  });
}
