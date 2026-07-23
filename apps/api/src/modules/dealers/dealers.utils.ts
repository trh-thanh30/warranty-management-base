import { ConflictError } from '@/common/response';
import { Prisma } from '@prisma/client';

export function normalizeDealerPhone(value: string | null | undefined) {
  return value?.trim() || null;
}

export function optionalTrim(value: string | null | undefined) {
  return value?.trim() || null;
}

export function mapDealerUniqueConflict(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(',')
      : String(error.meta?.target ?? '');

    if (target.includes('phone')) {
      return new ConflictError('Dealer phone already exists');
    }
  }

  return null;
}
