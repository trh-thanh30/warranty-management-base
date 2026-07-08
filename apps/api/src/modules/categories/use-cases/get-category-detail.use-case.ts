import { NotFoundError } from '@/common/response';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetCategoryDetailUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(id: string) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return toCategoryResponse(category);
  }
}
