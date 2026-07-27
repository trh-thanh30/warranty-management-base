import { ProductTemplateDetailView } from "@/src/views/product-templates/product-template-detail.view";

export default async function ProductTemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  return <ProductTemplateDetailView templateId={templateId} />;
}
