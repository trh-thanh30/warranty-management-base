import { ConflictError, NotFoundError } from '@/common/response';
import { AssetsService } from '@/modules/assets/assets.service';
import { toCategoryResponse } from '@/modules/categories/categories.types';
import { UpdateCategoryDto } from '@/modules/categories/dto/update-category.dto';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { CategoryHierarchyService } from '@/modules/categories/service/category-hierarchy.service';
import { Injectable } from '@nestjs/common';
import { asset_type, Prisma } from '@prisma/client';
import { getRemovedMediaUrls } from '@repo/shared/utils';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly categoryHierarchyService: CategoryHierarchyService,
    private readonly assetsService: AssetsService,
  ) {}

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

    await this.categoryHierarchyService.validateParentAssignment({
      categoryIds: [id],
      parentId: dto.parentId,
      type: existingCategory.type,
    });

    const metadata = dto.metadata as Prisma.InputJsonValue | undefined;
    const nextImageUrl =
      dto.imageUrl === null ? null : (dto.imageUrl?.trim() ?? undefined);

    if (
      nextImageUrl !== undefined &&
      existingCategory.image_url &&
      existingCategory.image_url !== nextImageUrl
    ) {
      await this.assetsService.deleteAssetByUrl(existingCategory.image_url, {
        folder: 'categories',
        types: [asset_type.IMAGE],
      });
    }

    const nextDescription =
      dto.description === null
        ? ''
        : (dto.description?.trim() ?? existingCategory.description ?? '');

    if (dto.description !== undefined) {
      for (const url of getRemovedMediaUrls(
        existingCategory.description ?? '',
        nextDescription,
      )) {
        await this.assetsService.deleteAssetByUrl(url, {
          folder: 'rich-text',
          types: [asset_type.IMAGE, asset_type.VIDEO],
        });
      }
    }

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
      image_url: nextImageUrl,
      order: dto.order,
      is_active: dto.isActive,
      metadata,
    });

    return toCategoryResponse(category);
  }
}
