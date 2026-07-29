import { WarrantyEditView } from "@/src/views/warranties/warranty-edit.view";

type EditWarrantyPageProps = {
  params: Promise<{
    warrantyId: string;
  }>;
};

export default async function EditWarrantyPage({
  params,
}: EditWarrantyPageProps) {
  const { warrantyId } = await params;

  return <WarrantyEditView warrantyId={warrantyId} />;
}
