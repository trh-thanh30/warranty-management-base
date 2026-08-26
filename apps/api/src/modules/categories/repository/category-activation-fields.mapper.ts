import { Prisma } from '@prisma/client';
import type { CategoryActivationFieldsResponse } from '@repo/shared';

export const categoryActivationFieldsSelect = {
  id: true,
  activation_form_enabled: true,
  activation_fields: {
    where: { is_active: true },
    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
    include: {
      options: {
        orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
      },
    },
  },
} satisfies Prisma.CategorySelect;

type CategoryWithActivationFields = Prisma.CategoryGetPayload<{
  select: typeof categoryActivationFieldsSelect;
}>;

export function toActivationFieldsResponse(
  category: CategoryWithActivationFields,
): CategoryActivationFieldsResponse {
  return {
    categoryId: category.id,
    activationFormEnabled: category.activation_form_enabled,
    activationFields: category.activation_fields.map((field) => ({
      id: field.id,
      key: field.key,
      label: field.label,
      type: field.type,
      placeholder: field.placeholder ?? undefined,
      required: field.required,
      order: field.sort_order,
      options: field.options.map((option) => ({
        id: option.id,
        label: option.label,
        value: option.value,
      })),
    })),
  };
}
