import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/common/response';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import { ReorderCategoriesDto } from '@/modules/categories/dto/reorder-categories.dto';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';

@Injectable()
export class ReorderCategoriesUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

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

    const parent = dto.parentId
      ? await this.categoriesRepository.findById(dto.parentId)
      : null;

    if (dto.parentId && !parent) {
      throw new NotFoundError('Parent category not found');
    }

    if (parent && parent.type !== type) {
      throw new ConflictError('Parent category must have the same type');
    }

    for (const category of categories) {
      await this.assertParentDoesNotCreateCycle(category.id, parent);
    }

    const updatedCategories = await this.categoriesRepository.reorder({
      parentId: dto.parentId ?? null,
      items: dto.items,
    });

    return updatedCategories.map(toCategoryResponse);
  }

  private async assertParentDoesNotCreateCycle(
    categoryId: string,
    parent: Category | null,
  ) {
    let cursor = parent;
    const visited = new Set<string>();

    while (cursor) {
      if (cursor.id === categoryId) {
        throw new ConflictError('Category parent would create a cycle');
      }

      if (visited.has(cursor.id)) {
        throw new ConflictError('Existing category hierarchy contains a cycle');
      }

      visited.add(cursor.id);

      if (!cursor.parent_id) {
        return;
      }

      cursor = await this.categoriesRepository.findById(cursor.parent_id);
    }
  }
}
