import { VoidWarrantyDto } from '@/modules/warranties/dto/void-warranty.dto';
import { WarrantiesRepository } from '@/modules/warranties/repository/warranties.repository';
import { WarrantyLifecycleService } from '@/modules/warranties/services/warranty-lifecycle.service';
import { toWarrantyResponse } from '@/modules/warranties/warranties.types';
import { Injectable } from '@nestjs/common';
import {
  DealerAccessPolicy,
  type DealerAccessActor,
} from '@/modules/dealers/service/dealer-access.policy';

@Injectable()
export class VoidWarrantyUseCase {
  constructor(
    private readonly warrantiesRepository: WarrantiesRepository,
    private readonly warrantyLifecycleService: WarrantyLifecycleService,
    private readonly dealerAccessPolicy?: DealerAccessPolicy,
  ) {}

  async execute(
    warrantyId: string,
    dto: VoidWarrantyDto,
    context: { voidedByUserId: string; actor?: DealerAccessActor },
  ) {
    if (context.actor) {
      const candidate = await this.warrantiesRepository.findById(warrantyId);
      await this.dealerAccessPolicy!.assertCanAccessRecord(
        context.actor,
        candidate?.dealer_id,
      );
    }
    const warranty = await this.warrantiesRepository.withTransaction(
      (repository) =>
        this.warrantyLifecycleService.voidWarranty(repository, {
          reason: dto.reason,
          voidedByUserId: context.voidedByUserId,
          warrantyId,
        }),
    );

    return toWarrantyResponse(warranty);
  }
}
