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
  brand: string | null;
  model: string | null;
  manufactureYear: number | null;
  description: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
