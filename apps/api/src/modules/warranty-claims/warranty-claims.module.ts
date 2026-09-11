import { PrismaModule } from '@/database/prisma/prisma.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { WarrantyClaimsRepository } from '@/modules/warranty-claims/repository/warranty-claims.repository';
import { WarrantyClaimNotificationService } from '@/modules/warranty-claims/service/warranty-claim-notification.service';
import { WarrantyClaimSlaService } from '@/modules/warranty-claims/service/warranty-claim-sla.service';
import { AssignWarrantyClaimServiceCenterUseCase } from '@/modules/warranty-claims/use-cases/assign-warranty-claim-service-center.use-case';
import { CompleteWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/complete-warranty-claim.use-case';
import { CreateWarrantyClaimUseCase } from '@/modules/warranty-claims/use-cases/create-warranty-claim.use-case';
import { ExportWarrantyClaimsUseCase } from '@/modules/warranty-claims/use-cases/export-warranty-claims.use-case';
import { GenerateWarrantyClaimCodeUseCase } from '@/modules/warranty-claims/use-cases/generate-warranty-claim-code.use-case';
import { GetWarrantyClaimDetailUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-detail.use-case';
import { GetWarrantyClaimMetricsUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-metrics.use-case';
import { GetWarrantyClaimTimelineUseCase } from '@/modules/warranty-claims/use-cases/get-warranty-claim-timeline.use-case';
import { LinkWarrantyClaimAssetUseCase } from '@/modules/warranty-claims/use-cases/link-warranty-claim-asset.use-case';
import { ListWarrantyClaimAssetsUseCase } from '@/modules/warranty-claims/use-cases/list-warranty-claim-assets.use-case';
import { ListWarrantyClaimsUseCase } from '@/modules/warranty-claims/use-cases/list-warranty-claims.use-case';
import { LookupWarrantyClaimByCodeUseCase } from '@/modules/warranty-claims/use-cases/lookup-warranty-claim-by-code.use-case';
import { LookupWarrantyClaimsByWarrantyCodeUseCase } from '@/modules/warranty-claims/use-cases/lookup-warranty-claims-by-warranty-code.use-case';
import { UnlinkWarrantyClaimAssetUseCase } from '@/modules/warranty-claims/use-cases/unlink-warranty-claim-asset.use-case';
import { UpdateWarrantyClaimPriorityUseCase } from '@/modules/warranty-claims/use-cases/update-warranty-claim-priority.use-case';
import { UpdateWarrantyClaimStatusUseCase } from '@/modules/warranty-claims/use-cases/update-warranty-claim-status.use-case';
import { WarrantyClaimsController } from '@/modules/warranty-claims/warranty-claims.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [AssetsModule, PrismaModule, NotificationModule],
  controllers: [WarrantyClaimsController],
  providers: [
    WarrantyClaimsRepository,
    WarrantyClaimSlaService,
    WarrantyClaimNotificationService,
    GenerateWarrantyClaimCodeUseCase,
    CreateWarrantyClaimUseCase,
    ExportWarrantyClaimsUseCase,
    ListWarrantyClaimsUseCase,
    GetWarrantyClaimDetailUseCase,
    GetWarrantyClaimMetricsUseCase,
    GetWarrantyClaimTimelineUseCase,
    ListWarrantyClaimAssetsUseCase,
    LinkWarrantyClaimAssetUseCase,
    UnlinkWarrantyClaimAssetUseCase,
    LookupWarrantyClaimByCodeUseCase,
    LookupWarrantyClaimsByWarrantyCodeUseCase,
    UpdateWarrantyClaimStatusUseCase,
    UpdateWarrantyClaimPriorityUseCase,
    AssignWarrantyClaimServiceCenterUseCase,
    CompleteWarrantyClaimUseCase,
  ],
  exports: [
    CreateWarrantyClaimUseCase,
    LookupWarrantyClaimByCodeUseCase,
    WarrantyClaimsRepository,
  ],
})
export class WarrantyClaimsModule {}
