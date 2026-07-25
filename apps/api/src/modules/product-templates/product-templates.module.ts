import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { ProductTemplatesController } from '@/modules/product-templates/product-templates.controller';
import { ProductTemplatesRepository } from '@/modules/product-templates/repository/product-templates.repository';
import { ListProductTemplatesUseCase } from '@/modules/product-templates/use-cases/list-product-templates.use-case';
import { CreateProductTemplateUseCase } from '@/modules/product-templates/use-cases/create-product-template.use-case';
import { DeactivateProductTemplateUseCase } from '@/modules/product-templates/use-cases/deactivate-product-template.use-case';
import { GetProductTemplateDetailUseCase } from '@/modules/product-templates/use-cases/get-product-template-detail.use-case';
import { UpdateProductTemplateUseCase } from '@/modules/product-templates/use-cases/update-product-template.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [AssetsModule, PrismaModule],
  controllers: [ProductTemplatesController],
  providers: [
    ProductTemplatesRepository,
    ListProductTemplatesUseCase,
    GetProductTemplateDetailUseCase,
    CreateProductTemplateUseCase,
    UpdateProductTemplateUseCase,
    DeactivateProductTemplateUseCase,
  ],
  exports: [ProductTemplatesRepository],
})
export class ProductTemplatesModule {}
