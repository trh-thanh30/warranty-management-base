import 'reflect-metadata';

import { ListCategoryTreeDto } from '@/modules/categories/dto/list-category-tree.dto';
import { ListCategoriesDto } from '@/modules/categories/dto/list-categories.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { category_type } from '@prisma/client';

describe('ListCategoryTreeDto', () => {
  it.each(['true', 'false', 'all'])('accepts isActive=%s', async (isActive) => {
    const dto = plainToInstance(ListCategoryTreeDto, {
      isActive,
      type: category_type.PRODUCT,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an unsupported active filter', async () => {
    const dto = plainToInstance(ListCategoryTreeDto, {
      isActive: 'yes',
      type: category_type.PRODUCT,
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});

describe('ListCategoriesDto', () => {
  it('accepts isActive=all', async () => {
    const dto = plainToInstance(ListCategoriesDto, { isActive: 'all' });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
