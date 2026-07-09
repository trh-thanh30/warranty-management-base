import {
  Category,
  Customer,
  Product,
  ProductOwnership,
  Warranty,
} from '@prisma/client';

type ProductWithRelations = Product & {
  category_ref?: Category | null;
  ownerships?: Array<ProductOwnership & { customer?: Customer }>;
  warranty?: Warranty | null;
};

function toCategorySummary(category: Category | null | undefined) {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    type: category.type,
    code: category.code,
    slug: category.slug,
    name: category.name,
    description: category.description,
    parentId: category.parent_id,
    icon: category.icon,
    imageUrl: category.image_url,
    order: category.order,
    isActive: category.is_active,
    metadata: category.metadata as Record<string, unknown> | null,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  };
}

export function toProductResponse(product: ProductWithRelations) {
  const currentOwnership = product.ownerships?.find(
    (ownership) => ownership.is_current_owner,
  );

  return {
    id: product.id,
    productCode: product.product_code,
    warrantyCode: product.warranty_code,
    serialNumber: product.serial_number,
    name: product.name,
    category: product.category,
    categoryId: product.category_id,
    categoryRef: toCategorySummary(product.category_ref),
    brand: product.brand,
    model: product.model,
    manufactureYear: product.manufacture_year,
    description: product.description,
    status: product.status,
    metadata: product.metadata as Record<string, unknown> | null,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    deletedAt: product.deleted_at,
    owner: currentOwnership
      ? {
          customerId: currentOwnership.customer_id,
          ownerUserId: currentOwnership.owner_user_id,
          customerCode: currentOwnership.customer?.customer_code,
          fullName: currentOwnership.customer?.full_name,
          purchaseDate: currentOwnership.purchase_date,
          activatedAt: currentOwnership.activated_at,
        }
      : null,
    warranty: product.warranty
      ? {
          id: product.warranty.id,
          warrantyCode: product.warranty.warranty_code,
          startDate: product.warranty.start_date,
          endDate: product.warranty.end_date,
          durationMonths: product.warranty.duration_months,
          status: product.warranty.status,
          terms: product.warranty.terms,
        }
      : null,
  };
}
