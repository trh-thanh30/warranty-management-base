import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { CustomersModule } from '@/modules/customers/customers.module';
import { DealersModule } from '@/modules/dealers/dealers.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { ProductsModule } from '@/modules/products/products.module';
import { WarrantiesModule } from '@/modules/warranties/warranties.module';
import { WarrantyActivationRequestsRepository } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository';
import { WarrantyActivationRequestQueries } from '@/modules/warranty-activation-requests/repository/warranty-activation-requests.repository.queries';
import { ActivationRequestItemsValidatorService } from '@/modules/warranty-activation-requests/service/activation-request-items-validator.service';
import { WarrantyActivationRequestNotificationService } from '@/modules/warranty-activation-requests/service/warranty-activation-request-notification.service';
import { CreateAdminWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-admin-warranty-activation-request.use-case';
import { CreateWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/create-warranty-activation-request.use-case';
import { DownloadWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-activation-requests/use-cases/download-warranty-activation-request-certificate.use-case';
import { ExportWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/export-warranty-activation-requests.use-case';
import { GenerateWarrantyActivationRequestCodeUseCase } from '@/modules/warranty-activation-requests/use-cases/generate-warranty-activation-request-code.use-case';
import { GetWarrantyActivationRequestDetailUseCase } from '@/modules/warranty-activation-requests/use-cases/get-warranty-activation-request-detail.use-case';
import { ListWarrantyActivationRequestsUseCase } from '@/modules/warranty-activation-requests/use-cases/list-warranty-activation-requests.use-case';
import { ResendWarrantyActivationRequestCertificateEmailUseCase } from '@/modules/warranty-activation-requests/use-cases/resend-warranty-activation-request-certificate-email.use-case';
import { RetryWarrantyActivationRequestCertificateUseCase } from '@/modules/warranty-activation-requests/use-cases/retry-warranty-activation-request-certificate.use-case';
import { ReviewWarrantyActivationRequestUseCase } from '@/modules/warranty-activation-requests/use-cases/review-warranty-activation-request.use-case';
import { WarrantyActivationRequestsController } from '@/modules/warranty-activation-requests/warranty-activation-requests.controller';
import { WarrantyCertificatesModule } from '@/modules/warranty-certificates/modules/warranty-certificates.module';
import { ActivationCodesModule } from '@/modules/activation-codes/activation-codes.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AssetsModule,
    ActivationCodesModule,
    CategoriesModule,
    CustomersModule,
    DealersModule,
    NotificationModule,
    PrismaModule,
    ProductsModule,
    WarrantyCertificatesModule,
    WarrantiesModule,
  ],
  controllers: [WarrantyActivationRequestsController],
  providers: [
    WarrantyActivationRequestQueries,
    WarrantyActivationRequestsRepository,
    WarrantyActivationRequestNotificationService,
    ActivationRequestItemsValidatorService,
    CreateAdminWarrantyActivationRequestUseCase,
    GenerateWarrantyActivationRequestCodeUseCase,
    CreateWarrantyActivationRequestUseCase,
    DownloadWarrantyActivationRequestCertificateUseCase,
    ExportWarrantyActivationRequestsUseCase,
    ListWarrantyActivationRequestsUseCase,
    GetWarrantyActivationRequestDetailUseCase,
    ReviewWarrantyActivationRequestUseCase,
    ResendWarrantyActivationRequestCertificateEmailUseCase,
    RetryWarrantyActivationRequestCertificateUseCase,
  ],
  exports: [
    CreateWarrantyActivationRequestUseCase,
    WarrantyActivationRequestsRepository,
  ],
})
export class WarrantyActivationRequestsModule {}
