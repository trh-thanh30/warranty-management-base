import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { CreateCategoryUseCase } from '@/modules/categories/use-cases/create-category.use-case';
import { DeactivateCategoryUseCase } from '@/modules/categories/use-cases/deactivate-category.use-case';
import { GetCategoryDetailUseCase } from '@/modules/categories/use-cases/get-category-detail.use-case';
import { ImportCategoriesUseCase } from '@/modules/categories/use-cases/import-categories.use-case';
import { ListCategoriesUseCase } from '@/modules/categories/use-cases/list-categories.use-case';
import { ListCategoryParentOptionsUseCase } from '@/modules/categories/use-cases/list-category-parent-options.use-case';
import { ListCategoryTreeUseCase } from '@/modules/categories/use-cases/list-category-tree.use-case';
import { ListPublicProductCategoriesUseCase } from '@/modules/categories/use-cases/list-public-product-categories.use-case';
import { ReorderCategoriesUseCase } from '@/modules/categories/use-cases/reorder-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/categories/use-cases/update-category.use-case';
import { CategoryHierarchyService } from '@/modules/categories/service/category-hierarchy.service';
import { category_type, user_role } from '@prisma/client';
import { createCategoryExportWorkbook } from '@/modules/categories/excel/category-workbook.factory';

jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));

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
  activation_code_enabled: true,
  metadata: { color: 'blue' },
  created_at: new Date('2026-07-09T00:00:00.000Z'),
  updated_at: new Date('2026-07-09T00:00:00.000Z'),
};

