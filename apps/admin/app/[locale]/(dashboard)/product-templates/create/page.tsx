import { redirect } from "next/navigation";

export default async function CreateProductTemplatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/products`);
}
