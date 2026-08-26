import { Prisma } from '@prisma/client';
import type { category_type } from '@prisma/client';

export function toCategoryKey(type: category_type, slug: string) {
  return `${type}:${slug}`;
}

export function toJsonValue(value: Record<string, unknown> | null) {
  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonObject);
}
