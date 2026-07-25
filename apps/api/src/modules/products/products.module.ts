import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { ProductTemplatesModule } from '@/modules/product-templates/product-templates.module';
import { ProductsController } from '@/modules/products/products.controller';
import { ProductsRepository } from '@/modules/products/repository/products.repository';
import { ProductAssetsRepository } from '@/modules/products/repository/product-assets.repository';
import { AssignProductOwnerUseCase } from '@/modules/products/use-cases/assign-product-owner.use-case';
import { AttachProductAssetUseCase } from '@/modules/products/use-cases/attach-product-asset.use-case';
import { ConfirmProductImportUseCase } from '@/modules/products/use-cases/confirm-product-import.use-case';
import { CreateProductUseCase } from '@/modules/products/use-cases/create-product.use-case';
import { DownloadProductImportTemplateUseCase } from '@/modules/products/use-cases/download-product-import-template.use-case';
import { ExportProductsUseCase } from '@/modules/products/use-cases/export-products.use-case';
import { GenerateWarrantyCodeUseCase } from '@/modules/products/use-cases/generate-warranty-code.use-case';
import { GenerateProductCodeUseCase } from '@/modules/products/use-cases/generate-product-code.use-case';
import { GetProductDetailUseCase } from '@/modules/products/use-cases/get-product-detail.use-case';
import { ListProductsUseCase } from '@/modules/products/use-cases/list-products.use-case';
import { ListPublicProductsUseCase } from '@/modules/products/use-cases/list-public-products.use-case';
import { PreviewProductImportUseCase } from '@/modules/products/use-cases/preview-product-import.use-case';
import { SoftDeleteProductUseCase } from '@/modules/products/use-cases/soft-delete-product.use-case';
import { RemoveProductAssetUseCase } from '@/modules/products/use-cases/remove-product-asset.use-case';
import { UpdateProductAssetUseCase } from '@/modules/products/use-cases/update-product-asset.use-case';
import { UpdateProductUseCase } from '@/modules/products/use-cases/update-product.use-case';
import { UpdateProductPublicationUseCase } from '@/modules/products/use-cases/update-product-publication.use-case';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    PrismaModule,
    AssetsModule,
    ProductTemplatesModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [ProductsController],
  providers: [
    ProductsRepository,
    ProductAssetsRepository,
    GenerateProductCodeUseCase,
    GenerateWarrantyCodeUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    UpdateProductPublicationUseCase,
    SoftDeleteProductUseCase,
    ListProductsUseCase,
    ListPublicProductsUseCase,
    GetProductDetailUseCase,
    AssignProductOwnerUseCase,
    AttachProductAssetUseCase,
    UpdateProductAssetUseCase,
    RemoveProductAssetUseCase,
    ConfirmProductImportUseCase,
    DownloadProductImportTemplateUseCase,
    ExportProductsUseCase,
    PreviewProductImportUseCase,
  ],
  exports: [
    GenerateProductCodeUseCase,
    GenerateWarrantyCodeUseCase,
    ProductsRepository,
    ListPublicProductsUseCase,
  ],
})
export class ProductsModule {}
