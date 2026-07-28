import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { ListPublicProductCategoriesDto } from '@/modules/categories/dto/list-public-product-categories.dto';
import { Injectable } from '@nestjs/common';
import type { PaginatedResponse, PublicProductCategory } from '@repo/shared';

@Injectable()
export class ListPublicProductCategoriesUseCase {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async execute(
    query: ListPublicProductCategoriesDto,
  ): Promise<PaginatedResponse<PublicProductCategory>> {
    const result =
      await this.categoriesRepository.listPublicProductCategories(query);

    return {
      items: result.items.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        parentId: category.parent_id,
        icon: category.icon,
        imageUrl: category.image_url,
        order: category.order,
        productCount: category._count.product_templates,
      })),
      meta: result.meta,
    };
  }
}
