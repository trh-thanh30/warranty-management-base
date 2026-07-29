import {
  CONTACT_CONSULTATION_TOPICS,
  CONTACT_SUBMISSION_LIMITS,
  PHONE_NUMBER_PATTERN,
} from "@repo/shared/constants";
import type { ContactConsultationTopic } from "@repo/shared";
import { z } from "zod";

export type ContactFormValidationMessages = {
  consultationTopicRequired: string;
  contentMax: string;
  contentMin: string;
  fullNameMax: string;
  fullNameMin: string;
  phoneInvalid: string;
  provinceRequired: string;
};

export type ContactMessageFormValues = {
  consultationTopic: ContactConsultationTopic;
  content: string;
  fullName: string;
  phone: string;
  provinceCode: string;
};

export function createContactMessageSchema(
  messages: ContactFormValidationMessages,
) {
  return z.object({
    consultationTopic: z.enum(CONTACT_CONSULTATION_TOPICS, {
      required_error: messages.consultationTopicRequired,
    }),
    fullName: z
      .string()
      .trim()
      .min(CONTACT_SUBMISSION_LIMITS.fullName.min, messages.fullNameMin)
      .max(CONTACT_SUBMISSION_LIMITS.fullName.max, messages.fullNameMax),
    phone: z
      .string()
      .trim()
      .min(CONTACT_SUBMISSION_LIMITS.phone.min, messages.phoneInvalid)
      .max(CONTACT_SUBMISSION_LIMITS.phone.max, messages.phoneInvalid)
      .regex(PHONE_NUMBER_PATTERN, messages.phoneInvalid),
    provinceCode: z
      .string()
      .trim()
      .min(
        CONTACT_SUBMISSION_LIMITS.provinceCode.min,
        messages.provinceRequired,
      )
      .max(
        CONTACT_SUBMISSION_LIMITS.provinceCode.max,
        messages.provinceRequired,
      ),
    content: z
      .string()
      .trim()
      .min(CONTACT_SUBMISSION_LIMITS.content.min, messages.contentMin)
      .max(CONTACT_SUBMISSION_LIMITS.content.max, messages.contentMax),
  });
}
