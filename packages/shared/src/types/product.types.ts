import type { CategorySummary } from "./category.types.ts";

export type ProductCategory =
  | "CAR"
  | "ACCESSORY"
  | "SPARE_PART"
  | "SERVICE_PACKAGE";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export type ProductSummary = {
  id: string;
  productCode: string;
  warrantyCode: string;
  serialNumber: string | null;
  name: string;
  category: ProductCategory;
  categoryId: string | null;
  categoryRef: CategorySummary | null;
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  description: string | null;
  status: ProductStatus;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
