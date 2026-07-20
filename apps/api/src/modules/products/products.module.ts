import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { ProductsController } from '@/modules/products/products.controller';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { AssignProductOwnerUseCase } from '@/modules/products/use-cases/assign-product-owner.use-case';
import { CreateProductUseCase } from '@/modules/products/use-cases/create-product.use-case';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { GetProductDetailUseCase } from '@/modules/products/use-cases/get-product-detail.use-case';
import { ListProductsUseCase } from '@/modules/products/use-cases/list-products.use-case';
import { SoftDeleteProductUseCase } from '@/modules/products/use-cases/soft-delete-product.use-case';
import { UpdateProductUseCase } from '@/modules/products/use-cases/update-product.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, AssetsModule],
  controllers: [ProductsController],
  providers: [
    ProductsRepository,
    GenerateWarrantyCodeUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    SoftDeleteProductUseCase,
    ListProductsUseCase,
    GetProductDetailUseCase,
    AssignProductOwnerUseCase,
  ],
  exports: [ProductsRepository],
})
export class ProductsModule {}
