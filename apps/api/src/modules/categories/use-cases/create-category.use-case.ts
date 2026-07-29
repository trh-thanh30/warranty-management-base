import { ConflictError } from '@/common/response';
import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { CategoryHierarchyService } from '@/modules/categories/service/category-hierarchy.service';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly categoryHierarchyService: CategoryHierarchyService,
  ) {}

  async execute(dto: CreateCategoryDto) {
    const slug = dto.slug?.trim() ?? this.slugify(dto.name);
    const existingCategory = await this.categoriesRepository.findByTypeAndSlug(
      dto.type,
      slug,
    );

    if (existingCategory) {
      throw new ConflictError('Category slug already exists for this type');
    }

    await this.categoryHierarchyService.validateParentAssignment({
      categoryIds: [],
      parentId: dto.parentId,
      type: dto.type,
    });

    const metadata = dto.metadata as Prisma.InputJsonObject | undefined;
    const category = await this.categoriesRepository.create({
      type: dto.type,
      code: dto.code?.trim().toUpperCase(),
      slug,
      name: dto.name.trim(),
      description: dto.description?.trim(),
      parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
      icon: dto.icon?.trim(),
      image_url: dto.imageUrl?.trim(),
      order: dto.order ?? 0,
      is_active: dto.isActive ?? true,
      metadata,
    });

    return toCategoryResponse(category);
  }

  private slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
