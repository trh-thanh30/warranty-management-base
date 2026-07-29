import { ConflictError, NotFoundError } from '@/common/response';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';
import { Category, category_type } from '@prisma/client';

@Injectable()
export class CategoryHierarchyService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async validateParentAssignment(input: {
    categoryIds: string[];
    parentId?: string | null;
    type: category_type;
  }): Promise<Category | null> {
    if (!input.parentId) return null;

    const categoryIds = new Set(input.categoryIds);
    if (categoryIds.has(input.parentId)) {
      throw new ConflictError('Category cannot be its own parent');
    }

    const parent = await this.categoriesRepository.findById(input.parentId);
    if (!parent) {
      throw new NotFoundError('Parent category not found');
    }

    if (parent.type !== input.type) {
      throw new ConflictError('Parent category must have the same type');
    }

    await this.assertAncestorChainDoesNotContain(categoryIds, parent);
    return parent;
  }

  private async assertAncestorChainDoesNotContain(
    categoryIds: Set<string>,
    parent: Category,
  ) {
    let cursor: Category | null = parent;
    const visited = new Set<string>();

    while (cursor) {
      if (categoryIds.has(cursor.id)) {
        throw new ConflictError('Category parent would create a cycle');
      }

      if (visited.has(cursor.id)) {
        throw new ConflictError('Existing category hierarchy contains a cycle');
      }

      visited.add(cursor.id);
      if (!cursor.parent_id) return;

      cursor = await this.categoriesRepository.findById(cursor.parent_id);
    }
  }
}
