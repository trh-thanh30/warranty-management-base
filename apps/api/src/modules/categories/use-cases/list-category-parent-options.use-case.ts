import { buildCategoryParentOptions } from '@/modules/categories/category-tree.utils';
import { ListCategoryParentOptionsDto } from '@/modules/categories/dto/list-category-parent-options.dto';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';
import type { CategoryParentOption } from '@repo/shared';

@Injectable()
export class ListCategoryParentOptionsUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(
    dto: ListCategoryParentOptionsDto,
  ): Promise<CategoryParentOption[]> {
    const categories = await this.categoriesRepository.listByType(dto.type);
    return buildCategoryParentOptions(categories, dto.currentCategoryId);
  }
}
