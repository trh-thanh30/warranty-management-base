import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@repo/shared/constants';

type PaginationInput = {
  page?: number;
  limit?: number;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type PaginatedResponse<T> = {
  items: T[];
  meta: PaginationMeta;
};

export function normalizePagination(input: PaginationInput) {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, input.limit ?? DEFAULT_PAGE_SIZE),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
}

export function createPaginationMeta(input: {
  page: number;
  limit: number;
  total: number;
}): PaginationMeta {
  const totalPages = Math.ceil(input.total / input.limit);

  return {
    page: input.page,
    limit: input.limit,
    total: input.total,
    totalPages,
    hasNextPage: input.page < totalPages,
    hasPreviousPage: input.page > 1,
  };
}

export function paginate<T>(
  items: T[],
  input: { page: number; limit: number; total: number },
): PaginatedResponse<T> {
  return {
    items,
    meta: createPaginationMeta(input),
  };
}
