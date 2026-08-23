import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';

describe('CategoriesRepository activation fields', () => {
  it('maps category fields and options into the shared response', async () => {
    const findUnique = jest.fn().mockResolvedValue({
      id: 'category-id',
      activation_form_enabled: true,
      activation_fields: [
        {
          id: 'field-id',
          key: 'windshield',
          label: 'Kính lái',
          type: 'PRODUCT_SELECT',
          placeholder: null,
          required: true,
          sort_order: 2,
          options: [],
        },
      ],
    });
    const repository = new CategoriesRepository({
      category: { findUnique },
    } as never);

    await expect(
      repository.getActivationFields('category-id'),
    ).resolves.toEqual({
      categoryId: 'category-id',
      activationFormEnabled: true,
      activationFields: [
        {
          id: 'field-id',
          key: 'windshield',
          label: 'Kính lái',
          type: 'PRODUCT_SELECT',
          placeholder: undefined,
          required: true,
          order: 2,
          options: [],
        },
      ],
    });
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'category-id' } }),
    );
  });

  it('replaces fields and options in one transaction', async () => {
    const categoryUpdate = jest.fn().mockResolvedValue({ id: 'category-id' });
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const create = jest.fn().mockResolvedValue({ id: 'field-id' });
    const findUniqueOrThrow = jest.fn().mockResolvedValue({
      id: 'category-id',
      activation_form_enabled: true,
      activation_fields: [],
    });
    const transaction = jest.fn((callback: (tx: unknown) => unknown) =>
      callback({
        category: { findUniqueOrThrow, update: categoryUpdate },
        categoryActivationField: { create, deleteMany },
      }),
    );
    const repository = new CategoriesRepository({
      $transaction: transaction,
    } as never);

    await repository.replaceActivationFields('category-id', {
      activationFormEnabled: true,
      activationFields: [
        {
          key: 'film_grade',
          label: 'Dòng phim',
          type: 'SELECT',
          placeholder: undefined,
          required: false,
          order: 0,
          options: [{ label: 'SP50', value: 'SP50' }],
        },
      ],
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(categoryUpdate).toHaveBeenCalledWith({
      where: { id: 'category-id' },
      data: { activation_form_enabled: true },
    });
    expect(deleteMany).toHaveBeenCalledWith({
      where: { category_id: 'category-id' },
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        category_id: 'category-id',
        key: 'film_grade',
        options: {
          create: [{ label: 'SP50', value: 'SP50', sort_order: 0 }],
        },
      }),
    });
  });
});
