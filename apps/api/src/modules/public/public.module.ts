import { ServiceCentersModule } from '@/modules/service-centers/service-centers.module';
import { PublicController } from '@/modules/public/public.controller';
import { PublicListServiceCentersUseCase } from '@/modules/public/use-cases/public-list-service-centers.use-case';
import { PublicLookupWarrantyClaimByCodeUseCase } from '@/modules/public/use-cases/public-lookup-warranty-claim-by-code.use-case';
import { PublicLookupWarrantyClaimsByWarrantyCodeUseCase } from '@/modules/public/use-cases/public-lookup-warranty-claims-by-warranty-code.use-case';
import { WarrantyClaimsModule } from '@/modules/warranty-claims/warranty-claims.module';
import { WarrantyActivationRequestsModule } from '@/modules/warranty-activation-requests/warranty-activation-requests.module';
import { WarrantiesModule } from '@/modules/warranties/warranties.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    WarrantiesModule,
    WarrantyActivationRequestsModule,
    WarrantyClaimsModule,
    ServiceCentersModule,
  ],
  controllers: [PublicController],
  providers: [
    PublicListServiceCentersUseCase,
    PublicLookupWarrantyClaimByCodeUseCase,
    PublicLookupWarrantyClaimsByWarrantyCodeUseCase,
  ],
})
export class PublicModule {}
