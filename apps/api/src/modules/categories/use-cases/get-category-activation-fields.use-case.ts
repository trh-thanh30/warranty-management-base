import { NotFoundError } from '@/common/response';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetCategoryActivationFieldsUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(categoryId: string) {
    const config =
      await this.categoriesRepository.getActivationFields(categoryId);

    if (!config) {
      throw new NotFoundError('Category not found');
    }

    return config;
  }
}
