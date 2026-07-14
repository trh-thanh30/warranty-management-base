import { ConflictError } from '@/common/response';
import { Prisma } from '@prisma/client';

export function normalizeServiceCenterPhone(phone?: string) {
  return phone?.trim().replace(/[\s().-]/g, '') || undefined;
}

export function normalizeServiceCenterEmail(email?: string) {
  return email?.trim().toLowerCase() || undefined;
}

export function mapServiceCenterUniqueConflict(error: unknown) {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== 'P2002'
  ) {
    return null;
  }

  const target = JSON.stringify(error.meta?.target ?? '').toLowerCase();
  if (target.includes('phone')) {
    return new ConflictError('Service center phone already exists');
  }

  if (target.includes('email')) {
    return new ConflictError('Service center email already exists');
  }

  return new ConflictError('Service center contact already exists');
}
