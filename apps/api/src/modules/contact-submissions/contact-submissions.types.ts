import type {
  ContactSubmissionResponse,
  ContactSubmissionStatus,
} from '@repo/shared';
import { isContactConsultationTopic } from '@repo/shared/constants';

export type ContactSubmissionRecord = {
  consultation_topic: string | null;
  content: string;
  created_at: Date;
  full_name: string;
  id: string;
  phone: string;
  province_code: string | null;
  province_name: string | null;
  source_path: string | null;
  status: ContactSubmissionStatus;
  updated_at: Date;
};

export function toContactSubmissionResponse(
  submission: ContactSubmissionRecord,
): ContactSubmissionResponse {
  return {
    consultationTopic: isContactConsultationTopic(submission.consultation_topic)
      ? submission.consultation_topic
      : null,
    content: submission.content,
    createdAt: submission.created_at.toISOString(),
    fullName: submission.full_name,
    id: submission.id,
    phone: submission.phone,
    provinceCode: submission.province_code,
    provinceName: submission.province_name,
    sourcePath: submission.source_path,
    status: submission.status,
    updatedAt: submission.updated_at.toISOString(),
  };
}
