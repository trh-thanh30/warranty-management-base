import { WarrantyActivationRequestEditView } from "@/src/views/warranty-activation-requests/warranty-activation-request-edit.view";

type WarrantyActivationRequestEditPageProps = {
  params: Promise<{ requestId: string }>;
};

export default async function WarrantyActivationRequestEditPage({
  params,
}: WarrantyActivationRequestEditPageProps) {
  const { requestId } = await params;

  return <WarrantyActivationRequestEditView requestId={requestId} />;
}
