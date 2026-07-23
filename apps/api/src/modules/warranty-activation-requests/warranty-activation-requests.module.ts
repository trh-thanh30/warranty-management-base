import { PrismaModule } from '@/database/prisma/prisma.module';
import { CustomersModule } from '@/modules/customers/customers.module';
import { ProductsModule } from '@/modules/products/products.module';
import { WarrantyCertificatesModule } from '@/modules/warranty-certificates/warranty-certificates.module';
import { WarrantiesModule } from '@/modules/warranties/warranties.module';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { CreateAdminWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-admin-warranty-activation-request.use-case';
import { ExportWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/export-warranty-activation-requests.use-case';
import { GenerateWarrantyActivationRequestCodeUseCase } from '@/modules/warranty-activation-requests/use-cases/generate-warranty-activation-request-code.use-case';
import { GetWarrantyActivationRequestDetailUseCase } from '@/modules/warranty-activation-requests/use-cases/get-warranty-activation-request-detail.use-case';
import { ListWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/list-warranty-activation-requests.use-case';
import { ReviewWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/review-warranty-activation-request.use-case';
import { WarrantyActivationRequestsController } from '@/modules/warranty-activation-requests/warranty-activation-requests.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CustomersModule,
    PrismaModule,
    ProductsModule,
    WarrantyCertificatesModule,
    WarrantiesModule,
  ],
  controllers: [WarrantyActivationRequestsController],
  providers: [
    WarrantyActivationRequestsRepository,
    CreateAdminWarrantyActivationRequestUseCase,
    GenerateWarrantyActivationRequestCodeUseCase,
    CreateWarrantyActivationRequestUseCase,
    ExportWarrantyActivationRequestsUseCase,
    ListWarrantyActivationRequestsUseCase,
    GetWarrantyActivationRequestDetailUseCase,
    ReviewWarrantyActivationRequestUseCase,
  ],
  exports: [
    CreateWarrantyActivationRequestUseCase,
    WarrantyActivationRequestsRepository,
  ],
})
export class WarrantyActivationRequestsModule {}
