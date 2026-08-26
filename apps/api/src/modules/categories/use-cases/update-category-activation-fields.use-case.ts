import { BadRequestError, NotFoundError } from '@/common/response';
import { UpdateCategoryActivationFieldsDto } from '@/modules/categories/dto/update-category-activation-fields.dto';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import {
  slugifyCategoryActivationFieldKey,
  uniqueCategoryActivationFieldKey,
} from '@/modules/categories/utils/category-activation-field-key.utils';
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
    const labels = new Set<string>();
    const activationFields = dto.activationFields.map((field, index) => {
      const normalizedLabel = field.label.trim().replace(/\s+/g, ' ');
      const labelIdentity = normalizedLabel.toLocaleLowerCase();
      if (labels.has(labelIdentity)) {
        throw new BadRequestError(
          'Category activation field labels must be unique',
          'CATEGORY_ACTIVATION_FIELD_LABEL_DUPLICATE',
          { label: normalizedLabel },
        );
      }
      labels.add(labelIdentity);

      const existingField = field.id
        ? existing.activationFields.find((item) => item.id === field.id)
        : undefined;
      const key =
        existingField?.key ??
        field.key ??
        uniqueCategoryActivationFieldKey(
          slugifyCategoryActivationFieldKey(normalizedLabel),
          keys,
        );
      if (keys.has(key)) {
        throw new BadRequestError(
          'Category activation field keys must be unique',
          'CATEGORY_ACTIVATION_FIELD_KEY_DUPLICATE',
          { key },
        );
      }
      keys.add(key);

      const options = this.normalizeOptions(field.options ?? [], key);
      if (field.type !== 'SELECT' && options.length > 0) {
        throw new BadRequestError(
          'Static options are only allowed on SELECT fields',
          'CATEGORY_ACTIVATION_FIELD_OPTIONS_NOT_ALLOWED',
          { key, type: field.type },
        );
      }

      return {
        id: existingField?.id,
        key,
        label: normalizedLabel,
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
  private normalizeOptions(
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
}
