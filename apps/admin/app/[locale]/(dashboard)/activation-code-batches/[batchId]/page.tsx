import { ActivationCodeDetailView } from "@/src/views/activation-code-batches/activation-code-detail.view";

export default async function ActivationCodeDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  return <ActivationCodeDetailView batchId={batchId} />;
}
