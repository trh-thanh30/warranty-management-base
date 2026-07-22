import { WarrantyActivationRequestDetailView } from "@/src/views/warranty-activation-requests/warranty-activation-request-detail.view";

type WarrantyActivationRequestDetailPageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export default async function WarrantyActivationRequestDetailPage({
  params,
}: WarrantyActivationRequestDetailPageProps) {
  const { requestId } = await params;

  return <WarrantyActivationRequestDetailView requestId={requestId} />;
}
