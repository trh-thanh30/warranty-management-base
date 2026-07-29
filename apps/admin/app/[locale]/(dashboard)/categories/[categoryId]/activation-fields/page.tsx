import { CategoryActivationFieldsView } from "@/src/views/categories/category-activation-fields.view";

type CategoryActivationFieldsPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function CategoryActivationFieldsPage({
  params,
}: CategoryActivationFieldsPageProps) {
  const { categoryId } = await params;

  return <CategoryActivationFieldsView categoryId={categoryId} />;
}
