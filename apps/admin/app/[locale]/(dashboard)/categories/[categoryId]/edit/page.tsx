import { CategoryFormView } from "@/src/views/categories/category-form.view";

type EditCategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { categoryId } = await params;

  return <CategoryFormView categoryId={categoryId} mode="edit" />;
}
