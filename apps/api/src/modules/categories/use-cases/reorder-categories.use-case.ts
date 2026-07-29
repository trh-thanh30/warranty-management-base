import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import { ReorderCategoriesDto } from '@/modules/categories/dto/reorder-categories.dto';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { CategoryHierarchyService } from '@/modules/categories/service/category-hierarchy.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReorderCategoriesUseCase {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly categoryHierarchyService: CategoryHierarchyService,
  ) {}

  async execute(dto: ReorderCategoriesDto) {
    const uniqueIds = new Set(dto.items.map((item) => item.id));

    if (uniqueIds.size !== dto.items.length) {
      throw new BadRequestError('Category reorder items must be unique');
    }

    const categories = await this.categoriesRepository.findByIds([
      ...uniqueIds,
    ]);
    if (categories.length !== dto.items.length) {
      throw new NotFoundError('One or more categories were not found');
    }

    const type = categories[0]?.type;
    if (!type || categories.some((category) => category.type !== type)) {
      throw new ConflictError(
        'Categories in one reorder request must have the same type',
      );
    }

    await this.categoryHierarchyService.validateParentAssignment({
      categoryIds: [...uniqueIds],
      parentId: dto.parentId,
      type,
    });

    const updatedCategories = await this.categoriesRepository.reorder({
      parentId: dto.parentId ?? null,
      items: dto.items,
    });

    return updatedCategories.map(toCategoryResponse);
  }
}
