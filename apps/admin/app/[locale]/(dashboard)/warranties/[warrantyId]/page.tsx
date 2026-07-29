import { WarrantyDetailView } from "@/src/views/warranties/warranty-detail.view";

type WarrantyDetailPageProps = {
  params: Promise<{
    warrantyId: string;
  }>;
};

export default async function WarrantyDetailPage({
  params,
}: WarrantyDetailPageProps) {
  const { warrantyId } = await params;

  return <WarrantyDetailView warrantyId={warrantyId} />;
}
