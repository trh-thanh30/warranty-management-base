import { ConflictError, NotFoundError } from '@/common/response';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import { UpdateCategoryDto } from '@/modules/categories/dto/update-category.dto';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(id: string, dto: UpdateCategoryDto) {
    const existingCategory = await this.categoriesRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    if (dto.slug && dto.slug !== existingCategory.slug) {
      const categoryWithSlug =
        await this.categoriesRepository.findByTypeAndSlug(
          existingCategory.type,
          dto.slug,
        );
      if (categoryWithSlug && categoryWithSlug.id !== id) {
        throw new ConflictError('Category slug already exists for this type');
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new ConflictError('Category cannot be its own parent');
      }

      const parent = await this.categoriesRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundError('Parent category not found');
      }

      if (parent.type !== existingCategory.type) {
        throw new ConflictError('Parent category must have the same type');
      }
    }

    const metadata = dto.metadata as Prisma.InputJsonValue | undefined;
    const category = await this.categoriesRepository.update(id, {
      code:
        dto.code === null
          ? null
          : (dto.code?.trim().toUpperCase() ?? undefined),
      slug: dto.slug?.trim(),
      name: dto.name?.trim(),
      description:
        dto.description === null
          ? null
          : (dto.description?.trim() ?? undefined),
      parent:
        dto.parentId === null
          ? { disconnect: true }
          : dto.parentId
            ? { connect: { id: dto.parentId } }
            : undefined,
      icon: dto.icon === null ? null : (dto.icon?.trim() ?? undefined),
      image_url:
        dto.imageUrl === null ? null : (dto.imageUrl?.trim() ?? undefined),
      order: dto.order,
      is_active: dto.isActive,
      metadata,
    });

    return toCategoryResponse(category);
  }
}
