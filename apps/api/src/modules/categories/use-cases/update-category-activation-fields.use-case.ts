import { BadRequestError, NotFoundError } from '@/common/response';
import { UpdateCategoryActivationFieldsDto } from '@/modules/categories/dto/update-category-activation-fields.dto';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';
import type {
  CategoryActivationFieldConfig,
  CategoryActivationFieldOption,
} from '@repo/shared';

@Injectable()
export class UpdateCategoryActivationFieldsUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(categoryId: string, dto: UpdateCategoryActivationFieldsDto) {
    const existing =
      await this.categoriesRepository.getActivationFields(categoryId);
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    const keys = new Set<string>();
    const activationFields = dto.activationFields.map((field, index) => {
      if (keys.has(field.key)) {
        throw new BadRequestError(
          'Category activation field keys must be unique',
          'CATEGORY_ACTIVATION_FIELD_KEY_DUPLICATE',
          { key: field.key },
        );
      }
      keys.add(field.key);

      const options = normalizeOptions(field.options ?? [], field.key);
      if (field.type !== 'SELECT' && options.length > 0) {
        throw new BadRequestError(
          'Static options are only allowed on SELECT fields',
          'CATEGORY_ACTIVATION_FIELD_OPTIONS_NOT_ALLOWED',
          { key: field.key, type: field.type },
        );
      }

      return {
        key: field.key,
        label: field.label.trim(),
        type: field.type,
        placeholder: field.placeholder?.trim() || undefined,
        required: field.required ?? false,
        order: field.order ?? index,
        options,
      } satisfies CategoryActivationFieldConfig;
    });

    return this.categoriesRepository.replaceActivationFields(categoryId, {
      activationFormEnabled: dto.activationFormEnabled,
      activationFields,
    });
  }
}

function normalizeOptions(
  options: CategoryActivationFieldOption[],
  fieldKey: string,
) {
  const values = new Set<string>();

  return options.map((option) => {
    const normalized = {
      label: option.label.trim(),
      value: option.value.trim(),
    };
    if (values.has(normalized.value)) {
      throw new BadRequestError(
        'Category activation field option values must be unique',
        'CATEGORY_ACTIVATION_FIELD_OPTION_DUPLICATE',
        { key: fieldKey, value: normalized.value },
      );
    }
    values.add(normalized.value);
    return normalized;
  });
}
