import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { CreateCategoryUseCase } from '@/modules/categories/use-cases/create-category.use-case';
import { DeactivateCategoryUseCase } from '@/modules/categories/use-cases/deactivate-category.use-case';
import { GetCategoryDetailUseCase } from '@/modules/categories/use-cases/get-category-detail.use-case';
import { ListCategoriesUseCase } from '@/modules/categories/use-cases/list-categories.use-case';
import { ReorderCategoriesUseCase } from '@/modules/categories/use-cases/reorder-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/categories/use-cases/update-category.use-case';
import { category_type } from '@prisma/client';

const category = {
  id: 'category-id',
  type: category_type.PRODUCT,
  code: 'CAR',
  slug: 'car',
  name: 'Car',
  description: 'Vehicles',
  parent_id: null,
  icon: 'Car',
  image_url: null,
  order: 10,
  is_active: true,
  metadata: { color: 'blue' },
  created_at: new Date('2026-07-09T00:00:00.000Z'),
  updated_at: new Date('2026-07-09T00:00:00.000Z'),
};

describe('Category use cases', () => {
  const categoriesRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByTypeAndSlug: jest.fn(),
    list: jest.fn(),
    reorder: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a category with generated slug', async () => {
    categoriesRepository.findByTypeAndSlug.mockResolvedValue(null);
    categoriesRepository.create.mockResolvedValue(category);
    const useCase = new CreateCategoryUseCase(categoriesRepository as never);

    const result = await useCase.execute({
      type: category_type.PRODUCT,
      code: 'car',
      name: ' Xe bảo hành ',
      icon: ' Car ',
    });

    expect(categoriesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: category_type.PRODUCT,
        code: 'CAR',
        slug: 'xe-bao-hanh',
        name: 'Xe bảo hành',
        icon: 'Car',
      }),
    );
    expect(result.id).toBe('category-id');
  });

  it('rejects duplicate slug in the same type', async () => {
    categoriesRepository.findByTypeAndSlug.mockResolvedValue(category);
    const useCase = new CreateCategoryUseCase(categoriesRepository as never);

    await expect(
      useCase.execute({
        type: category_type.PRODUCT,
        slug: 'car',
        name: 'Car',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejects parent category from another type', async () => {
    categoriesRepository.findByTypeAndSlug.mockResolvedValue(null);
    categoriesRepository.findById.mockResolvedValue({
      ...category,
      type: category_type.ASSET,
    });
    const useCase = new CreateCategoryUseCase(categoriesRepository as never);

    await expect(
      useCase.execute({
        type: category_type.PRODUCT,
        parentId: 'asset-category-id',
        name: 'Car',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('lists categories', async () => {
    categoriesRepository.list.mockResolvedValue({
      items: [category],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    const useCase = new ListCategoriesUseCase(categoriesRepository as never);

    const result = await useCase.execute({ type: category_type.PRODUCT });

    expect(categoriesRepository.list).toHaveBeenCalledWith({
      type: category_type.PRODUCT,
    });
    expect(result.items[0]?.slug).toBe('car');
  });

  it('returns category detail', async () => {
    categoriesRepository.findById.mockResolvedValue(category);
    const useCase = new GetCategoryDetailUseCase(categoriesRepository as never);

    await expect(useCase.execute('category-id')).resolves.toMatchObject({
      id: 'category-id',
      metadata: { color: 'blue' },
    });
  });

  it('throws not found when detail is absent', async () => {
    categoriesRepository.findById.mockResolvedValue(null);
    const useCase = new GetCategoryDetailUseCase(categoriesRepository as never);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('updates a category parent connection', async () => {
    categoriesRepository.findById
      .mockResolvedValueOnce(category)
      .mockResolvedValueOnce({ ...category, id: 'parent-id' });
    categoriesRepository.update.mockResolvedValue({
      ...category,
      parent_id: 'parent-id',
    });
    const useCase = new UpdateCategoryUseCase(categoriesRepository as never);

    const result = await useCase.execute('category-id', {
      parentId: 'parent-id',
    });

    expect(categoriesRepository.update).toHaveBeenCalledWith(
      'category-id',
      expect.objectContaining({
        parent: { connect: { id: 'parent-id' } },
      }),
    );
    expect(result.parentId).toBe('parent-id');
  });

  it('rejects updating a category under its descendant', async () => {
    categoriesRepository.findById
      .mockResolvedValueOnce(category)
      .mockResolvedValueOnce({
        ...category,
        id: 'child-id',
        parent_id: 'category-id',
      })
      .mockResolvedValueOnce(category);
    const useCase = new UpdateCategoryUseCase(categoriesRepository as never);

    await expect(
      useCase.execute('category-id', {
        parentId: 'child-id',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejects duplicate reorder items', async () => {
    const useCase = new ReorderCategoriesUseCase(categoriesRepository as never);

    await expect(
      useCase.execute({
        items: [
          { id: 'category-id', order: 10 },
          { id: 'category-id', order: 20 },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('reorders categories under a parent', async () => {
    const parent = { ...category, id: 'parent-id' };
    const firstChild = { ...category, id: 'first-child', parent_id: null };
    const secondChild = { ...category, id: 'second-child', parent_id: null };
    categoriesRepository.findByIds.mockResolvedValue([firstChild, secondChild]);
    categoriesRepository.findById.mockResolvedValue(parent);
    categoriesRepository.reorder.mockResolvedValue([
      { ...firstChild, parent_id: 'parent-id', order: 10 },
      { ...secondChild, parent_id: 'parent-id', order: 20 },
    ]);
    const useCase = new ReorderCategoriesUseCase(categoriesRepository as never);

    const result = await useCase.execute({
      parentId: 'parent-id',
      items: [
        { id: 'first-child', order: 10 },
        { id: 'second-child', order: 20 },
      ],
    });

    expect(categoriesRepository.reorder).toHaveBeenCalledWith({
      parentId: 'parent-id',
      items: [
        { id: 'first-child', order: 10 },
        { id: 'second-child', order: 20 },
      ],
    });
    expect(result).toHaveLength(2);
  });

  it('rejects reorder when target parent is a descendant', async () => {
    categoriesRepository.findByIds.mockResolvedValue([category]);
    categoriesRepository.findById
      .mockResolvedValueOnce({
        ...category,
        id: 'child-id',
        parent_id: 'category-id',
      })
      .mockResolvedValueOnce(category);
    const useCase = new ReorderCategoriesUseCase(categoriesRepository as never);

    await expect(
      useCase.execute({
        parentId: 'child-id',
        items: [{ id: 'category-id', order: 10 }],
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('deactivates a category', async () => {
    categoriesRepository.findById.mockResolvedValue(category);
    categoriesRepository.update.mockResolvedValue({
      ...category,
      is_active: false,
    });
    const useCase = new DeactivateCategoryUseCase(
      categoriesRepository as never,
    );

    const result = await useCase.execute('category-id');

    expect(categoriesRepository.update).toHaveBeenCalledWith('category-id', {
      is_active: false,
    });
    expect(result.isActive).toBe(false);
  });
});
