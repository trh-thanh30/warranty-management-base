import { Prisma, product_status } from '@prisma/client';

export function buildProductOrderBy(
  sortBy?: keyof Prisma.ProductOrderByWithRelationInput,
  sortOrder: 'asc' | 'desc' = 'desc',
): Prisma.ProductOrderByWithRelationInput[] {
  if (!sortBy) return [{ created_at: 'desc' }, { id: 'desc' }];

  const orderBy = [
    { [sortBy]: sortOrder },
  ] as Prisma.ProductOrderByWithRelationInput[];

  if (sortBy !== 'created_at') orderBy.push({ created_at: 'desc' });
  orderBy.push({ id: 'desc' });
  return orderBy;
}

export function buildPublicProductWhere(filters: {
  categoryId?: string;
  search?: string;
  slug?: string;
}): Prisma.ProductWhereInput {
  const search = filters.search?.trim();

  return {
    ...(filters.categoryId ? { category_id: filters.categoryId } : {}),
    category_ref: { is_active: true },
    deleted_at: null,
    status: product_status.ACTIVE,
    is_published: true,
    ...(filters.slug ? { slug: filters.slug } : {}),
    ...(search
      ? {
          OR: [
            { display_name: { contains: search, mode: 'insensitive' } },
            { product_code: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
}

export function buildProductDeletionFilter(status?: product_status | 'ALL') {
  if (status === 'ALL') return undefined;
  return status === product_status.DELETED ? { not: null } : null;
}

export function buildEffectiveCatalogueFilters(filters: {
  categoryId?: string;
  activationCodeAssignable?: boolean;
}): Prisma.ProductWhereInput[] | undefined {
  const clauses: Prisma.ProductWhereInput[] = [];
  if (filters.categoryId) clauses.push({ category_id: filters.categoryId });
  if (filters.activationCodeAssignable) {
    clauses.push(
      { category_ref: { activation_code_enabled: true } },
      { warranty_duration_months: { gt: 0 } },
    );
  }
  return clauses.length > 0 ? clauses : undefined;
}

export function buildActivationEligibleProductWhere(): Prisma.ProductWhereInput {
  return {
    deleted_at: null,
    status: product_status.ACTIVE,
    warranty_duration_months: { gt: 0 },
  };
}

export function buildProductSearchWhere(
  search?: string,
): Prisma.ProductWhereInput {
  const value = search?.trim();
  if (!value) return {};

  return {
    OR: [
      { product_code: { contains: value, mode: 'insensitive' } },
      { warranty: { warranty_code: { contains: value, mode: 'insensitive' } } },
      { display_name: { contains: value, mode: 'insensitive' } },
      { brand: { contains: value, mode: 'insensitive' } },
      { model: { contains: value, mode: 'insensitive' } },
      {
        warranties: {
          some: {
            ownerships: {
              some: {
                is_current_owner: true,
                customer: {
                  full_name: { contains: value, mode: 'insensitive' },
                },
              },
            },
          },
        },
      },
    ],
  };
}
