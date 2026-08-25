import { PrismaModule } from '@/database/prisma/prisma.module';
import { CustomersModule } from '@/modules/customers/customers.module';
import { UsersModule } from '@/modules/user/user.module';
import { ProductsModule } from '@/modules/products/products.module';
import { WarrantyCertificatesModule } from '@/modules/warranty-certificates/warranty-certificates.module';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { ActivateWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/activate-warranty-by-code.use-case';
import { ActivateWarrantyUseCase } from '@/modules/warranties/use-cases/activate-warranty.use-case';
import { GetMyProductWarrantyUseCase } from '@/modules/warranties/use-cases/get-my-product-warranty.use-case';
import { GetWarrantyDetailUseCase } from '@/modules/warranties/use-cases/get-warranty-detail.use-case';
import { GetWarrantyByProductUseCase } from '@/modules/warranties/use-cases/get-warranty-by-product.use-case';
import { ListMyProductsUseCase } from '@/modules/warranties/use-cases/list-my-products.use-case';
import { ListWarrantiesUseCase } from '@/modules/warranties/use-cases/list-warranties.use-case';
import { LookupWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/lookup-warranty-by-code.use-case';
import { LookupWarrantyForCustomerUseCase } from '@/modules/warranties/use-cases/lookup-warranty-for-customer.use-case';
import { ManualWarrantyActivationUseCase } from '@/modules/warranties/use-cases/manual-warranty-activation.use-case';
import { DownloadWarrantyImportTemplateUseCase } from '@/modules/warranties/use-cases/download-warranty-import-template.use-case';
import { ExportWarrantiesUseCase } from '@/modules/warranties/use-cases/export-warranties.use-case';
import { PreviewWarrantyImportUseCase } from '@/modules/warranties/use-cases/preview-warranty-import.use-case';
import { UpdateWarrantyUseCase } from '@/modules/warranties/use-cases/update-warranty.use-case';
import { VoidWarrantyUseCase } from '@/modules/warranties/use-cases/void-warranty.use-case';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import { WarrantiesController } from '@/modules/warranties/warranties.controller';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    PrismaModule,
    CustomersModule,
    UsersModule,
    ProductsModule,
    WarrantyCertificatesModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [WarrantiesController],
  providers: [
    WarrantiesRepository,
    WarrantyLifecycleService,
    ActivateWarrantyUseCase,
    ActivateWarrantyByCodeUseCase,
    GetWarrantyDetailUseCase,
    GetWarrantyByProductUseCase,
    ListWarrantiesUseCase,
    LookupWarrantyByCodeUseCase,
    LookupWarrantyForCustomerUseCase,
    ListMyProductsUseCase,
    GetMyProductWarrantyUseCase,
    ManualWarrantyActivationUseCase,
    DownloadWarrantyImportTemplateUseCase,
    ExportWarrantiesUseCase,
    PreviewWarrantyImportUseCase,
    UpdateWarrantyUseCase,
    VoidWarrantyUseCase,
  ],
  exports: [
    ActivateWarrantyByCodeUseCase,
    LookupWarrantyByCodeUseCase,
    WarrantiesRepository,
    WarrantyLifecycleService,
  ],
})
export class WarrantiesModule {}
