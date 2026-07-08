import { NotFoundError } from '@/common/response';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeactivateCategoryUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(id: string) {
    const existingCategory = await this.categoriesRepository.findById(id);

    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    const category = await this.categoriesRepository.update(id, {
      is_active: false,
    });

    return toCategoryResponse(category);
  }
}
