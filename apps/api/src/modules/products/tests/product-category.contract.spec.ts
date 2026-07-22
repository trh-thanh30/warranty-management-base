import { product_category } from '@prisma/client';
import { PRODUCT_CATEGORIES } from '@repo/shared/constants';

describe('Product category contract', () => {
  it('keeps shared product categories synchronized with Prisma', () => {
    expect([...PRODUCT_CATEGORIES].sort()).toEqual(
      Object.values(product_category).sort(),
    );
  });
});
