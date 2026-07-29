import { WarrantyClaimDetailView } from "@/src/views/warranty-claims/warranty-claim-detail.view";

type WarrantyClaimDetailPageProps = {
  params: Promise<{
    claimId: string;
  }>;
};

export default async function WarrantyClaimDetailPage({
  params,
}: WarrantyClaimDetailPageProps) {
  const { claimId } = await params;

  return <WarrantyClaimDetailView claimId={claimId} />;
}
