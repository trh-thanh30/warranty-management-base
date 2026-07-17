import { ContentPageFormView } from "@/src/views/content-pages/content-page-form.view";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  return <ContentPageFormView mode="edit" pageId={pageId} />;
}
