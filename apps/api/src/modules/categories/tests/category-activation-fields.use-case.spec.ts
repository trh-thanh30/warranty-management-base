import 'reflect-metadata';

import { BadRequestError, NotFoundError } from '@/common/response';
import { UpdateCategoryActivationFieldsDto } from '@/modules/categories/dto/update-category-activation-fields.dto';
import { GetCategoryActivationFieldsUseCase } from '@/modules/categories/use-cases/get-category-activation-fields.use-case';
import { UpdateCategoryActivationFieldsUseCase } from '@/modules/categories/use-cases/update-category-activation-fields.use-case';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('Category activation field use cases', () => {
  const categoriesRepository = {
    getActivationFields: jest.fn(),
    replaceActivationFields: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns first-class activation fields for a category', async () => {
    categoriesRepository.getActivationFields.mockResolvedValue({
      categoryId: 'category-id',
      activationFormEnabled: true,
      activationFields: [
        {
          id: 'field-id',
          key: 'windshield',
          label: 'Kính lái',
          type: 'PRODUCT_SELECT',
          placeholder: 'Chọn sản phẩm',
          required: true,
          order: 0,
          options: [],
        },
      ],
    });
    const useCase = new GetCategoryActivationFieldsUseCase(
      categoriesRepository as never,
    );

    await expect(useCase.execute('category-id')).resolves.toEqual(
      expect.objectContaining({
        categoryId: 'category-id',
        activationFormEnabled: true,
        activationFields: [
          expect.objectContaining({
            id: 'field-id',
            key: 'windshield',
            type: 'PRODUCT_SELECT',
          }),
        ],
      }),
    );
  });

  it('rejects an unknown category', async () => {
    categoriesRepository.getActivationFields.mockResolvedValue(null);
    const useCase = new GetCategoryActivationFieldsUseCase(
      categoriesRepository as never,
    );

    await expect(useCase.execute('missing-category')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('replaces the complete activation field configuration', async () => {
    const saved = {
      categoryId: 'category-id',
      activationFormEnabled: true,
      activationFields: [],
    };
    categoriesRepository.getActivationFields.mockResolvedValue({
      categoryId: 'category-id',
      activationFormEnabled: false,
      activationFields: [],
    });
    categoriesRepository.replaceActivationFields.mockResolvedValue(saved);
    const useCase = new UpdateCategoryActivationFieldsUseCase(
      categoriesRepository as never,
    );
    const input = {
      activationFormEnabled: true,
      activationFields: [
        {
          key: 'windshield',
          label: ' Kính lái ',
          type: 'PRODUCT_SELECT' as const,
          placeholder: ' Chọn sản phẩm ',
          required: true,
          order: 3,
        },
      ],
    };

    await expect(useCase.execute('category-id', input)).resolves.toBe(saved);
    expect(categoriesRepository.replaceActivationFields).toHaveBeenCalledWith(
      'category-id',
      {
        activationFormEnabled: true,
        activationFields: [
          {
            key: 'windshield',
            label: 'Kính lái',
            type: 'PRODUCT_SELECT',
            placeholder: 'Chọn sản phẩm',
            required: true,
            order: 3,
            options: [],
          },
        ],
      },
    );
  });

  it('rejects duplicate field keys', async () => {
    categoriesRepository.getActivationFields.mockResolvedValue({
      categoryId: 'category-id',
      activationFormEnabled: false,
      activationFields: [],
    });
    const useCase = new UpdateCategoryActivationFieldsUseCase(
      categoriesRepository as never,
    );

    await expect(
      useCase.execute('category-id', {
        activationFormEnabled: true,
        activationFields: [
          { key: 'windshield', label: 'A', type: 'PRODUCT_SELECT' },
          { key: 'windshield', label: 'B', type: 'PRODUCT_SELECT' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(categoriesRepository.replaceActivationFields).not.toHaveBeenCalled();
  });

  it('rejects static options on PRODUCT_SELECT fields', async () => {
    categoriesRepository.getActivationFields.mockResolvedValue({
      categoryId: 'category-id',
      activationFormEnabled: false,
      activationFields: [],
    });
    const useCase = new UpdateCategoryActivationFieldsUseCase(
      categoriesRepository as never,
    );

    await expect(
      useCase.execute('category-id', {
        activationFormEnabled: true,
        activationFields: [
          {
            key: 'windshield',
            label: 'Kính lái',
            type: 'PRODUCT_SELECT',
            options: [{ label: 'SP50', value: 'SP50' }],
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: 'CATEGORY_ACTIVATION_FIELD_OPTIONS_NOT_ALLOWED',
    });
    expect(categoriesRepository.replaceActivationFields).not.toHaveBeenCalled();
  });
});

describe('UpdateCategoryActivationFieldsDto', () => {
  it('accepts existing camelCase activation field keys', async () => {
    const dto = plainToInstance(UpdateCategoryActivationFieldsDto, {
      activationFormEnabled: false,
      activationFields: [
        {
          key: 'frontLeftSide',
          label: 'Kính sườn trước - trái',
          type: 'PRODUCT_SELECT',
          required: false,
          order: 1,
          options: [],
        },
      ],
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('validates field keys and supported types', async () => {
    const dto = plainToInstance(UpdateCategoryActivationFieldsDto, {
      activationFormEnabled: true,
      activationFields: [
        {
          key: 'Kính lái',
          label: 'Kính lái',
          type: 'UNKNOWN',
        },
      ],
    });

    const errors = await validate(dto);

    expect(errors).not.toHaveLength(0);
  });
});
