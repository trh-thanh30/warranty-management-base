import { ProductTemplateFormView } from "@/src/views/product-templates/product-template-form.view";

export default async function EditProductTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  return <ProductTemplateFormView mode="edit" templateId={templateId} />;
}
