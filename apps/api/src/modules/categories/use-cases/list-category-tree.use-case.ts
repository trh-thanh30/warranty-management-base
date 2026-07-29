import {
  buildCategoryTree,
  countCategoryTreeNodes,
} from '@/modules/categories/category-tree.utils';
import { ListCategoryTreeDto } from '@/modules/categories/dto/list-category-tree.dto';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';
import type { CategoryTreeResponse } from '@repo/shared';

@Injectable()
export class ListCategoryTreeUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(dto: ListCategoryTreeDto): Promise<CategoryTreeResponse> {
    const categories = await this.categoriesRepository.listByType(dto.type);
    const items = buildCategoryTree(categories, {
      filter: {
        isActive:
          dto.isActive === undefined ? undefined : dto.isActive === 'true',
        search: dto.search,
      },
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
    });
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const totalRoots = items.length;
    const totalCategories = countCategoryTreeNodes(items);
    const totalPages = Math.ceil(totalRoots / limit);
    const start = (page - 1) * limit;

    return {
      items: items.slice(start, start + limit),
      meta: {
        page,
        limit,
        totalRoots,
        totalCategories,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
