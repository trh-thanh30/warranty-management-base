import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { category_type } from '@prisma/client';

describe('CategoriesRepository.listPublicProductCategories', () => {
  it('returns active product categories and counts only visible templates', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const repository = new CategoriesRepository({
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({
          category: { count, findMany },
        }),
      ),
    } as never);

    await repository.listPublicProductCategories({
      page: 2,
      limit: 4,
      hasImage: 'true',
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        type: category_type.PRODUCT,
        is_active: true,
        image_url: { not: null },
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      skip: 4,
      take: 4,
      include: {
        _count: {
          select: {
            product_templates: {
              where: {
                is_active: true,
                is_published: true,
              },
            },
          },
        },
      },
    });
    expect(count).toHaveBeenCalledWith({
      where: {
        type: category_type.PRODUCT,
        is_active: true,
        image_url: { not: null },
      },
    });
  });
});
