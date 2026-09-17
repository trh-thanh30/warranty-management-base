import { DealersModule } from '@/modules/dealers/dealers.module';
import { ServiceCentersModule } from '@/modules/service-centers/service-centers.module';
import { ProductsModule } from '@/modules/products/products.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { PublicController } from '@/modules/public/public.controller';
import { PublicListServiceCentersUseCase } from '@/modules/public/use-cases/public-list-service-centers.use-case';
import { PublicListNetworkLocationsUseCase } from '@/modules/public/use-cases/public-list-network-locations.use-case';
import { PublicListDealersUseCase } from '@/modules/public/use-cases/public-list-dealers.use-case';
import { PublicListDealerFilterOptionsUseCase } from '@/modules/public/use-cases/public-list-dealer-filter-options.use-case';
import { PublicListNetworkDirectoryUseCase } from '@/modules/public/use-cases/public-list-network-directory.use-case';
import { PublicListNetworkDirectoryFilterOptionsUseCase } from '@/modules/public/use-cases/public-list-network-directory-filter-options.use-case';
import { PublicLookupWarrantyClaimByCodeUseCase } from '@/modules/public/use-cases/public-lookup-warranty-claim-by-code.use-case';
import { PublicLookupWarrantyClaimsByWarrantyCodeUseCase } from '@/modules/public/use-cases/public-lookup-warranty-claims-by-warranty-code.use-case';
import { CreatePublicWarrantyClaimUseCase } from '@/modules/public/use-cases/create-public-warranty-claim.use-case';
import { CreatePublicWarrantyActivationRequestUseCase } from '@/modules/public/use-cases/create-public-warranty-activation-request.use-case';
import { PublicLookupWarrantyActivationRequestUseCase } from '@/modules/public/use-cases/public-lookup-warranty-activation-request.use-case';
import { WarrantyClaimsModule } from '@/modules/warranty-claims/warranty-claims.module';
import { WarrantyActivationRequestsModule } from '@/modules/warranty-activation-requests/warranty-activation-requests.module';
import { WarrantiesModule } from '@/modules/warranties/warranties.module';
import { Module } from '@nestjs/common';
import { PublicSubmissionAbuseInterceptor } from '@/modules/public/interceptors/public-submission-abuse.interceptor';
import { PublicSubmissionProtectionModule } from '@/modules/public-submission-protection/public-submission-protection.module';

@Module({
  imports: [
    WarrantiesModule,
    WarrantyActivationRequestsModule,
    WarrantyClaimsModule,
    ServiceCentersModule,
    DealersModule,
    ProductsModule,
    CategoriesModule,
    PublicSubmissionProtectionModule,
  ],
  controllers: [PublicController],
  providers: [
    PublicListServiceCentersUseCase,
    PublicListNetworkLocationsUseCase,
    PublicListDealersUseCase,
    PublicListDealerFilterOptionsUseCase,
    PublicListNetworkDirectoryUseCase,
    PublicListNetworkDirectoryFilterOptionsUseCase,
    PublicLookupWarrantyClaimByCodeUseCase,
    PublicLookupWarrantyClaimsByWarrantyCodeUseCase,
    CreatePublicWarrantyClaimUseCase,
    CreatePublicWarrantyActivationRequestUseCase,
    PublicLookupWarrantyActivationRequestUseCase,
    PublicSubmissionAbuseInterceptor,
  ],
})
export class PublicModule {}