describe('Category use cases', () => {
  const categoriesRepository = {
    create: jest.fn(),
    countAssignedActivationCodes: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByTypeAndSlug: jest.fn(),
    getActivationFields: jest.fn(),
    list: jest.fn(),
    listByType: jest.fn(),
    listPublicProductCategories: jest.fn(),
    listAll: jest.fn(),
    listForExport: jest.fn(),
    importRows: jest.fn(),
    reorder: jest.fn(),
    update: jest.fn(),
  };
  const assetsService = {
    deleteAssetByUrl: jest.fn().mockResolvedValue(true),
  };
  const hierarchyService = () =>
    new CategoryHierarchyService(categoriesRepository as never);

  beforeEach(() => {
    jest.clearAllMocks();
    categoriesRepository.countAssignedActivationCodes.mockResolvedValue(0);
  });

  it('creates a category with generated slug', async () => {
    categoriesRepository.findByTypeAndSlug.mockResolvedValue(null);
    categoriesRepository.create.mockResolvedValue(category);
    const useCase = new CreateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
    );

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
    const useCase = new CreateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
    );

    await expect(
      useCase.execute({
        type: category_type.PRODUCT,
        slug: 'car',
        name: 'Car',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejects a moderator configuring activation codes while creating a category', async () => {
    const useCase = new CreateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
    );

    await expect(
      useCase.execute(
        {
          type: category_type.PRODUCT,
          name: 'Restricted category',
          activationCodeEnabled: false,
        },
        user_role.MODERATOR,
      ),
    ).rejects.toMatchObject({
      code: 'CATEGORY_ACTIVATION_CODE_CONFIG_ADMIN_ONLY',
    });
    expect(categoriesRepository.create).not.toHaveBeenCalled();
  });

  it('rejects parent category from another type', async () => {
    categoriesRepository.findByTypeAndSlug.mockResolvedValue(null);
    categoriesRepository.findById.mockResolvedValue({
      ...category,
      type: category_type.ASSET,
    });
    const useCase = new CreateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
    );

    await expect(
      useCase.execute({
        type: category_type.PRODUCT,
        parentId: 'asset-category-id',
        name: 'Car',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('creates a category under one valid parent', async () => {
    categoriesRepository.findByTypeAndSlug.mockResolvedValue(null);
    categoriesRepository.findById.mockResolvedValue({
      ...category,
      id: 'parent-id',
    });
    categoriesRepository.create.mockResolvedValue({
      ...category,
      id: 'child-id',
      parent_id: 'parent-id',
    });
    const useCase = new CreateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
    );

    await useCase.execute({
      type: category_type.PRODUCT,
      name: 'Child',
      parentId: 'parent-id',
    });

    expect(categoriesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        parent: { connect: { id: 'parent-id' } },
      }),
    );
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

  it('lists category roots with their descendants kept together', async () => {
    categoriesRepository.listByType.mockResolvedValue([
      category,
      {
        ...category,
        id: 'child-id',
        name: 'Child',
        slug: 'child',
        parent_id: category.id,
        order: 20,
      },
    ]);
    const useCase = new ListCategoryTreeUseCase(categoriesRepository as never);

    const result = await useCase.execute({
      type: category_type.PRODUCT,
      page: 1,
      limit: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.children[0]?.id).toBe('child-id');
    expect(result.meta).toMatchObject({
      totalCategories: 2,
      totalRoots: 1,
    });
  });

  it('does not filter category tree status when isActive is all', async () => {
    categoriesRepository.listByType.mockResolvedValue([
      category,
      {
        ...category,
        id: 'inactive-category-id',
        is_active: false,
        name: 'Inactive category',
        slug: 'inactive-category',
      },
    ]);
    const useCase = new ListCategoryTreeUseCase(categoriesRepository as never);

    const result = await useCase.execute({
      isActive: 'all',
      type: category_type.PRODUCT,
    });

    expect(result.items.map((item) => item.id)).toEqual([
      category.id,
      'inactive-category-id',
    ]);
  });

  it('paginates complete category branches instead of individual rows', async () => {
    const secondRoot = {
      ...category,
      id: 'second-root-id',
      name: 'Second root',
      slug: 'second-root',
      order: 30,
    };
    categoriesRepository.listByType.mockResolvedValue([
      category,
      {
        ...category,
        id: 'child-id',
        name: 'Child',
        slug: 'child',
        parent_id: category.id,
        order: 20,
      },
      secondRoot,
      {
        ...category,
        id: 'second-child-id',
        name: 'Second child',
        slug: 'second-child',
        parent_id: secondRoot.id,
        order: 40,
      },
    ]);
    const useCase = new ListCategoryTreeUseCase(categoriesRepository as never);

    const firstPage = await useCase.execute({
      type: category_type.PRODUCT,
      page: 1,
      limit: 1,
    });
    const secondPage = await useCase.execute({
      type: category_type.PRODUCT,
      page: 2,
      limit: 1,
    });

    expect(firstPage.items.map((item) => item.id)).toEqual([category.id]);
    expect(firstPage.items[0]?.children.map((item) => item.id)).toEqual([
      'child-id',
    ]);
    expect(secondPage.items.map((item) => item.id)).toEqual(['second-root-id']);
    expect(secondPage.items[0]?.children.map((item) => item.id)).toEqual([
      'second-child-id',
    ]);
  });

  it('keeps ancestors as context when a child matches tree search', async () => {
    categoriesRepository.listByType.mockResolvedValue([
      category,
      {
        ...category,
        id: 'child-id',
        name: 'Special child',
        slug: 'special-child',
        parent_id: category.id,
      },
    ]);
    const useCase = new ListCategoryTreeUseCase(categoriesRepository as never);

    const result = await useCase.execute({
      type: category_type.PRODUCT,
      search: 'special',
    });

    expect(result.items[0]).toMatchObject({
      id: category.id,
      isContextOnly: true,
    });
    expect(result.items[0]?.children[0]?.id).toBe('child-id');
    expect(result.items[0]?.children[0]).not.toHaveProperty('isContextOnly');
  });

  it('excludes the edited category and its descendants from parent options', async () => {
    categoriesRepository.listByType.mockResolvedValue([
      category,
      {
        ...category,
        id: 'child-id',
        name: 'Child',
        slug: 'child',
        parent_id: category.id,
      },
      {
        ...category,
        id: 'other-root-id',
        name: 'Other',
        slug: 'other',
      },
    ]);
    const useCase = new ListCategoryParentOptionsUseCase(
      categoriesRepository as never,
    );

    const result = await useCase.execute({
      currentCategoryId: category.id,
      type: category_type.PRODUCT,
    });

    expect(result.map((option) => option.id)).toEqual(['other-root-id']);
  });

  it('returns parent options without the paginated 100 category limit', async () => {
    categoriesRepository.listByType.mockResolvedValue(
      Array.from({ length: 101 }, (_, index) => ({
        ...category,
        id: `category-${index}`,
        name: `Category ${index}`,
        slug: `category-${index}`,
        order: index,
      })),
    );
    const useCase = new ListCategoryParentOptionsUseCase(
      categoriesRepository as never,
    );

    const result = await useCase.execute({ type: category_type.PRODUCT });

    expect(result).toHaveLength(101);
  });

  it('lists public product categories without admin-only fields', async () => {
    categoriesRepository.listPublicProductCategories.mockResolvedValue({
      items: [
        {
          ...category,
          image_url: 'https://cdn.example.com/categories/car.jpg',
          _count: { products: 3 },
        },
      ],
      meta: {
        page: 1,
        limit: 4,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    const useCase = new ListPublicProductCategoriesUseCase(
      categoriesRepository as never,
    );

    const result = await useCase.execute({
      page: 1,
      limit: 4,
      hasImage: 'true',
    });

    expect(
      categoriesRepository.listPublicProductCategories,
    ).toHaveBeenCalledWith({
      page: 1,
      limit: 4,
      hasImage: 'true',
    });
    expect(result).toEqual({
      items: [
        {
          id: 'category-id',
          slug: 'car',
          name: 'Car',
          description: 'Vehicles',
          parentId: null,
          icon: 'Car',
          imageUrl: 'https://cdn.example.com/categories/car.jpg',
          order: 10,
          productCount: 3,
        },
      ],
      meta: {
        page: 1,
        limit: 4,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    expect(result.items[0]).not.toHaveProperty('isActive');
    expect(result.items[0]).not.toHaveProperty('metadata');
    expect(result.items[0]).not.toHaveProperty('createdAt');
  });

  it('returns category detail', async () => {
    categoriesRepository.findById.mockResolvedValue(category);
    categoriesRepository.getActivationFields.mockResolvedValue({
      categoryId: 'category-id',
      activationFormEnabled: true,
      activationFields: [
        {
          id: 'field-id',
          key: 'windshield',
          label: 'Kính lái',
          type: 'PRODUCT_SELECT',
          required: true,
          order: 0,
          options: [],
        },
      ],
    });
    const useCase = new GetCategoryDetailUseCase(categoriesRepository as never);

    await expect(useCase.execute('category-id')).resolves.toMatchObject({
      id: 'category-id',
      metadata: { color: 'blue' },
      activationFormEnabled: true,
      activationFields: [
        expect.objectContaining({ key: 'windshield', type: 'PRODUCT_SELECT' }),
      ],
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
    const useCase = new UpdateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
      assetsService as never,
    );

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

  it('clears a category parent connection', async () => {
    categoriesRepository.findById.mockResolvedValue({
      ...category,
      parent_id: 'parent-id',
    });
    categoriesRepository.update.mockResolvedValue(category);
    const useCase = new UpdateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
      assetsService as never,
    );

    await useCase.execute('category-id', { parentId: null });

    expect(categoriesRepository.update).toHaveBeenCalledWith(
      'category-id',
      expect.objectContaining({ parent: { disconnect: true } }),
    );
  });

  it('rejects disabling activation codes while the category still has assigned codes', async () => {
    categoriesRepository.findById.mockResolvedValue(category);
    categoriesRepository.countAssignedActivationCodes.mockResolvedValue(3);
    const useCase = new UpdateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
      assetsService as never,
    );

    await expect(
      useCase.execute('category-id', { activationCodeEnabled: false }),
    ).rejects.toMatchObject({
      code: 'CATEGORY_ACTIVATION_CODES_STILL_ASSIGNED',
      details: { assignedCount: 3, categoryId: 'category-id' },
    });
    expect(categoriesRepository.update).not.toHaveBeenCalled();
  });

  it('rejects a moderator changing category activation-code configuration', async () => {
    const useCase = new UpdateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
      assetsService as never,
    );

    await expect(
      useCase.execute(
        'category-id',
        { activationCodeEnabled: false },
        user_role.MODERATOR,
      ),
    ).rejects.toMatchObject({
      code: 'CATEGORY_ACTIVATION_CODE_CONFIG_ADMIN_ONLY',
    });
    expect(categoriesRepository.findById).not.toHaveBeenCalled();
    expect(categoriesRepository.update).not.toHaveBeenCalled();
  });

  it('rejects selecting the edited category as its own parent', async () => {
    categoriesRepository.findById.mockResolvedValue(category);
    const useCase = new UpdateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
      assetsService as never,
    );

    await expect(
      useCase.execute('category-id', { parentId: 'category-id' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('deletes the previous category image before saving a replacement', async () => {
    categoriesRepository.findById.mockResolvedValue({
      ...category,
      image_url: 'https://cdn.example.com/old.jpg',
    });
    categoriesRepository.update.mockResolvedValue({
      ...category,
      image_url: 'https://cdn.example.com/new.jpg',
    });
    const useCase = new UpdateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
      assetsService as never,
    );

    await useCase.execute('category-id', {
      imageUrl: 'https://cdn.example.com/new.jpg',
    });

    expect(assetsService.deleteAssetByUrl).toHaveBeenCalledWith(
      'https://cdn.example.com/old.jpg',
      expect.objectContaining({ folder: 'categories' }),
    );
  });

  it('deletes rich-text media removed from the category description', async () => {
    categoriesRepository.findById.mockResolvedValue({
      ...category,
      description:
        '<p>Old</p><img src="https://cdn.example.com/rich-text/old.jpg">',
    });
    categoriesRepository.update.mockResolvedValue({
      ...category,
      description: '<p>New</p>',
    });
    const useCase = new UpdateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
      assetsService as never,
    );

    await useCase.execute('category-id', {
      description: '<p>New</p>',
    });

    expect(assetsService.deleteAssetByUrl).toHaveBeenCalledWith(
      'https://cdn.example.com/rich-text/old.jpg',
      expect.objectContaining({ folder: 'rich-text' }),
    );
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
    const useCase = new UpdateCategoryUseCase(
      categoriesRepository as never,
      hierarchyService(),
      assetsService as never,
    );

    await expect(
      useCase.execute('category-id', {
        parentId: 'child-id',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejects duplicate reorder items', async () => {
    const useCase = new ReorderCategoriesUseCase(
      categoriesRepository as never,
      hierarchyService(),
    );

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
    const useCase = new ReorderCategoriesUseCase(
      categoriesRepository as never,
      hierarchyService(),
    );

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
    const useCase = new ReorderCategoriesUseCase(
      categoriesRepository as never,
      hierarchyService(),
    );

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

  it('imports parent and child categories atomically', async () => {
    const buffer = await createCategoryExportWorkbook([
      {
        type: category_type.PRODUCT,
        code: 'VEHICLE',
        slug: 'vehicle',
        name: 'Xe',
        description: null,
        parentSlug: null,
        icon: null,
        imageUrl: null,
        order: 10,
        isActive: true,
        metadata: null,
      },
      {
        type: category_type.PRODUCT,
        code: 'SUV',
        slug: 'suv',
        name: 'Xe SUV',
        description: null,
        parentSlug: 'vehicle',
        icon: null,
        imageUrl: null,
        order: 20,
        isActive: true,
        metadata: null,
      },
    ]);
    categoriesRepository.listAll.mockResolvedValue([]);
    categoriesRepository.importRows.mockResolvedValue({
      created: 2,
      updated: 0,
    });
    const useCase = new ImportCategoriesUseCase(categoriesRepository as never);

    const result = await useCase.execute({ buffer } as Express.Multer.File);

    expect(result).toEqual({ created: 2, updated: 0, errors: [] });
    expect(categoriesRepository.importRows).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ slug: 'suv', parentSlug: 'vehicle' }),
      ]),
      new Set(),
    );
  });

  it('rejects a circular imported hierarchy before writing', async () => {
    const buffer = await createCategoryExportWorkbook([
      {
        type: category_type.PRODUCT,
        code: null,
        slug: 'first',
        name: 'First',
        description: null,
        parentSlug: 'second',
        icon: null,
        imageUrl: null,
        order: 10,
        isActive: true,
        metadata: null,
      },
      {
        type: category_type.PRODUCT,
        code: null,
        slug: 'second',
        name: 'Second',
        description: null,
        parentSlug: 'first',
        icon: null,
        imageUrl: null,
        order: 20,
        isActive: true,
        metadata: null,
      },
    ]);
    categoriesRepository.listAll.mockResolvedValue([]);
    const useCase = new ImportCategoriesUseCase(categoriesRepository as never);

    const result = await useCase.execute({ buffer } as Express.Multer.File);

    expect(result.errors[0]).toMatchObject({ field: 'parentSlug' });
    expect(categoriesRepository.importRows).not.toHaveBeenCalled();
  });
});
