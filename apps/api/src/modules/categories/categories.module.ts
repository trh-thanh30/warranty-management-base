import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { CategoriesController } from '@/modules/categories/categories.controller';
import { CategoriesRepository } from '@/modules/categories/repository/categories.repository';
import { CreateCategoryUseCase } from '@/modules/categories/use-cases/create-category.use-case';
import { DeactivateCategoryUseCase } from '@/modules/categories/use-cases/deactivate-category.use-case';
import { GetCategoryDetailUseCase } from '@/modules/categories/use-cases/get-category-detail.use-case';
import { ListCategoriesUseCase } from '@/modules/categories/use-cases/list-categories.use-case';
import { ReorderCategoriesUseCase } from '@/modules/categories/use-cases/reorder-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/categories/use-cases/update-category.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [AssetsModule, PrismaModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesRepository,
    CreateCategoryUseCase,
    ListCategoriesUseCase,
    GetCategoryDetailUseCase,
    ReorderCategoriesUseCase,
    UpdateCategoryUseCase,
    DeactivateCategoryUseCase,
  ],
  exports: [CategoriesRepository],
})
export class CategoriesModule {}
