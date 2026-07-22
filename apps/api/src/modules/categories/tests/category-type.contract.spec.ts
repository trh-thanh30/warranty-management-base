import { category_type } from '@prisma/client';
import { CATEGORY_TYPES } from '@repo/shared/constants';

describe('Category type contract', () => {
  it('keeps shared category types synchronized with Prisma', () => {
    expect([...CATEGORY_TYPES].sort()).toEqual(
      Object.values(category_type).sort(),
    );
  });
});
