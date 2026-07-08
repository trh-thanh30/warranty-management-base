export type CategoryType =
  | "PRODUCT"
  | "CONTENT_PAGE"
  | "ASSET"
  | "WARRANTY_CLAIM_ISSUE";

export type CategorySummary = {
  id: string;
  type: CategoryType;
  code: string | null;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  icon: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryResponse = CategorySummary & {
  children?: CategorySummary[];
};
