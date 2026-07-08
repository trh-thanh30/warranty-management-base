import { PrismaModule } from '@/database/prisma/prisma.module';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { ActivateWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/activate-warranty-by-code.use-case';
import { ActivateWarrantyUseCase } from '@/modules/warranties/use-cases/activate-warranty.use-case';
import { GetMyProductWarrantyUseCase } from '@/modules/warranties/use-cases/get-my-product-warranty.use-case';
import { GetWarrantyByProductUseCase } from '@/modules/warranties/use-cases/get-warranty-by-product.use-case';
import { ListMyProductsUseCase } from '@/modules/warranties/use-cases/list-my-products.use-case';
import { LookupWarrantyByCodeUseCase } from '@/modules/warranties/use-cases/lookup-warranty-by-code.use-case';
import { LookupWarrantyForCustomerUseCase } from '@/modules/warranties/use-cases/lookup-warranty-for-customer.use-case';
import { WarrantiesController } from '@/modules/warranties/warranties.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [WarrantiesController],
  providers: [
    WarrantiesRepository,
    ActivateWarrantyUseCase,
    ActivateWarrantyByCodeUseCase,
    GetWarrantyByProductUseCase,
    LookupWarrantyByCodeUseCase,
    LookupWarrantyForCustomerUseCase,
    ListMyProductsUseCase,
    GetMyProductWarrantyUseCase,
  ],
  exports: [
    ActivateWarrantyByCodeUseCase,
    LookupWarrantyByCodeUseCase,
    WarrantiesRepository,
  ],
})
export class WarrantiesModule {}
