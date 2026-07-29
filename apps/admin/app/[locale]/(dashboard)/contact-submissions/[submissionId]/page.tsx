import { ContactSubmissionDetailView } from "@/src/views/contact-submissions/contact-submission-detail.view";

type ContactSubmissionDetailPageProps = {
  params: Promise<{
    submissionId: string;
  }>;
};

export default async function ContactSubmissionDetailPage({
  params,
}: ContactSubmissionDetailPageProps) {
  const { submissionId } = await params;

  return <ContactSubmissionDetailView submissionId={submissionId} />;
}
