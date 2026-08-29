import { redirect } from "next/navigation";

export default async function ProductTemplateDetailPage({
  params,
}: {
  params: Promise<{ locale: string; templateId: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/products`);
}
