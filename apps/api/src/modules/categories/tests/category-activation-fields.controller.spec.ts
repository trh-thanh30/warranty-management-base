import 'reflect-metadata';

import { Permissions } from '@/common/decorators/permissions.decorator';
import { CategoriesController } from '@/modules/categories/categories.controller';
import { permission_key } from '@prisma/client';

describe('CategoriesController activation field permissions', () => {
  it('requires category view permission to read configuration', () => {
    expect(
      Reflect.getMetadata(
        Permissions.KEY,
        getControllerMethod('getActivationFields'),
      ),
    ).toEqual([permission_key.CATEGORY_VIEW]);
  });

  it('requires category update permission to replace configuration', () => {
    expect(
      Reflect.getMetadata(
        Permissions.KEY,
        getControllerMethod('updateActivationFields'),
      ),
    ).toEqual([permission_key.CATEGORY_UPDATE]);
  });
});

function getControllerMethod(name: keyof CategoriesController) {
  return Object.getOwnPropertyDescriptor(CategoriesController.prototype, name)
    ?.value as (...args: unknown[]) => unknown;
}
