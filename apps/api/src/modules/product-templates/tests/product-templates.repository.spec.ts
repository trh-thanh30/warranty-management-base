import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';

describe('ProductTemplatesRepository.list', () => {
  it('searches active templates by template and category fields', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prismaService = {
      $transaction: jest.fn((callback: (tx: unknown) => unknown) =>
        callback({
          productTemplate: {
            count,
            findMany,
          },
        }),
      ),
    };
    const repository = new ProductTemplatesRepository(prismaService as never);

    await repository.list({
      isActive: 'true',
      limit: 20,
      page: 1,
      search: 'Film',
    });

    const categorySearch = {
      category_ref: {
        is: {
          OR: [
            { name: { contains: 'Film', mode: 'insensitive' } },
            { code: { contains: 'Film', mode: 'insensitive' } },
            { slug: { contains: 'Film', mode: 'insensitive' } },
          ],
        },
      },
    };

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          is_active: true,
          OR: expect.arrayContaining([categorySearch]),
        }),
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        is_active: true,
        OR: expect.arrayContaining([categorySearch]),
      }),
    });
  });
});
