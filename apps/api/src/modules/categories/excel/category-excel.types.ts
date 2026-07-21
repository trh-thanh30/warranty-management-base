import { category_type } from '@prisma/client';

export type CategoryExcelRow = {
  type: category_type;
  code: string | null;
  slug: string;
  name: string;
  description: string | null;
  parentSlug: string | null;
  icon: string | null;
  imageUrl: string | null;
  order: number;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
};

export type PreparedCategoryImportRow = CategoryExcelRow & {
  rowNumber: number;
};
