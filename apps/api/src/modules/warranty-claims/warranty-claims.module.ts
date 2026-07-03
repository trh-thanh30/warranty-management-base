import { PrismaModule } from '@/database/prisma/prisma.module';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { AssignWarrantyClaimServiceCenterUseCase } from '@/modules/warranty-claims/use-cases/assign-warranty-claim-service-center.use-case';
import { CreateWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/create-warranty-claim.use-case';
import { GenerateWarrantyClaimCodeUseCase } from '@/modules/warranty-claims/use-cases/generate-warranty-claim-code.use-case';
import { GetWarrantyClaimDetailUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-detail.use-case';
import { GetWarrantyClaimTimelineUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-timeline.use-case';
import { ListWarrantyClaimsUseCase } from '@/modules/warranty-claims/use-cases/list-warranty-claims.use-case';
import { LookupWarrantyClaimByCodeUseCase } from '@/modules/warranty-claims/use-cases/lookup-warranty-claim-by-code.use-case';
import { LookupWarrantyClaimsByWarrantyCodeUseCase } from '@/modules/warranty-claims/use-cases/lookup-warranty-claims-by-warranty-code.use-case';
import { UpdateWarrantyClaimStatusUseCase } from '@/modules/warranty-claims/use-cases/update-warranty-claim-status.use-case';
import { WarrantyClaimsController } from '@/modules/warranty-claims/warranty-claims.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [WarrantyClaimsController],
  providers: [
    WarrantyClaimsRepository,
    GenerateWarrantyClaimCodeUseCase,
    CreateWarrantyClaimUseCase,
    ListWarrantyClaimsUseCase,
    GetWarrantyClaimDetailUseCase,
    GetWarrantyClaimTimelineUseCase,
    LookupWarrantyClaimByCodeUseCase,
    LookupWarrantyClaimsByWarrantyCodeUseCase,
    UpdateWarrantyClaimStatusUseCase,
    AssignWarrantyClaimServiceCenterUseCase,
  ],
})
export class WarrantyClaimsModule {}
